"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAI } from "@/components/ai/ai-store";
import { useAuth } from "@/lib/auth-context";
import { useViewMode } from "@/lib/view-mode-context";

/**
 * Compact floating voice trigger pinned to the bottom-left. Mirrors the
 * AI FAB orb on the right — same gradient and breathing pulse — but smaller
 * so it never crowds dashboard cards. Tap to launch the voice overlay.
 *
 * Auth-gated: signed-in users only. On first hover (desktop) we flash a
 * "Talk to Pal" tooltip so the affordance is discoverable without being noisy.
 */
export default function VoiceFAB() {
  const ai = useAI();
  const { isAuthenticated, hydrated: authHydrated } = useAuth();
  const { isEmbed, hydrated: viewHydrated } = useViewMode();
  const [hovering, setHovering] = useState(false);
  const [introTooltip, setIntroTooltip] = useState(false);

  // Briefly flash a tooltip on first mount so users find the affordance.
  useEffect(() => {
    if (!isAuthenticated) return;
    if (ai.voiceOverlay) return;
    const seenKey = "preoppal-voicefab-seen";
    try {
      if (localStorage.getItem(seenKey)) return;
    } catch {
      // ignore
    }
    const showT = window.setTimeout(() => setIntroTooltip(true), 1200);
    const hideT = window.setTimeout(() => {
      setIntroTooltip(false);
      try {
        localStorage.setItem(seenKey, "1");
      } catch {
        // ignore
      }
    }, 4200);
    return () => {
      clearTimeout(showT);
      clearTimeout(hideT);
    };
  }, [isAuthenticated, ai.voiceOverlay]);

  if (!authHydrated || !viewHydrated) return null;
  if (!isAuthenticated) return null;
  if (isEmbed) return null;
  if (ai.voiceOverlay) return null;

  const showTooltip = hovering || introTooltip;

  return (
    <motion.div
      key="voice-fab"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      className="fixed z-40 pointer-events-auto bottom-24 left-4 lg:bottom-8 lg:left-8 flex items-center gap-3"
    >
      {/* tooltip pill — to the right of the orb */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            key="tip"
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="relative rounded-full glass-card-strong px-3.5 py-1.5 shadow-[0_8px_24px_-8px_rgba(42,122,140,0.35)] pointer-events-none"
          >
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary whitespace-nowrap">
              Talk to Pal
            </span>
            <span
              aria-hidden
              className="absolute left-[-6px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-45 bg-white/85 border-l border-b border-white/40 rounded-[2px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          if ("vibrate" in navigator) navigator.vibrate?.(10);
          ai.setVoiceOverlay(true);
        }}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        aria-label="Talk to Pal — voice mode"
        title="Talk to Pal — voice mode"
        className="relative flex items-center justify-center rounded-full text-white h-14 w-14 lg:h-16 lg:w-16"
        style={{
          background:
            "linear-gradient(135deg, #2a7a8c 0%, #006172 55%, #0a3845 100%)",
          boxShadow:
            "0 22px 44px -10px rgba(0,97,114,0.55), 0 0 0 4px rgba(255,255,255,0.35) inset",
        }}
      >
        {/* breathing rings — match the FAB orb on the right */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-[#88d1e5]/40"
          animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-[#7CFFA7]/40"
          animate={{ scale: [1, 1.55, 1], opacity: [0.45, 0, 0.45] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: 0.4 }}
        />
        <span className="material-symbols-outlined text-[26px] lg:text-[28px] text-[#acedff] drop-shadow">
          graphic_eq
        </span>
        {/* "live" dot */}
        <span
          aria-hidden
          className="absolute top-0.5 right-0.5 h-3 w-3 rounded-full bg-[#7CFFA7] ring-2 ring-[#0a3845]"
        />
      </motion.button>
    </motion.div>
  );
}
