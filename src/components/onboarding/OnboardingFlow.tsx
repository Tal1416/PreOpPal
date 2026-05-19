"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ProcedurePicker from "@/components/ui/ProcedurePicker";
import { useProfile } from "@/lib/profile-context";

const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Riley",
  "https://api.dicebear.com/7.x/personas/svg?seed=Morgan",
  "https://api.dicebear.com/7.x/personas/svg?seed=River",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Quinn",
  "https://api.dicebear.com/7.x/notionists/svg?seed=Avery",
  "https://api.dicebear.com/7.x/lorelei/svg?seed=Robin",
];

type StepId = "procedure" | "you" | "avatar" | "done";

const STEPS: { id: StepId; label: string }[] = [
  { id: "procedure", label: "Procedure" },
  { id: "you", label: "About you" },
  { id: "avatar", label: "Avatar" },
  { id: "done", label: "Ready" },
];

const inputCls =
  "w-full rounded-xl border border-white/60 bg-white/80 backdrop-blur-md px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

export default function OnboardingFlow() {
  const {
    profile,
    updateProfile,
    setProcedure,
    setCustomProcedure,
    completeOnboarding,
  } = useProfile();
  const [step, setStep] = useState<StepId>("procedure");
  const stepIdx = STEPS.findIndex((s) => s.id === step);
  const next = () => {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1].id);
  };
  const back = () => {
    const i = STEPS.findIndex((s) => s.id === step);
    if (i > 0) setStep(STEPS[i - 1].id);
  };

  const finish = () => completeOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[200] overflow-hidden flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to PreOpPal"
    >
      {/* backdrop */}
      <div
        aria-hidden
        className="absolute inset-0 bg-background pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(at 80% 0%, rgba(172,237,255,0.45), transparent 50%), radial-gradient(at 0% 100%, rgba(136,209,229,0.4), transparent 60%)",
        }}
      />
      <motion.div
        aria-hidden
        className="absolute -top-32 -right-32 h-[480px] w-[480px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(136,209,229,0.4), transparent 70%)",
        }}
        animate={{ scale: [1, 1.15, 1], rotate: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(176,236,254,0.35), transparent 70%)",
        }}
        animate={{ scale: [1, 1.1, 0.95, 1], rotate: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity }}
      />

      {/* PROGRESS HEADER */}
      <header className="relative shrink-0 px-5 lg:px-12 pt-8 pb-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                PreOpPal · Setup
              </p>
              <button
                onClick={finish}
                className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Skip for now
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {STEPS.map((s, i) => (
                <div key={s.id} className="space-y-1.5">
                  <div className="h-1 rounded-full bg-white/60 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#88d1e5] to-[#006172]"
                      initial={false}
                      animate={{ width: i <= stepIdx ? "100%" : "0%" }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p
                    className={`text-[10px] font-bold uppercase tracking-widest ${
                      i <= stepIdx
                        ? "text-primary"
                        : "text-on-surface-variant/60"
                    }`}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* STEP CONTENT */}
        <main className="relative flex-1 overflow-y-auto overscroll-contain px-5 lg:px-12 py-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "procedure" && (
                <section
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
                      What surgery are you{" "}
                      <span className="gradient-text-static">preparing for?</span>
                    </h1>
                    <p className="mt-3 text-on-surface-variant max-w-xl">
                      We'll tailor the timeline, packing list, and Pal's answers
                      to this. You can change it any time.
                    </p>
                  </div>
                  <ProcedurePicker
                    value={profile.procedureId}
                    onChange={setProcedure}
                    onCustom={setCustomProcedure}
                    customLabel={profile.procedure}
                  />
                </section>
              )}

              {step === "you" && (
                <section
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
                      Tell us about <span className="gradient-text-static">you.</span>
                    </h1>
                    <p className="mt-3 text-on-surface-variant max-w-xl">
                      Just the basics — so Pal greets you by name and the
                      countdown ticks toward your real day.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2 block">
                        First name
                      </span>
                      <input
                        autoFocus
                        className={inputCls}
                        value={profile.firstName}
                        onChange={(e) =>
                          updateProfile({ firstName: e.target.value })
                        }
                        placeholder="Alex"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2 block">
                        Age
                      </span>
                      <input
                        type="number"
                        min={0}
                        className={inputCls}
                        value={profile.age || ""}
                        onChange={(e) =>
                          updateProfile({ age: Number(e.target.value) || 0 })
                        }
                        placeholder="47"
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2 block">
                        Surgery date
                      </span>
                      <input
                        type="date"
                        className={inputCls}
                        value={profile.surgeryDate}
                        min={todayISO()}
                        onChange={(e) =>
                          updateProfile({ surgeryDate: e.target.value })
                        }
                      />
                    </label>
                  </div>
                </section>
              )}

              {step === "avatar" && (
                <section
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
                      Pick a <span className="gradient-text-static">face.</span>
                    </h1>
                    <p className="mt-3 text-on-surface-variant max-w-xl">
                      Your tiny travel companion in the corner of every screen.
                    </p>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                    {AVATARS.map((url) => {
                      const active = url === profile.avatar;
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => updateProfile({ avatar: url })}
                          aria-pressed={active}
                          aria-label="Pick avatar"
                          className={`group relative aspect-square rounded-2xl overflow-hidden transition-all ${
                            active
                              ? "ring-4 ring-primary shadow-glow-teal scale-105"
                              : "ring-2 ring-white/60 hover:ring-primary/40 hover:scale-105"
                          } bg-white/70`}
                        >
                          <img
                            src={url}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                          {active && (
                            <span
                              aria-hidden
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center shadow-md"
                            >
                              <span
                                className="material-symbols-outlined text-xs"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                check
                              </span>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === "done" && (
                <section
                  className="text-center py-8 md:py-16"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className="mx-auto h-28 w-28 md:h-36 md:w-36 rounded-full bg-gradient-to-br from-[#88d1e5] to-[#006172] flex items-center justify-center shadow-[0_30px_60px_-12px_rgba(0,97,114,0.55)]"
                  >
                    <span
                      className="material-symbols-outlined text-white text-6xl md:text-7xl"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="mt-8 text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface"
                  >
                    You're all set,{" "}
                    <span className="gradient-text-static">
                      {profile.firstName?.trim() || "friend"}.
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="mt-4 text-on-surface-variant max-w-xl mx-auto"
                  >
                    PreOpPal is now tuned for your{" "}
                    <span className="font-semibold text-on-surface">
                      {profile.procedure}
                    </span>
                    . Pal is online, your timeline is ready, and your bag list is
                    prepped. Take a breath — we've got you.
                  </motion.p>
                </section>
              )}
            </motion.div>
          </div>
        </main>

      {/* FOOTER NAV */}
      <footer className="relative shrink-0 px-5 lg:px-12 pb-8 pt-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={back}
              disabled={stepIdx === 0}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-3 py-2"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Back
            </button>
            {step === "done" ? (
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={finish}
                className="rounded-2xl bg-primary text-on-primary px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-glow-teal"
              >
                Open my dashboard
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={next}
                className="rounded-2xl bg-primary text-on-primary px-6 py-3 text-sm font-bold flex items-center gap-2 hover:shadow-glow-teal transition-all"
              >
                Continue
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </motion.button>
            )}
        </div>
      </footer>
    </motion.div>
  );
}
