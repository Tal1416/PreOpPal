"use client";

import { motion } from "framer-motion";

/**
 * Fixed full-viewport animated gradient mesh — sits behind every page.
 */
export default function GradientMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <motion.div
        aria-hidden
        className="absolute -top-1/3 -left-1/4 h-[80vh] w-[80vh] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #88d1e5 0%, rgba(136,209,229,0) 65%)",
        }}
        animate={{
          x: ["0%", "12%", "-8%", "0%"],
          y: ["0%", "-8%", "10%", "0%"],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/4 -right-1/4 h-[70vh] w-[70vh] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #b0ecfe 0%, rgba(176,236,254,0) 65%)",
        }}
        animate={{
          x: ["0%", "-10%", "6%", "0%"],
          y: ["0%", "12%", "-6%", "0%"],
          scale: [1, 0.9, 1.08, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-1/3 left-1/4 h-[80vh] w-[80vh] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at center, #2a7a8c 0%, rgba(42,122,140,0) 65%)",
        }}
        animate={{
          x: ["0%", "-6%", "10%", "0%"],
          y: ["0%", "8%", "-10%", "0%"],
          scale: [1, 1.06, 0.94, 1],
        }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        aria-hidden
        className="absolute inset-0 noise opacity-[0.04] mix-blend-overlay"
      />
    </div>
  );
}
