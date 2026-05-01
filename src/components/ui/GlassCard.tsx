"use client";

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ReactNode, useRef } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: boolean;
  as?: "div" | "section" | "article";
};

/**
 * Glassmorphism card. Optional 3D tilt that follows the cursor and an
 * optional radial-glow spotlight that tracks the mouse position.
 */
export default function GlassCard({
  children,
  className = "",
  tilt = true,
  glow = true,
  as = "div",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });

  const glowX = useSpring(useMotionValue(50), { stiffness: 120, damping: 20 });
  const glowY = useSpring(useMotionValue(50), { stiffness: 120, damping: 20 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
    if (tilt) {
      rotateY.set((x - 0.5) * 8);
      rotateX.set((0.5 - y) * 8);
    }
    if (glow) {
      glowX.set(x * 100);
      glowY.set(y * 100);
    }
  }

  function handleLeave() {
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(50);
  }

  const glowBg = useMotionTemplate`radial-gradient(280px circle at ${glowX}% ${glowY}%, rgba(136,209,229,0.18), transparent 60%)`;

  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transformStyle: "preserve-3d",
        rotateX: tilt ? rotateX : 0,
        rotateY: tilt ? rotateY : 0,
      }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className={`glass-card ambient-shadow relative overflow-hidden rounded-3xl ${className}`}
    >
      {glow && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ background: glowBg }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </Tag>
  );
}
