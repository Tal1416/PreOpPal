"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { personalize } from "@/data/content";
import { arrivalStepsFor } from "@/data/procedure-customizations";
import { useProfile } from "@/lib/profile-context";

export default function ArrivalMobile() {
  const { profile } = useProfile();
  const arrivalSteps = arrivalStepsFor(profile.procedureId);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const [notifyTeam, setNotifyTeam] = useState(false);

  const query = encodeURIComponent(
    `${profile.hospitalName}, ${profile.hospitalAddress}`
  );
  const embedSrc = `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const openMapsHref = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

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
            Day-of Surgery
          </p>
          <h1 className="mt-1 text-[22px] leading-tight font-extrabold tracking-tight">
            Arrival,{" "}
            <span className="text-[#acedff]">step by step.</span>
          </h1>
          <p className="mt-2 text-[12.5px] text-white/80 leading-snug">
            From your alarm to the operating room — exactly what happens, and
            when.
          </p>
        </div>
      </motion.section>

      {/* STICKY PROGRESS */}
      <div className="sticky top-[100px] z-20 -mx-1">
        <div className="rounded-full bg-white/75 backdrop-blur-xl border border-white/60 shadow-glass px-3.5 py-2.5 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary text-[18px]">
            route
          </span>
          <div className="flex-1 h-1 bg-primary-fixed/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#88d1e5] to-[#006172] rounded-full origin-left"
              style={{ width: fill }}
            />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {arrivalSteps.length} steps
          </span>
        </div>
      </div>

      {/* STEP TIMELINE */}
      <section ref={ref} className="space-y-3">
        {arrivalSteps.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.5,
              delay: i * 0.03,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="glass-card rounded-3xl p-4 flex items-start gap-3.5"
          >
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[22px]">
                  {s.icon}
                </span>
              </div>
              <span className="text-[8.5px] font-bold uppercase tracking-widest text-on-surface-variant">
                Step {i + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className="text-[15px] font-extrabold text-on-surface leading-tight">
                  {personalize(s.title, profile)}
                </h3>
                <span className="rounded-full bg-primary-fixed/40 text-primary px-2 py-0.5 text-[9.5px] font-bold tracking-widest tabular-nums shrink-0">
                  {s.time}
                </span>
              </div>
              <p className="text-[12.5px] text-on-surface-variant leading-snug">
                {personalize(s.description, profile)}
              </p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* MAP CARD */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="relative h-44 bg-surface-container">
          <iframe
            title={`Map to ${profile.hospitalName}`}
            src={embedSrc}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0) 60%, rgba(237,252,255,0.45) 100%)",
            }}
          />
        </div>
        <div className="p-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              {profile.hospitalName}
            </p>
            <h3 className="mt-1 text-[15px] font-extrabold text-on-surface leading-snug">
              {profile.hospitalAddress}
            </h3>
            <p className="mt-1.5 text-[12px] text-on-surface-variant leading-snug">
              Surgical Reception · Building B · Floor 3. Valet parking is
              complimentary at the main entrance.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={directionsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-on-primary px-4 py-2.5 text-[13px] font-bold active:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">
                directions
              </span>
              Get directions
            </a>
            <a
              href={openMapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 text-primary px-4 py-2.5 text-[13px] font-bold active:bg-white transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">map</span>
              Open in Google Maps
            </a>
            <button
              type="button"
              role="switch"
              aria-checked={notifyTeam}
              onClick={() => setNotifyTeam((v) => !v)}
              className="mt-1 flex items-center justify-between gap-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/70 px-3.5 py-2.5 text-left active:bg-white transition-all"
            >
              <span className="flex items-start gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                  notifications_active
                </span>
                <span className="min-w-0">
                  <span className="block text-[12.5px] font-bold text-on-surface leading-tight">
                    Notify team of your ETA
                  </span>
                  <span className="block text-[10.5px] text-on-surface-variant mt-0.5 leading-snug">
                    We&apos;ll share your live ETA with the surgical team.
                  </span>
                </span>
              </span>
              <span
                aria-hidden
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  notifyTeam ? "bg-primary" : "bg-on-surface-variant/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                    notifyTeam ? "left-[1.125rem]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
