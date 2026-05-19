"use client";

import { useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const PHASE_MS = 4000;

/**
 * Breathing orb. The two background layers (aura + core) loop forever via
 * CSS keyframes — much cheaper than framer-motion JS-driven animation,
 * since the browser runs them on the compositor.
 *
 * We pause the animation entirely when the orb is scrolled off-screen, so
 * background tabs / off-screen viewports don't burn GPU cycles.
 */
export default function BreathingOrb() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20%" });
  const [phase, setPhase] = useState<"inhale" | "exhale">("inhale");

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(
      () => setPhase((p) => (p === "inhale" ? "exhale" : "inhale")),
      PHASE_MS
    );
    return () => clearInterval(id);
  }, [inView]);

  const pausedClass = inView ? "" : "is-paused";

  return (
    <div
      ref={ref}
      className="relative flex h-44 w-44 items-center justify-center"
    >
      <div
        aria-hidden
        className={`breathe-aura-anim absolute h-full w-full rounded-full ${pausedClass}`}
        style={{
          background:
            "radial-gradient(circle at center, rgba(42,122,140,0.35), rgba(42,122,140,0) 65%)",
        }}
      />
      <div
        aria-hidden
        className={`breathe-core-anim absolute h-32 w-32 rounded-full bg-gradient-to-br from-[#88d1e5] via-[#2a7a8c] to-[#006172] shadow-[0_30px_60px_-10px_rgba(42,122,140,0.55)] ${pausedClass}`}
      />
      <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white/30 backdrop-blur-md text-on-primary">
        <span
          key={phase}
          className="text-xs font-bold uppercase tracking-[0.2em] text-white"
        >
          {phase}
        </span>
      </div>
    </div>
  );
}
