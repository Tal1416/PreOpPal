/* PreOpPal service worker — minimal, demo-grade.
 * Strategy:
 *   - Never cache /api/* (chat is a live stream)
 *   - Network-first for HTML navigation, fall back to last cached copy, then to /offline
 *   - Cache-first for /_next/static, /icons, /fonts — these have hashes/are immutable
 *   - skipWaiting + clients.claim so updates apply on next reload, not next restart
 */
const VERSION = 'preoppal-v1';
const RUNTIME = `${VERSION}-runtime`;
const PRECACHE = [
  '/offline',
  '/icons/icon.svg',
  '/icons/apple-touch-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(RUNTIME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== RUNTIME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never touch API routes — chat is a live SSE-style stream.
  if (url.pathname.startsWith('/api/')) return;

  // HTML navigations: network-first, fall back to cache, then offline page.
  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches
            .match(req)
            .then((cached) => cached || caches.match('/offline')),
        ),
    );
    return;
  }

  // Static assets: cache-first.
  const isStatic =
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname === '/manifest.webmanifest';

  if (isStatic) {
    event.respondWith(
      caches.match(req).then(
        (cached) =>
          cached ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(req, copy));
            return res;
          }),
      ),
    );
  }
});

// Allow the page to trigger an immediate update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
