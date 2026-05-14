"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import BreathingOrb from "@/components/ui/BreathingOrb";
import { careTeam, personalize, Task } from "@/data/content";
import { tasksFor } from "@/data/procedure-customizations";
import { useProfile } from "@/lib/profile-context";
import { formatSurgeryDate } from "@/lib/date";

export default function DashboardMobile() {
  const { profile, readinessScore, hydrated, currentProcedure } = useProfile();
  const [tasks, setTasks] = useState<Task[]>(() => tasksFor(profile.procedureId));
  useEffect(() => {
    setTasks(tasksFor(profile.procedureId));
  }, [profile.procedureId]);
  const remaining = tasks.filter((t) => t.status !== "done").length;
  const score = hydrated ? readinessScore : profile.readinessScore;

  function toggle(id: string) {
    setTasks((cur) =>
      cur.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "pending" : "done" }
          : t
      )
    );
  }

  const greetingName = profile.firstName?.trim() || "friend";
  const surgeryDateLabel = formatSurgeryDate(profile.surgeryDate);
  const team = careTeam.map((m, i) =>
    i === 0 && profile.surgeon?.trim()
      ? { ...m, name: profile.surgeon.trim() }
      : m
  );

  return (
    <div className="space-y-5">
      {/* HERO COUNTDOWN */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-[28px] overflow-hidden text-white shadow-[0_24px_48px_-16px_rgba(0,97,114,0.45)]"
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
        <div className="relative px-5 pt-5 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
            Good morning
          </p>
          <h1 className="mt-1 text-[26px] leading-tight font-extrabold tracking-tight">
            Hi {greetingName}.
          </h1>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-[64px] leading-none font-extrabold tabular-nums text-[#acedff]">
              <AnimatedNumber to={profile.daysToSurgery} />
            </span>
            <div className="pb-2">
              <p className="text-sm font-semibold leading-tight">days to go</p>
              <p className="text-[11px] text-white/70 mt-0.5 flex items-center gap-1">
                <span aria-hidden>{currentProcedure.emoji}</span>
                {profile.procedure}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5">
              <span className="material-symbols-outlined text-[#acedff] text-base">
                event
              </span>
              <span className="text-xs font-bold tracking-tight">
                {surgeryDateLabel}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[11px] font-bold tracking-tight">
              Recovery {currentProcedure.recoveryWindow}
            </span>
          </div>
        </div>
      </motion.section>

      {/* READINESS + STATS ROW */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
        className="grid grid-cols-5 gap-2.5"
      >
        <div className="col-span-2 glass-card rounded-2xl p-3.5 flex flex-col items-center justify-center text-center">
          <div className="relative h-[78px] w-[78px]">
            <svg className="-rotate-90" width={78} height={78}>
              <circle
                cx={39}
                cy={39}
                r={32}
                fill="transparent"
                stroke="rgba(42,122,140,0.12)"
                strokeWidth={8}
              />
              <motion.circle
                cx={39}
                cy={39}
                r={32}
                fill="transparent"
                stroke="url(#mobileRing)"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                animate={{
                  strokeDashoffset: 2 * Math.PI * 32 * (1 - score / 100),
                }}
                transition={{
                  duration: 1.6,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
              <defs>
                <linearGradient id="mobileRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#88d1e5" />
                  <stop offset="100%" stopColor="#006172" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-extrabold gradient-text-static tabular-nums">
                <AnimatedNumber to={score} duration={1.4} />%
              </span>
            </div>
          </div>
          <span className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/70">
            Readiness
          </span>
        </div>

        <Link
          href="/medications"
          className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <span
            className="material-symbols-outlined text-error text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            medication
          </span>
          <span className="mt-1 text-xl font-extrabold tabular-nums text-on-surface">
            <AnimatedNumber to={2} duration={1.4} />
          </span>
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
            Pause
          </span>
        </Link>

        <Link
          href="/timeline"
          className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <span
            className="material-symbols-outlined text-orange-400 text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            assignment
          </span>
          <span className="mt-1 text-xl font-extrabold tabular-nums text-on-surface">
            <AnimatedNumber to={remaining} duration={1.4} />
          </span>
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
            Tasks
          </span>
        </Link>

        <Link
          href="/bag"
          className="glass-card rounded-2xl p-3 flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <span
            className="material-symbols-outlined text-primary text-xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            work
          </span>
          <span className="mt-1 text-xl font-extrabold tabular-nums text-on-surface">
            <AnimatedNumber to={6} duration={1.4} />
          </span>
          <span className="text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
            Bag
          </span>
        </Link>
      </motion.section>

      {/* TODAY'S TASKS */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
      >
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-extrabold text-on-surface">Today</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary-fixed/40 rounded-full px-2.5 py-1">
            {remaining} left
          </span>
        </div>
        <div className="glass-card rounded-3xl overflow-hidden divide-y divide-white/40">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className="w-full px-4 py-3 flex items-center gap-3.5 active:bg-white/40 transition-colors text-left"
            >
              <div
                className={`relative h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  t.status === "done"
                    ? "bg-primary text-white"
                    : t.status === "critical"
                    ? "bg-error/10 text-error"
                    : "bg-white/70 text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {t.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[14px] font-bold leading-tight ${
                    t.status === "done"
                      ? "text-on-surface-variant line-through"
                      : "text-on-surface"
                  }`}
                >
                  {personalize(t.title, profile)}
                </p>
                <p className="text-[11.5px] text-on-surface-variant truncate mt-0.5 leading-snug">
                  {personalize(t.description, profile)}
                </p>
              </div>
              <AnimatePresence mode="wait">
                {t.status === "done" ? (
                  <motion.span
                    key="done"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="material-symbols-outlined text-primary text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </motion.span>
                ) : t.status === "critical" ? (
                  <motion.span
                    key="crit"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="material-symbols-outlined text-error text-[22px]"
                  >
                    priority_high
                  </motion.span>
                ) : (
                  <motion.span
                    key="pend"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="material-symbols-outlined text-outline text-[22px]"
                  >
                    radio_button_unchecked
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </motion.section>

      {/* CALM SPACE */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        className="glass-card rounded-3xl p-5 flex items-center gap-4"
      >
        <div className="shrink-0 scale-[0.55] origin-left -my-6 -mr-12">
          <BreathingOrb />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Calm Space
          </p>
          <h3 className="text-base font-extrabold text-on-surface mt-0.5">
            Breathe with Pal.
          </h3>
          <p className="text-[12px] text-on-surface-variant leading-snug mt-1">
            Two-minute paced breathing. 4s in, 4s out.
          </p>
        </div>
      </motion.section>

      {/* CARE TEAM */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.28 }}
      >
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h2 className="text-base font-extrabold text-on-surface">
            Your team
          </h2>
          <Link
            href="/care"
            className="text-xs font-bold text-primary flex items-center gap-0.5"
          >
            See all
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
          {team.map((m) => (
            <Link
              key={m.id}
              href="/care"
              className="snap-start shrink-0 w-[140px] glass-card rounded-2xl p-3 text-center active:scale-95 transition-transform"
            >
              <div className="relative inline-block">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow"
                />
                {m.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>
              <p className="mt-2 text-[12px] font-bold text-on-surface truncate">
                {m.name}
              </p>
              <p className="text-[10px] text-secondary truncate">{m.role}</p>
            </Link>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
