"use client";

import { motion } from "framer-motion";
import { procedures } from "@/data/procedures";

type Props = {
  value: string;
  onChange: (procedureId: string) => void;
  /**
   * "grid" — full card grid (desktop /me).
   * "compact" — horizontally scrolling pills + selected card detail (mobile).
   */
  variant?: "grid" | "compact";
};

export default function ProcedurePicker({
  value,
  onChange,
  variant = "grid",
}: Props) {
  if (variant === "compact") {
    const selected = procedures.find((p) => p.id === value) ?? procedures[0];
    return (
      <div className="space-y-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none px-1">
          {procedures.map((p) => {
            const isActive = p.id === value;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.id)}
                aria-pressed={isActive}
                className={`snap-start shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(0,97,114,0.55)]"
                    : "glass-card text-on-surface"
                }`}
              >
                <span aria-hidden className="text-[14px]">
                  {p.emoji}
                </span>
                {p.shortName}
              </button>
            );
          })}
        </div>
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`relative rounded-2xl overflow-hidden p-4 text-white bg-gradient-to-br ${selected.accent}`}
        >
          <div className="flex items-start gap-3">
            <span aria-hidden className="text-2xl leading-none">
              {selected.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                {selected.bodyRegion}
              </p>
              <h3 className="text-[15px] font-extrabold leading-tight">
                {selected.name}
              </h3>
              <p className="text-[11px] text-white/80 mt-1 leading-snug">
                {selected.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2 py-0.5">
                  {selected.hospitalStay}
                </span>
                <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2 py-0.5">
                  Recovery {selected.recoveryWindow}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {procedures.map((p) => {
        const isActive = p.id === value;
        return (
          <motion.button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={isActive}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`group relative text-left rounded-2xl p-5 overflow-hidden transition-all ${
              isActive
                ? "ring-2 ring-primary shadow-glow-teal"
                : "ring-1 ring-white/60 hover:ring-primary/40"
            } bg-gradient-to-br ${p.accent} text-white`}
          >
            {isActive && (
              <motion.span
                aria-hidden
                layoutId="proc-pick-badge"
                className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-md"
                transition={{ duration: 0.3 }}
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check
                </span>
              </motion.span>
            )}
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-3xl leading-none">
                {p.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                  {p.bodyRegion}
                </p>
                <h3 className="text-[17px] font-extrabold leading-tight pr-6">
                  {p.name}
                </h3>
              </div>
            </div>
            <p className="text-[12px] text-white/85 mt-3 leading-snug">
              {p.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1">
                {p.hospitalStay}
              </span>
              <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1">
                Recovery {p.recoveryWindow}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
