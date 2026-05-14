"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Live install trigger for the case-study page. If the browser fires
 * beforeinstallprompt we capture it and let the reader install in one tap;
 * otherwise we show a graceful "already installed / unsupported" state.
 */
export default function InstallDemoButton() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [outcome, setOutcome] = useState<"" | "accepted" | "dismissed">("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    ) {
      setInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    setOutcome(choice.outcome);
    if (choice.outcome === "accepted") setInstalled(true);
  }

  const disabled = installed || !event;
  const label = installed
    ? "Already installed ✓"
    : event
      ? "Install PreOpPal now"
      : outcome === "dismissed"
        ? "Maybe later"
        : "Add to Home Screen on phone";

  return (
    <motion.button
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      disabled={disabled}
      onClick={install}
      className="relative inline-flex items-center gap-3 rounded-2xl px-6 py-4 font-extrabold shadow-[0_20px_40px_-10px_rgba(0,97,114,0.4)] disabled:opacity-70"
      style={{
        background: installed
          ? "linear-gradient(135deg, #7CFFA7 0%, #1c8a4e 100%)"
          : "linear-gradient(135deg, #acedff 0%, #88d1e5 35%, #2a7a8c 100%)",
        color: "white",
      }}
    >
      <span className="relative h-9 w-9 rounded-full flex items-center justify-center bg-white/20 border border-white/40">
        <span className="material-symbols-outlined text-[20px]">
          {installed ? "check_circle" : "download"}
        </span>
      </span>
      <span className="tracking-tight">{label}</span>
      {!installed && event && (
        <span className="material-symbols-outlined text-base">
          arrow_forward
        </span>
      )}
    </motion.button>
  );
}
