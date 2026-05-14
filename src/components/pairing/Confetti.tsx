"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#88d1e5", "#2a7a8c", "#006172", "#acedff", "#7CFFA7"];

type Props = {
  count?: number;
  duration?: number;
};

/**
 * Lightweight DOM confetti burst — radial spray that falls + spins.
 * No canvas, no library. Mount inside a relative parent.
 */
export default function Confetti({ count = 60, duration = 2.4 }: Props) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 220 + Math.random() * 180;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance * 0.7 - 40;
      return {
        id: i,
        dx,
        dy,
        rot: (Math.random() - 0.5) * 720,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 7,
        delay: Math.random() * 0.1,
        shape: Math.random() > 0.5 ? "rect" : "circle",
      };
    });
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{
            x: p.dx,
            y: p.dy + 220,
            opacity: 0,
            rotate: p.rot,
            scale: 1,
          }}
          transition={{
            duration,
            delay: p.delay,
            ease: [0.16, 0.84, 0.34, 1],
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            boxShadow: `0 0 8px ${p.color}55`,
          }}
        />
      ))}
    </div>
  );
}
