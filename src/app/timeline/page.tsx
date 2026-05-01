"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/ScrollReveal";
import { phases } from "@/data/content";

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-12">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
            Preparation Timeline
          </p>
          <h1 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
            Five phases.{" "}
            <span className="gradient-text-static">One calm path.</span>
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl">
            Each phase surfaces only the instructions you need at that moment.
            Nothing more, nothing surfaced too early.
          </p>
        </ScrollReveal>

        {/* phase nav */}
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {phases.map((p) => (
            <StaggerItem key={p.id}>
              <button
                className={`relative w-full text-left p-5 rounded-2xl transition-all overflow-hidden ${
                  p.state === "current"
                    ? "bg-white shadow-glass-lg ring-2 ring-primary"
                    : p.state === "complete"
                    ? "glass-card opacity-90"
                    : "glass-card opacity-60 hover:opacity-100"
                }`}
              >
                {p.state === "current" && (
                  <motion.span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-widest"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  >
                    CURRENT
                  </motion.span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  {p.label}
                </span>
                <div className="mt-1 text-sm font-bold text-on-surface">
                  {p.title}
                </div>
                <div className="mt-3 h-1 w-full bg-primary-fixed/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#88d1e5] to-[#006172] rounded-full"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${p.progress * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </button>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* vertical timeline */}
        <div ref={containerRef} className="relative pl-12 md:pl-20 pt-8">
          {/* track */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-1 bg-primary-fixed/30 rounded-full" />
          <motion.div
            className="absolute left-4 md:left-8 top-0 w-1 bg-gradient-to-b from-[#88d1e5] via-[#2a7a8c] to-[#006172] rounded-full origin-top"
            style={{ height: lineHeight }}
          />

          <div className="space-y-12">
            {phases.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative"
              >
                {/* node */}
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 + 0.2, type: "spring" }}
                  className={`absolute -left-[44px] md:-left-[68px] top-2 h-9 w-9 md:h-11 md:w-11 rounded-full flex items-center justify-center text-white text-xs font-extrabold border-4 border-background ${
                    p.state === "current"
                      ? "bg-gradient-to-br from-[#88d1e5] to-[#006172] animate-pulse-teal"
                      : p.state === "complete"
                      ? "bg-primary"
                      : "bg-on-surface-variant/40"
                  }`}
                >
                  {i + 1}
                </motion.div>

                <GlassCard className="p-6 md:p-8" tilt={false}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                        {p.label} · {p.range}
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-on-surface">
                        {p.title}
                      </h3>
                    </div>
                    {p.state === "current" && (
                      <span className="rounded-full bg-primary text-white px-3 py-1 text-[10px] font-bold tracking-widest">
                        IN PROGRESS
                      </span>
                    )}
                    {p.state === "complete" && (
                      <span className="rounded-full bg-primary-fixed/40 text-primary px-3 py-1 text-[10px] font-bold tracking-widest">
                        COMPLETE
                      </span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {p.highlights.map((h) => (
                      <li
                        key={h.title}
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/40 transition-colors"
                      >
                        <span className="material-symbols-outlined text-primary mt-0.5">
                          {h.icon}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {h.title}
                          </p>
                          <p className="text-sm text-on-surface-variant">
                            {h.detail}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
