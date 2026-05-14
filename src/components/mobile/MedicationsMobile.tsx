"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { personalize } from "@/data/content";
import { medsFor } from "@/data/procedure-customizations";
import { useProfile } from "@/lib/profile-context";

type Filter = "all" | "stop" | "continue" | "new";

const STATUS_THEME = {
  stop: {
    badge: "bg-error/10 text-error border-error/30",
    label: "STOP",
    icon: "block",
  },
  continue: {
    badge: "bg-primary/10 text-primary border-primary/30",
    label: "CONTINUE",
    icon: "check_circle",
  },
  new: {
    badge:
      "bg-gradient-to-r from-[#88d1e5] to-[#006172] text-white border-transparent",
    label: "NEW",
    icon: "auto_awesome",
  },
} as const;

export default function MedicationsMobile() {
  const { profile } = useProfile();
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const meds =
    profile.medications && profile.medications.length > 0
      ? profile.medications
      : medsFor(profile.procedureId);
  const usingDefaults =
    !profile.medications || profile.medications.length === 0;
  const stopCount = meds.filter((m) => m.status === "stop").length;
  const continueCount = meds.filter((m) => m.status === "continue").length;
  const newCount = meds.filter((m) => m.status === "new").length;
  const filtered =
    filter === "all" ? meds : meds.filter((m) => m.status === filter);

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
          className="absolute -top-16 -right-12 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(176,236,254,0.4), transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <div className="relative px-5 pt-5 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
            Medication plan
          </p>
          <h1 className="mt-1 text-[22px] leading-tight font-extrabold tracking-tight">
            {meds.length} med{meds.length === 1 ? "" : "s"} ·{" "}
            <span className="text-[#acedff]">{stopCount} to pause.</span>
          </h1>
          <p className="mt-1.5 text-[12px] text-white/80 leading-snug">
            {usingDefaults ? (
              <>
                These are samples.{" "}
                <Link
                  href="/me"
                  className="font-bold text-[#acedff] underline underline-offset-2"
                >
                  Add yours
                </Link>{" "}
                in your profile.
              </>
            ) : (
              <>Approved by {profile.surgeon}. Tap any card for the reason.</>
            )}
          </p>
        </div>
      </motion.section>

      {/* SUMMARY ROW */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
        className="grid grid-cols-3 gap-2.5"
      >
        {[
          { label: "Stop", count: stopCount, color: "text-error" },
          {
            label: "Continue",
            count: continueCount,
            color: "text-primary",
          },
          { label: "New", count: newCount, color: "gradient-text-static" },
        ].map((s) => (
          <div
            key={s.label}
            className="glass-card rounded-2xl p-3 flex flex-col items-center text-center"
          >
            <div className={`text-2xl font-extrabold ${s.color}`}>
              {s.count}
            </div>
            <div className="mt-0.5 text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
              {s.label}
            </div>
          </div>
        ))}
      </motion.section>

      {/* FILTER PILLS */}
      <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {([
          { id: "all", label: "All", icon: "list" },
          { id: "stop", label: "Stop", icon: "block" },
          { id: "continue", label: "Continue", icon: "check_circle" },
          { id: "new", label: "New", icon: "auto_awesome" },
        ] as { id: Filter; label: string; icon: string }[]).map((f) => {
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`snap-start shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(0,97,114,0.55)]"
                  : "glass-card text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {f.icon}
              </span>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* MED LIST */}
      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {filtered.map((m) => {
            const theme = STATUS_THEME[m.status];
            const expanded = expandedId === m.id;
            return (
              <motion.button
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => setExpandedId(expanded ? null : m.id)}
                className={`w-full text-left glass-card rounded-2xl p-4 ${
                  m.status === "stop" ? "border-l-4 border-error" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-on-surface truncate">
                      {m.name}
                    </h3>
                    <p className="text-[12px] text-on-surface-variant mt-0.5 truncate">
                      {m.dosage} · {m.schedule}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-widest shrink-0 ${theme.badge}`}
                  >
                    <span className="material-symbols-outlined text-[12px]">
                      {theme.icon}
                    </span>
                    {theme.label}
                  </span>
                </div>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 10 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="text-[12.5px] text-on-surface-variant leading-snug overflow-hidden"
                    >
                      {personalize(m.reason, profile)}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-primary/30 bg-white/40 p-6 text-center text-sm text-on-surface-variant">
            Nothing in this filter.
          </div>
        )}
      </div>

      {/* TODAY'S SCHEDULE */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="glass-card rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Today
            </p>
            <h3 className="text-base font-extrabold text-on-surface mt-0.5">
              Dose schedule
            </h3>
          </div>
          <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
            5 of 8 done
          </span>
        </div>
        <div className="relative">
          <div className="absolute left-0 right-0 top-[7px] h-0.5 bg-gradient-to-r from-primary-fixed/40 via-primary-fixed-dim to-primary-fixed/40" />
          <div className="relative grid grid-cols-8 gap-1">
            {Array.from({ length: 8 }).map((_, i) => {
              const filled = i < 5;
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2 + i * 0.05,
                    type: "spring",
                    stiffness: 220,
                  }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`h-3.5 w-3.5 rounded-full ring-[3px] ring-background ${
                      filled
                        ? "bg-gradient-to-br from-[#88d1e5] to-[#006172]"
                        : "bg-white border-2 border-primary-fixed/60"
                    }`}
                  />
                  <span className="text-[8px] font-bold tracking-widest text-on-surface-variant">
                    {`${6 + i * 2}h`}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
