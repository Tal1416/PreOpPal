"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useReduceEffects } from "@/lib/use-reduce-effects";

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  strength?: number;
};

export default function MagneticButton({
  children,
  className = "",
  onClick,
  type = "button",
  strength = 0.35,
}: Props) {
  const reduce = useReduceEffects();

  // Touch / reduce-motion: drop the spring physics + mouse listener entirely.
  // The visual press feedback is handled by Tailwind's `active:scale-[0.96]`.
  if (reduce) {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`relative inline-flex items-center justify-center active:scale-[0.96] transition-transform ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <InteractiveMagneticButton
      className={className}
      onClick={onClick}
      type={type}
      strength={strength}
    >
      {children}
    </InteractiveMagneticButton>
  );
}

function InteractiveMagneticButton({
  children,
  className,
  onClick,
  type,
  strength,
}: Required<Pick<Props, "children" | "className" | "type" | "strength">> & {
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

  function handleMove(e: React.MouseEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.96 }}
      style={{ x, y }}
      className={`relative inline-flex items-center justify-center ${className}`}
    >
      {children}
    </motion.button>
  );
}
