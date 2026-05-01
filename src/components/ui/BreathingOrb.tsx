"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PHASE_MS = 4000;

export default function BreathingOrb() {
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");

  useEffect(() => {
    const id = setInterval(
      () => setPhase((p) => (p === "inhale" ? "exhale" : "inhale")),
      PHASE_MS
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      <motion.div
        aria-hidden
        className="absolute h-full w-full rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(42,122,140,0.35), rgba(42,122,140,0) 65%)",
        }}
        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.05, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-[#88d1e5] via-[#2a7a8c] to-[#006172] shadow-[0_30px_60px_-10px_rgba(42,122,140,0.55)]"
        animate={{ scale: phase === "inhale" ? 1.08 : 0.85 }}
        transition={{ duration: PHASE_MS / 1000, ease: "easeInOut" }}
      />
      <motion.div
        className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-on-primary"
        animate={{ scale: phase === "inhale" ? 1.1 : 0.92 }}
        transition={{ duration: PHASE_MS / 1000, ease: "easeInOut" }}
      >
        <motion.span
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-white"
        >
          {phase}
        </motion.span>
      </motion.div>
    </div>
  );
}
