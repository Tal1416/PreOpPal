"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/components/auth/AuthGuard";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import ReadinessRing from "@/components/ui/ReadinessRing";
import BreathingOrb from "@/components/ui/BreathingOrb";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import ScrollReveal, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/ScrollReveal";
import AICompanionCard from "@/components/ai/AICompanionCard";
import DashboardMobile from "@/components/mobile/DashboardMobile";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { careTeam, personalize, Task } from "@/data/content";
import { tasksFor } from "@/data/procedure-customizations";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";
import { formatSurgeryDate } from "@/lib/date";

function DashboardInner() {
  const { profile, readinessScore, hydrated, currentProcedure } = useProfile();
  const { isEmbed } = useViewMode();
  const [tasks, setTasks] = useState<Task[]>(() => tasksFor(profile.procedureId));
  // Re-seed tasks when the user changes procedures on /me. Different surgery,
  // different prep list — local check-offs reset (which is the honest behavior).
  useEffect(() => {
    setTasks(tasksFor(profile.procedureId));
  }, [profile.procedureId]);
  const remaining = tasks.filter((t) => t.status !== "done").length;
  const showOnboarding = hydrated && !profile.onboardingComplete;

  if (isEmbed) {
    return (
      <PageShell>
        <DashboardMobile />
        {showOnboarding && <OnboardingFlow />}
      </PageShell>
    );
  }

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

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        {/* greeting */}
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4 pt-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">
                The Big Day
              </p>
              <h1 className="text-balance text-3xl md:text-6xl font-extrabold tracking-tight text-on-surface">
                Good morning, {greetingName}.
              </h1>
              <p className="mt-3 text-on-surface-variant text-base md:text-lg max-w-xl">
                You're doing great. Everything is on track for{" "}
                {surgeryDateLabel}.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/60 backdrop-blur-xl px-4 py-2 border border-white/60 shadow-glass">
              <span className="material-symbols-outlined text-primary">
                event
              </span>
              <span className="text-sm font-bold text-on-surface">
                {surgeryDateLabel}
              </span>
            </div>
          </div>
        </ScrollReveal>

        {/* HERO ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          <ScrollReveal className="lg:col-span-8" delay={0.05}>
            <GlassCard className="relative overflow-hidden p-6 md:p-12 min-h-[240px] md:min-h-[360px] flex flex-col justify-between">
              <motion.div
                aria-hidden
                className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#88d1e5] to-[#006172] opacity-20 blur-2xl"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
                transition={{ duration: 14, repeat: Infinity }}
              />
              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
                  Countdown
                </p>
                <h2 className="text-[clamp(3rem,7vw,5.5rem)] leading-none font-extrabold tracking-tighter">
                  <span className="gradient-text-static tabular-nums">
                    <AnimatedNumber to={profile.daysToSurgery} />
                  </span>
                  <span className="text-on-surface"> Days</span>
                </h2>
                <p className="mt-2 text-xl font-medium text-on-surface-variant flex items-center gap-2">
                  <span aria-hidden className="text-2xl">
                    {currentProcedure.emoji}
                  </span>
                  to your {profile.procedure}.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="rounded-full glass-card px-3 py-1 text-on-surface-variant">
                    {currentProcedure.hospitalStay}
                  </span>
                  <span className="rounded-full glass-card px-3 py-1 text-on-surface-variant">
                    Recovery {currentProcedure.recoveryWindow}
                  </span>
                </div>
              </div>
              <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                <Link
                  href="/timeline"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary text-on-primary px-6 py-3 font-bold hover:shadow-glow-teal transition-all"
                >
                  View Pre-Op Guide
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </Link>
                <Link
                  href="/arrival"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 text-primary px-6 py-3 font-bold hover:bg-white/80 transition-all"
                >
                  Day-of arrival
                </Link>
              </div>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-4" delay={0.15}>
            <GlassCard className="p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[260px] md:min-h-[360px]">
              <h3 className="text-headline-sm font-semibold text-primary mb-4">
                Readiness Score
              </h3>
              <ReadinessRing
                value={hydrated ? readinessScore : profile.readinessScore}
              />
              <p className="mt-5 text-sm text-on-surface-variant max-w-xs">
                Complete your{" "}
                <Link
                  href="/me"
                  className="text-primary font-bold underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                >
                  profile
                </Link>{" "}
                and {remaining} task{remaining === 1 ? "" : "s"} to reach 100%.
              </p>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* AI COMPANION — FEATURED */}
        <ScrollReveal>
          <AICompanionCard />
        </ScrollReveal>

        {/* BENTO ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ScrollReveal>
            <GlassCard className="p-8 min-h-[340px] flex flex-col items-center justify-between text-center">
              <div className="w-full flex justify-between items-start">
                <span className="text-headline-sm font-semibold text-primary">
                  Calm Space
                </span>
                <span className="material-symbols-outlined text-secondary">
                  spa
                </span>
              </div>
              <BreathingOrb />
              <p className="text-sm text-on-surface-variant">
                Inhale 4s · Exhale 4s
              </p>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="md:col-span-2">
            <GlassCard
              className="border-l-4 border-primary overflow-hidden"
              tilt={false}
            >
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/40">
                <h2 className="text-headline-sm font-semibold text-primary">
                  Today's Tasks
                </h2>
                <span className="rounded-full bg-primary-fixed/40 text-primary px-3 py-1 text-xs font-bold tracking-widest">
                  {remaining} REMAINING
                </span>
              </div>
              <StaggerGroup className="divide-y divide-white/30">
                {tasks.map((t) => (
                  <StaggerItem key={t.id}>
                    <motion.button
                      onClick={() => toggle(t.id)}
                      whileHover={{ x: 4 }}
                      className="w-full p-5 md:p-6 flex items-center gap-5 hover:bg-white/40 transition-colors text-left"
                    >
                      <motion.div
                        className={`relative h-11 w-11 rounded-2xl flex items-center justify-center ${
                          t.status === "done"
                            ? "bg-primary text-white"
                            : "bg-white/70 text-primary"
                        }`}
                        whileHover={{ scale: 1.08 }}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {t.icon}
                        </span>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-base font-bold ${
                            t.status === "done"
                              ? "text-on-surface-variant line-through"
                              : "text-on-surface"
                          }`}
                        >
                          {personalize(t.title, profile)}
                        </h4>
                        <p className="text-sm text-on-surface-variant truncate">
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
                            className="material-symbols-outlined text-primary"
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
                            className="material-symbols-outlined text-error"
                          >
                            priority_high
                          </motion.span>
                        ) : (
                          <motion.span
                            key="pend"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="material-symbols-outlined text-outline"
                          >
                            radio_button_unchecked
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* CARE TEAM */}
        <ScrollReveal>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-headline-sm font-semibold text-primary">
              Your Care Team
            </h2>
            <Link
              href="/care"
              className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            >
              View all
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
          </div>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {careTeam.map((member, idx) => {
            const m =
              idx === 0 && profile.surgeon?.trim()
                ? { ...member, name: profile.surgeon.trim() }
                : member;
            return (
            <StaggerItem key={m.id}>
              <GlassCard className="p-5 text-center">
                <div className="relative inline-block">
                  <img
                    src={m.avatar}
                    alt={m.name}
                    className="h-20 w-20 rounded-full object-cover ring-2 ring-white/80 shadow-lg"
                  />
                  {m.online && (
                    <span className="absolute bottom-0 right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white animate-pulse-teal" />
                  )}
                </div>
                <h4 className="mt-4 text-sm font-bold text-on-surface">
                  {m.name}
                </h4>
                <p className="text-xs text-secondary font-medium">{m.role}</p>
                <Link
                  href={`/care?chat=${m.id}`}
                  className="mt-4 block w-full py-2 rounded-lg bg-white/70 text-primary text-xs font-bold tracking-widest hover:bg-primary hover:text-white transition-colors"
                >
                  MESSAGE
                </Link>
              </GlassCard>
            </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
      {showOnboarding && <OnboardingFlow />}
    </PageShell>
  );
}

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardInner />
    </AuthGuard>
  );
}
