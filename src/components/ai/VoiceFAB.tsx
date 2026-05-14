"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAI } from "@/components/ai/ai-store";
import { useViewMode } from "@/lib/view-mode-context";

/**
 * Floating "Talk to Pal" pill pinned to the bottom-left of the viewport.
 * One tap opens the full-screen voice overlay. Hides itself while the
 * overlay is up so it doesn't bleed through the backdrop.
 */
export default function VoiceFAB() {
  const ai = useAI();
  const { isEmbed, hydrated } = useViewMode();

  if (!hydrated || isEmbed) return null;
  if (ai.voiceOverlay) return null;

  return (
    <AnimatePresence>
      <motion.button
        key="voice-fab"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => {
          if ("vibrate" in navigator) navigator.vibrate?.(10);
          ai.setVoiceOverlay(true);
        }}
        aria-label="Talk to Pal — voice mode"
        title="Talk to Pal — voice mode"
        className="fixed z-40 bottom-24 left-4 lg:bottom-8 lg:left-8 inline-flex items-center gap-3 rounded-2xl px-4 py-3 lg:px-5 lg:py-4 font-extrabold text-white shadow-[0_20px_40px_-10px_rgba(0,97,114,0.55)] pointer-events-auto"
        style={{
          background:
            "linear-gradient(135deg, #2a7a8c 0%, #006172 50%, #0a3845 100%)",
        }}
      >
        <span className="relative h-9 w-9 rounded-full flex items-center justify-center bg-white/15 border border-white/30">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-[#7CFFA7]/60"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />
          <span className="material-symbols-outlined text-[20px] text-[#acedff]">
            graphic_eq
          </span>
        </span>
        <span className="tracking-tight hidden sm:inline">
          Talk to Pal — voice mode
        </span>
        <span className="tracking-tight sm:hidden">Talk to Pal</span>
        <span className="material-symbols-outlined text-base">
          arrow_forward
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
