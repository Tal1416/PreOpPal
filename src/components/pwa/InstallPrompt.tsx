"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const DISMISS_KEY = "preoppal-install-dismissed";
const SHOW_DELAY_MS = 8000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isIDevice = /iPad|iPhone|iPod/.test(ua);
  // iPadOS 13+ reports as MacIntel with touch support
  const isIPadDesktop =
    navigator.platform === "MacIntel" &&
    "maxTouchPoints" in navigator &&
    (navigator as Navigator & { maxTouchPoints: number }).maxTouchPoints > 1;
  return isIDevice || isIPadDesktop;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari
  return (
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export default function InstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // ignore
    }

    setIos(isIOS());

    const onBefore = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
      // Defer a moment so it doesn't fight the page-enter animation.
      setTimeout(() => setVisible(true), 600);
    };
    window.addEventListener("beforeinstallprompt", onBefore);

    // iOS has no install event — show the manual guide after a delay
    // if we're clearly on iOS Safari and not already installed.
    const iosTimer = isIOS()
      ? window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
      : null;

    return () => {
      window.removeEventListener("beforeinstallprompt", onBefore);
      if (iosTimer) clearTimeout(iosTimer);
    };
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") {
      try {
        localStorage.setItem(DISMISS_KEY, "installed");
      } catch {
        // ignore
      }
    }
    setVisible(false);
    setEvent(null);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="install"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="fixed z-[120] left-3 right-3 bottom-3 md:left-auto md:right-6 md:bottom-6 md:w-[380px] pointer-events-auto"
        >
          <div className="glass-card-strong rounded-3xl shadow-glass-lg overflow-hidden">
            <div
              className="relative px-5 pt-5 pb-4 flex items-start gap-4"
              style={{
                background:
                  "linear-gradient(135deg, rgba(172,237,255,0.45), rgba(136,209,229,0.25) 50%, rgba(255,255,255,0))",
              }}
            >
              <motion.div
                className="relative h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #acedff 0%, #88d1e5 35%, #2a7a8c 70%, #006172 100%)",
                  boxShadow:
                    "0 14px 26px -8px rgba(0,97,114,0.55), 0 0 0 3px rgba(255,255,255,0.4) inset",
                }}
                animate={{ rotate: [0, -3, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="material-symbols-outlined text-white text-[28px] drop-shadow">
                  favorite
                </span>
                <motion.span
                  aria-hidden
                  className="absolute inset-0 ring-2 ring-white/60 rounded-2xl"
                  animate={{ opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                  Install PreOpPal
                </p>
                <h3 className="mt-0.5 text-[17px] font-extrabold text-on-surface leading-tight">
                  Keep Pal one tap away.
                </h3>
                <p className="mt-1 text-[13px] text-on-surface-variant leading-snug">
                  {ios
                    ? "Add to your Home Screen for a native, full-screen experience — no app store."
                    : "Install the app for a faster, full-screen experience. No app store needed."}
                </p>
              </div>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="p-1 -m-1 rounded-full hover:bg-black/5 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            {ios ? (
              <div className="px-5 pb-4 pt-1">
                <div className="rounded-2xl bg-white/70 border border-white/60 p-3 flex items-center gap-3">
                  <div className="flex flex-col gap-1.5 text-[12px] text-on-surface-variant font-medium">
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold inline-flex items-center justify-center">
                        1
                      </span>
                      Tap the{" "}
                      <span className="inline-flex items-center justify-center h-5 w-5 rounded-md bg-white border border-on-surface/15 text-primary">
                        <svg
                          viewBox="0 0 24 24"
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 3v12" />
                          <path d="m7 8 5-5 5 5" />
                          <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                        </svg>
                      </span>{" "}
                      Share icon
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold inline-flex items-center justify-center">
                        2
                      </span>
                      Choose{" "}
                      <strong className="text-on-surface">
                        Add to Home Screen
                      </strong>
                    </span>
                  </div>
                </div>
                <motion.div
                  className="mt-3 flex justify-end pr-1 text-primary"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  aria-hidden
                >
                  <span className="material-symbols-outlined text-[28px]">
                    arrow_downward
                  </span>
                </motion.div>
                <button
                  onClick={dismiss}
                  className="w-full mt-1 py-2.5 rounded-2xl bg-white/80 border border-white/70 text-primary text-sm font-bold hover:bg-white"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="px-5 pb-5 flex gap-2">
                <button
                  onClick={dismiss}
                  className="flex-1 py-3 rounded-2xl bg-white/80 border border-white/70 text-on-surface-variant text-sm font-bold hover:bg-white"
                >
                  Not now
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={install}
                  className="flex-1 py-3 rounded-2xl bg-primary text-on-primary text-sm font-extrabold flex items-center justify-center gap-1.5 shadow-[0_10px_24px_-8px_rgba(0,97,114,0.55)]"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    download
                  </span>
                  Install
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
