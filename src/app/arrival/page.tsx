"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ArrivalMobile from "@/components/mobile/ArrivalMobile";
import { personalize } from "@/data/content";
import { arrivalStepsFor } from "@/data/procedure-customizations";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";

export default function ArrivalGuide() {
  const { isEmbed } = useViewMode();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const { profile } = useProfile();
  const arrivalSteps = arrivalStepsFor(profile.procedureId);
  const [notifyTeam, setNotifyTeam] = useState(false);
  const query = encodeURIComponent(
    `${profile.hospitalName}, ${profile.hospitalAddress}`
  );
  const embedSrc = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const openMapsHref = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  if (isEmbed) {
    return (
      <PageShell>
        <ArrivalMobile />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-12">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
            Day-of Surgery
          </p>
          <h1 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
            Arrival, step{" "}
            <span className="gradient-text-static">by step.</span>
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl">
            From your alarm to the operating room — exactly what happens, and
            when.
          </p>
        </ScrollReveal>

        {/* sticky progress */}
        <div className="sticky top-20 z-20 -mx-2 mb-2">
          <div className="rounded-full bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">route</span>
            <div className="flex-1 h-1.5 bg-primary-fixed/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#88d1e5] to-[#006172] rounded-full origin-left"
                style={{ width: fill }}
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {arrivalSteps.length} STEPS
            </span>
          </div>
        </div>

        <div ref={ref} className="space-y-4">
          {arrivalSteps.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <GlassCard className="p-6 md:p-8 flex items-start gap-6">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-3xl">
                      {s.icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                    Step {i + 1}
                  </span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="text-xl md:text-2xl font-extrabold text-on-surface">
                      {personalize(s.title, profile)}
                    </h3>
                    <span className="rounded-full bg-primary-fixed/40 text-primary px-3 py-1 text-xs font-bold tracking-widest tabular-nums">
                      {s.time}
                    </span>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed">
                    {personalize(s.description, profile)}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* MAP CARD */}
        <ScrollReveal>
          <GlassCard
            className="p-0 overflow-hidden relative"
            tilt={false}
          >
            <div className="flex flex-col md:flex-row">
              <div className="relative w-full md:w-2/3 h-72 md:h-96 bg-surface-container">
                <iframe
                  title={`Map to ${profile.hospitalName}`}
                  src={embedSrc}
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {/* subtle teal overlay so it harmonizes with the rest of the UI */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0) 60%, rgba(237,252,255,0.35) 100%)",
                  }}
                />
              </div>
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">
                    {profile.hospitalName}
                  </p>
                  <h3 className="mt-2 text-xl md:text-2xl font-extrabold text-on-surface leading-snug">
                    {profile.hospitalAddress}
                  </h3>
                  <p className="mt-3 text-sm text-on-surface-variant leading-relaxed">
                    Surgical Reception · Building B · Floor 3. Valet parking is
                    complimentary at the main entrance.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-on-primary px-5 py-3 font-bold hover:shadow-glow-teal transition-all"
                  >
                    <span className="material-symbols-outlined">
                      directions
                    </span>
                    Get directions
                  </a>
                  <a
                    href={openMapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 text-primary px-5 py-3 font-bold hover:bg-white transition-all"
                  >
                    <span className="material-symbols-outlined">map</span>
                    Open in Google Maps
                  </a>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifyTeam}
                    onClick={() => setNotifyTeam((v) => !v)}
                    className="mt-1 flex items-center justify-between gap-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 px-4 py-3 text-left hover:bg-white transition-all"
                  >
                    <span className="flex items-start gap-3 min-w-0">
                      <span className="material-symbols-outlined text-primary shrink-0">
                        notifications_active
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-on-surface leading-tight">
                          Notify team of your estimated arrival
                        </span>
                        <span className="block text-xs text-on-surface-variant mt-0.5">
                          We&apos;ll share your live ETA with the surgical team.
                        </span>
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                        notifyTeam ? "bg-primary" : "bg-on-surface-variant/30"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                          notifyTeam ? "left-[1.375rem]" : "left-0.5"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>
      </div>
    </PageShell>
  );
}
