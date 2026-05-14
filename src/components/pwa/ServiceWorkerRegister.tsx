"use client";

import { useEffect } from "react";

/**
 * Registers /sw.js after the page is interactive. Intentionally silent on
 * failure — the demo still works without the SW; PWA install is a bonus.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          // When a new SW takes over, gently reload so the user gets the latest.
          reg.addEventListener("updatefound", () => {
            const next = reg.installing;
            if (!next) return;
            next.addEventListener("statechange", () => {
              if (
                next.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New version available — apply on next nav. Don't force-reload mid-task.
                next.postMessage("SKIP_WAITING");
              }
            });
          });
        })
        .catch(() => {
          // ignore — SW is best-effort
        });
    };

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
