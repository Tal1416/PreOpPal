"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { useProfile } from "@/lib/profile-context";
import { todayTasks } from "@/data/content";

const QUICK_LINKS = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/timeline", icon: "event_upcoming", label: "Timeline" },
  { to: "/medications", icon: "medication", label: "Meds" },
  { to: "/bag", icon: "work", label: "Bag" },
];

export default function LandingMobile() {
  const { profile, readinessScore, hydrated } = useProfile();
  const name = profile.firstName?.trim() || "friend";
  const daysLeft = Math.max(0, profile.daysToSurgery);
  const ready = hydrated ? readinessScore : profile.readinessScore;
  const tasksRemaining = todayTasks.filter((t) => t.status !== "done").length;

  const stats = [
    { v: daysLeft, suffix: "", label: "Days Left", icon: "calendar_today", accent: "text-primary" },
    { v: ready, suffix: "%", label: "Ready", icon: "check_circle", accent: "text-emerald-500" },
    { v: tasksRemaining, suffix: "", label: "Tasks", icon: "assignment", accent: "text-orange-400" },
  ];

  return (
    <div className="relative pb-28">
      {/* Status-bar safe top spacer (clears the dynamic island) */}
      <div aria-hidden className="h-[44px]" />

      {/* HERO BANNER */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-4 rounded-[28px] overflow-hidden text-white shadow-[0_24px_48px_-16px_rgba(0,97,114,0.45)]"
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
        <div className="relative px-6 pt-7 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#acedff] to-white flex items-center justify-center shadow-md">
                <span className="font-extrabold text-primary">P</span>
              </div>
              <span className="font-extrabold tracking-tight text-base">
                PreOpPal
              </span>
            </div>
            <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white/40">
              <img
                src={profile.avatar}
                alt={profile.firstName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70 mb-2">
            Welcome back
          </p>
          <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">
            Hi {name} — your<br />
            <span className="text-[#acedff]">surgery sanctuary.</span>
          </h1>
          <p className="mt-3 text-sm text-white/80 leading-relaxed">
            Tasks, meds, and Pal — all in one tap.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white text-primary px-5 py-3 font-bold text-sm shadow-md active:scale-95 transition-transform"
          >
            Open dashboard
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
      </motion.section>

      {/* STATS ROW */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-5 px-4 grid grid-cols-3 gap-2.5"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="glass-card rounded-2xl p-3 flex flex-col items-center text-center"
          >
            <span
              className={`material-symbols-outlined ${s.accent} text-lg`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {s.icon}
            </span>
            <span className="mt-1 text-xl font-extrabold tabular-nums text-on-surface">
              <AnimatedNumber to={s.v} duration={1.4} />
              {s.suffix}
            </span>
            <span className="mt-0.5 text-[9px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
              {s.label}
            </span>
          </div>
        ))}
      </motion.section>

      {/* QUICK LINKS */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="mt-6 px-4"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-extrabold text-on-surface">Quick access</h2>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-primary flex items-center gap-0.5"
          >
            See all
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              href={q.to}
              className="glass-card rounded-2xl flex flex-col items-center justify-center py-3 active:scale-95 transition-transform"
            >
              <span
                className="material-symbols-outlined text-primary text-[22px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {q.icon}
              </span>
              <span className="mt-1 text-[10px] font-bold text-on-surface-variant">
                {q.label}
              </span>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* MEET PAL */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.26 }}
        className="mt-6 mx-4 rounded-3xl overflow-hidden relative text-white"
        style={{
          background:
            "linear-gradient(135deg, #2a7a8c 0%, #006172 100%)",
        }}
      >
        <motion.span
          aria-hidden
          className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(136,209,229,0.35), transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
        <div className="relative px-5 py-5 flex items-center gap-4">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-[#acedff] to-white flex items-center justify-center shadow-md"
          >
            <span className="material-symbols-outlined text-primary text-3xl">
              smart_toy
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
              AI Companion · Online
            </p>
            <h3 className="mt-0.5 text-lg font-extrabold leading-tight">
              Meet <span className="text-[#acedff]">Pal.</span>
            </h3>
            <p className="text-xs text-white/80 leading-snug mt-1">
              Ask anything — fasting, meds, anesthesia. 24/7.
            </p>
          </div>
        </div>
        <div className="relative px-5 pb-5 flex flex-wrap gap-1.5">
          {[
            "What can I eat?",
            "When do I stop meds?",
            "I'm anxious",
          ].map((s) => (
            <Link
              key={s}
              href="/dashboard"
              className="text-[11px] rounded-full bg-white/15 backdrop-blur-md border border-white/25 px-3 py-1 text-white/90"
            >
              {s}
            </Link>
          ))}
        </div>
      </motion.section>

    </div>
  );
}
