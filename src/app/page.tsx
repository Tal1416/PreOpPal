"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import PageShell from "@/components/layout/PageShell";
import LandingNav from "@/components/layout/LandingNav";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import BreathingOrb from "@/components/ui/BreathingOrb";
import ReadinessRing from "@/components/ui/ReadinessRing";
import ScrollReveal, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/ScrollReveal";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import AICompanionCard from "@/components/ai/AICompanionCard";
import { features } from "@/data/content";

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);

  return (
    <PageShell bare>
      <LandingNav />
      {/* HERO */}
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pt-12 pb-12 overflow-hidden"
      >
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-5xl text-center"
        >
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-balance font-extrabold tracking-tighter leading-[0.95] text-[clamp(2.75rem,8vw,7rem)] text-on-surface"
          >
            Master your surgery{" "}
            <span className="block gradient-text leading-[1.15] pb-[0.15em]">journey.</span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-8 text-balance text-base md:text-lg text-on-surface-variant max-w-md mx-auto leading-relaxed"
          >
            From fasting clocks to recovery checklists, we give you the clinical
            clarity to walk into surgery with total confidence.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton className="group rounded-2xl bg-primary text-on-primary px-8 py-4 font-bold tracking-wide shadow-[0_20px_40px_-10px_rgba(0,97,114,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(0,97,114,0.7)] transition-shadow">
              <Link href="/dashboard" className="flex items-center gap-2">
                Open the dashboard
                <motion.span
                  className="material-symbols-outlined"
                  initial={{ x: 0 }}
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  arrow_forward
                </motion.span>
              </Link>
            </MagneticButton>

            <Link
              href="/timeline"
              className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/60 text-primary px-8 py-4 font-bold tracking-wide hover:bg-white/80 transition-all"
            >
              See the timeline
            </Link>
          </motion.div>

          {/* hero metrics */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="mt-16 grid grid-cols-3 gap-3 md:gap-5 max-w-md md:max-w-xl mx-auto"
          >
            {[
              {
                v: 7,
                suffix: "",
                label: "Days Left",
                icon: "calendar_today",
                accent: "border-primary",
                iconColor: "text-primary",
                valueColor: "text-primary",
              },
              {
                v: 85,
                suffix: "%",
                label: "Ready",
                icon: "check_circle",
                accent: "border-emerald-500",
                iconColor: "text-emerald-500",
                valueColor: "text-primary",
              },
              {
                v: 12,
                suffix: "",
                label: "Tasks",
                icon: "assignment",
                accent: "border-orange-400",
                iconColor: "text-orange-400",
                valueColor: "text-primary",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`glass-card rounded-3xl p-4 md:p-5 flex flex-col items-center border-b-4 ${s.accent}`}
              >
                <span
                  className={`material-symbols-outlined ${s.iconColor} mb-1 text-xl`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
                <span
                  className={`text-2xl md:text-3xl font-extrabold tabular-nums ${s.valueColor}`}
                >
                  <AnimatedNumber to={s.v} duration={1.6} />
                  {s.suffix}
                </span>
                <span className="mt-1 text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant/70 font-bold">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="mt-16 flex justify-center"
          >
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-on-surface-variant/60 text-xs uppercase tracking-[0.3em] flex flex-col items-center gap-1"
            >
              Scroll
              <span className="material-symbols-outlined text-base">
                arrow_downward
              </span>
            </motion.span>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES BENTO */}
      <section className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              What's inside
            </p>
            <h2 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
              Designed to{" "}
              <span className="gradient-text-static">lower your pulse.</span>
            </h2>
          </ScrollReveal>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <StaggerItem key={f.title}>
                <GlassCard className="h-full p-8 md:p-10">
                  <div
                    className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.accent} text-white shadow-[0_10px_30px_-5px_rgba(42,122,140,0.45)] mb-6`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {f.icon}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-on-surface mb-3">
                    {f.title}
                  </h3>
                  <p className="text-on-surface-variant leading-relaxed">
                    {f.description}
                  </p>
                  <div className="mt-6 flex items-center text-primary font-bold text-sm">
                    <span className="opacity-50">0{i + 1}</span>
                    <span className="ml-3 h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* SHOWCASE: BREATHING + READINESS */}
      <section className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              Calm Space
            </p>
            <h2 className="text-balance text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-6">
              A breathing orb that{" "}
              <span className="gradient-text-static">actually breathes.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Eight-second cycles, paced for the parasympathetic nervous system.
              Two minutes a day measurably lowers pre-op anxiety scores in
              clinical trials.
            </p>
            <ul className="space-y-3 text-on-surface-variant">
              {[
                "4-second inhale, 4-second exhale",
                "Visual cue, no audio required",
                "Logs to your readiness score",
              ].map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[480px]">
              <BreathingOrb />
              <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] text-on-surface-variant">
                Inhale · Exhale
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-1">
                Eight-second loop
              </p>
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      <section className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[480px]">
              <ReadinessRing value={85} size={240} stroke={14} />
              <p className="mt-8 text-sm text-on-surface-variant text-center max-w-xs">
                Three remaining tasks · Updated 2 minutes ago
              </p>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              Readiness Score
            </p>
            <h2 className="text-balance text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-6">
              Your surgery{" "}
              <span className="gradient-text-static">North Star.</span>
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              We track the complexities so your mind can stay quiet. Every
              requirement met, every medication synced—all condensed into one
              honest score. No nagging, no red flags, just clarity when you
              need it most.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-primary text-on-primary px-6 py-3 font-bold hover:shadow-glow-teal transition-all"
            >
              See your dashboard
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* MEET PAL — AI COMPANION */}
      <section className="relative px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              Meet Pal
            </p>
            <h2 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
              An AI companion who's{" "}
              <span className="gradient-text-static">never off-shift.</span>
            </h2>
            <p className="mt-5 text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">
              Ask anything — fasting, anesthesia, what to wear, how to stop
              spiraling at 2 a.m. Pal answers in seconds, in plain language,
              tuned to your procedure.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <AICompanionCard />
          </ScrollReveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative px-6 pb-40 pt-12">
        <ScrollReveal className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12 md:p-20" tilt={false}>
            <h2 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
              Take a deep breath.
              <br />
              <span className="gradient-text">We've got the rest.</span>
            </h2>
            <p className="mt-6 text-on-surface-variant text-lg max-w-xl mx-auto">
              Your dashboard is already set up. Click in and look around.
            </p>
            <MagneticButton className="mt-10 rounded-2xl bg-primary text-on-primary px-10 py-5 font-bold tracking-wide text-lg shadow-[0_30px_60px_-10px_rgba(0,97,114,0.55)] hover:shadow-[0_40px_80px_-10px_rgba(0,97,114,0.75)] transition-shadow">
              <Link href="/dashboard" className="flex items-center gap-3">
                Enter the sanctuary
                <span className="material-symbols-outlined text-2xl">
                  arrow_forward
                </span>
              </Link>
            </MagneticButton>
          </GlassCard>
        </ScrollReveal>
      </section>

      <footer className="relative pb-12 text-center text-xs text-on-surface-variant/60">
        © 2026 PreOpPal · A clinical sanctuary
      </footer>
    </PageShell>
  );
}
