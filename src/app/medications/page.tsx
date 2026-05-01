"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/ScrollReveal";
import { medications as defaultMedications, personalize } from "@/data/content";
import { useProfile } from "@/lib/profile-context";

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

export default function Medications() {
  const { profile } = useProfile();
  const meds =
    profile.medications && profile.medications.length > 0
      ? profile.medications
      : defaultMedications;
  const usingDefaults =
    !profile.medications || profile.medications.length === 0;
  const stopCount = meds.filter((m) => m.status === "stop").length;
  const continueCount = meds.filter((m) => m.status === "continue").length;
  const newCount = meds.filter((m) => m.status === "new").length;

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-12">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
            Medication Plan
          </p>
          <h1 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
            {meds.length} medication{meds.length === 1 ? "" : "s"}.{" "}
            <span className="gradient-text-static">
              {stopCount} to pause.
            </span>
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl">
            {usingDefaults ? (
              <>
                These are sample medications.{" "}
                <Link
                  href="/me"
                  className="text-primary font-bold underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                >
                  Add your own
                </Link>{" "}
                so PreOpPal can show your actual plan.
              </>
            ) : (
              <>
                Reviewed and approved by {profile.surgeon}. Critical pauses are
                highlighted — tap any card for the reason.
              </>
            )}
          </p>
        </ScrollReveal>

        {/* summary */}
        <ScrollReveal>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Stop", count: stopCount, color: "text-error" },
              { label: "Continue", count: continueCount, color: "text-primary" },
              {
                label: "New",
                count: newCount,
                color: "gradient-text-static",
              },
            ].map((s) => (
              <GlassCard key={s.label} className="p-6 text-center" tilt={false}>
                <div className={`text-4xl font-extrabold ${s.color}`}>
                  {s.count}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-on-surface-variant">
                  {s.label}
                </div>
              </GlassCard>
            ))}
          </div>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meds.map((m) => {
            const theme = STATUS_THEME[m.status];
            return (
              <StaggerItem key={m.id}>
                <GlassCard
                  className={`p-6 md:p-8 relative ${
                    m.status === "stop" ? "border-l-4 border-error" : ""
                  }`}
                >
                  {m.status === "stop" && (
                    <motion.span
                      aria-hidden
                      className="absolute top-6 right-6 h-3 w-3 rounded-full bg-error animate-pulse-error"
                    />
                  )}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-extrabold text-on-surface">
                        {m.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {m.dosage} · {m.schedule}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest ${theme.badge}`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {theme.icon}
                      </span>
                      {theme.label}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {personalize(m.reason, profile)}
                  </p>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* dose timeline */}
        <ScrollReveal>
          <GlassCard className="p-8 md:p-10" tilt={false}>
            <h2 className="text-headline-sm font-semibold text-primary mb-2">
              Today's schedule
            </h2>
            <p className="text-sm text-on-surface-variant mb-8">
              A visual timeline of every dose between now and surgery morning.
            </p>
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-primary-fixed/40 via-primary-fixed-dim to-primary" />
              <div className="relative grid grid-cols-4 md:grid-cols-8 gap-2">
                {Array.from({ length: 8 }).map((_, i) => {
                  const filled = i < 5;
                  return (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.06,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`h-4 w-4 rounded-full ring-4 ring-background ${
                          filled
                            ? "bg-gradient-to-br from-[#88d1e5] to-[#006172]"
                            : "bg-white border-2 border-primary-fixed/60"
                        }`}
                      />
                      <span className="text-[10px] font-bold tracking-widest text-on-surface-variant">
                        {`${6 + i * 2}:00`}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </PageShell>
  );
}
