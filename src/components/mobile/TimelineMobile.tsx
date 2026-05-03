"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { phases, personalize, phaseDetails, Phase } from "@/data/content";
import { useProfile } from "@/lib/profile-context";
import PhaseDetailModal from "@/components/timeline/PhaseDetailModal";

export default function TimelineMobile() {
  const { profile } = useProfile();
  const initialIndex = Math.max(
    0,
    phases.findIndex((p) => p.state === "current")
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [modalPhase, setModalPhase] = useState<Phase | null>(null);
  const active = phases[activeIndex];

  return (
    <div className="space-y-5">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[28px] overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #006172 0%, #2a7a8c 50%, #0a6879 100%)",
        }}
      >
        <motion.span
          aria-hidden
          className="absolute -bottom-16 -right-12 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(176,236,254,0.35), transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <div className="relative px-5 pt-5 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
            Five phases · One calm path
          </p>
          <h1 className="mt-1 text-[22px] leading-tight font-extrabold tracking-tight">
            Your{" "}
            <span className="text-[#acedff]">
              {profile.procedure?.trim() || "procedure"}
            </span>{" "}
            timeline.
          </h1>
          <p className="mt-2 text-[12.5px] text-white/80 leading-snug">
            Each phase shows only what you need now — never overwhelming.
          </p>
        </div>
      </motion.section>

      {/* PHASE PILLS — horizontal swipeable */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="-mx-4 px-4"
      >
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
          {phases.map((p, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  if (isActive) setModalPhase(p);
                  else setActiveIndex(i);
                }}
                className={`snap-start shrink-0 relative rounded-2xl px-3.5 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(0,97,114,0.55)]"
                    : "glass-card text-on-surface"
                }`}
              >
                <p
                  className={`text-[9px] font-bold uppercase tracking-widest ${
                    isActive ? "text-white/70" : "text-on-surface-variant/70"
                  }`}
                >
                  {p.label}
                </p>
                <p className="text-[12px] font-extrabold mt-0.5 whitespace-nowrap">
                  {p.title}
                </p>
                <div
                  className={`mt-1.5 h-1 w-full rounded-full overflow-hidden ${
                    isActive ? "bg-white/20" : "bg-primary-fixed/40"
                  }`}
                >
                  <div
                    className={`h-full rounded-full ${
                      isActive ? "bg-[#acedff]" : "bg-primary"
                    }`}
                    style={{ width: `${p.progress * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </motion.section>

      {/* ACTIVE PHASE DETAIL */}
      <AnimatePresence mode="wait">
        <motion.section
          key={active.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3 border-b border-white/40">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                {active.label} · {active.range}
              </p>
              <h3 className="text-xl font-extrabold text-on-surface mt-0.5">
                {active.title}
              </h3>
            </div>
            {active.state === "current" && (
              <span className="rounded-full bg-primary text-white px-2.5 py-1 text-[9px] font-bold tracking-widest">
                IN PROGRESS
              </span>
            )}
            {active.state === "complete" && (
              <span className="rounded-full bg-primary-fixed/40 text-primary px-2.5 py-1 text-[9px] font-bold tracking-widest">
                COMPLETE
              </span>
            )}
            {active.state === "upcoming" && (
              <span className="rounded-full bg-white/60 text-on-surface-variant px-2.5 py-1 text-[9px] font-bold tracking-widest">
                UPCOMING
              </span>
            )}
          </div>

          <ul className="divide-y divide-white/40">
            {active.highlights.map((h) => (
              <li key={h.title} className="px-5 py-3 flex items-start gap-3">
                <div className="h-9 w-9 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    {h.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-on-surface leading-tight">
                    {personalize(h.title, profile)}
                  </p>
                  <p className="text-[12px] text-on-surface-variant leading-snug mt-0.5">
                    {personalize(h.detail, profile)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setModalPhase(active)}
            className="w-full px-5 py-3.5 border-t border-white/40 flex items-center justify-between gap-3 bg-white/30 active:bg-white/60 transition-colors"
          >
            <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary">
              View full phase plan
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">
              arrow_forward
            </span>
          </button>
        </motion.section>
      </AnimatePresence>

      {/* MINI VERTICAL OVERVIEW */}
      <section className="px-1">
        <h2 className="text-base font-extrabold text-on-surface mb-3">
          Full path
        </h2>
        <div className="relative pl-7">
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-primary-fixed/40 rounded-full" />
          <div className="space-y-3">
            {phases.map((p, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setActiveIndex(i);
                    setModalPhase(p);
                  }}
                  className={`w-full text-left flex items-center gap-3 py-2 px-3 rounded-2xl transition-colors ${
                    isActive ? "bg-white/70" : "active:bg-white/40"
                  }`}
                >
                  <span
                    className={`absolute left-0 h-5 w-5 rounded-full border-[3px] border-background flex items-center justify-center text-[9px] font-extrabold text-white ${
                      p.state === "current"
                        ? "bg-gradient-to-br from-[#88d1e5] to-[#006172]"
                        : p.state === "complete"
                        ? "bg-primary"
                        : "bg-on-surface-variant/40"
                    }`}
                  >
                    {p.state === "complete" ? (
                      <span
                        className="material-symbols-outlined text-[12px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        check
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-bold text-on-surface leading-tight">
                      {p.title}
                    </p>
                    <p className="text-[10.5px] text-on-surface-variant">
                      {p.range}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px]">
                    chevron_right
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <PhaseDetailModal
        open={!!modalPhase}
        onClose={() => setModalPhase(null)}
        phase={modalPhase}
        details={modalPhase ? phaseDetails[modalPhase.id] : undefined}
      />
    </div>
  );
}
