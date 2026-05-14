"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import QRModal from "./QRModal";
import { useViewMode } from "@/lib/view-mode-context";

/**
 * "Continue on phone" trigger. Drop inline inside a header — the only call
 * site today is the TopAppBar on desktop app routes.
 */
export default function PairButton() {
  const [open, setOpen] = useState(false);
  const { mode, isEmbed, hydrated } = useViewMode();

  // Only meaningful on desktop / web view. The whole point is "go from this to phone."
  if (!hydrated || isEmbed || mode === "phone") return null;

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.04 }}
        onClick={() => setOpen(true)}
        className="group relative inline-flex items-center gap-2 rounded-full glass-card-strong px-4 py-2 text-primary shadow-[0_8px_24px_-8px_rgba(42,122,140,0.35)]"
        aria-label="Continue on phone"
        title="Continue on phone"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white">
          <span className="material-symbols-outlined text-[16px]">
            qr_code_2
          </span>
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-[#88d1e5]"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
        </span>
        <span className="text-xs font-extrabold uppercase tracking-[0.18em]">
          Continue on phone
        </span>
      </motion.button>
      <QRModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
