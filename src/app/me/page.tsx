"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import Modal from "@/components/ui/Modal";
import ProcedurePicker from "@/components/ui/ProcedurePicker";
import ScrollReveal from "@/components/ui/ScrollReveal";
import AuthGuard from "@/components/auth/AuthGuard";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";
import MeMobile from "@/components/mobile/MeMobile";
import type { Medication } from "@/data/content";

const inputCls =
  "w-full rounded-xl border border-white/60 bg-white/70 backdrop-blur-md px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

const labelCls =
  "text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-2 block";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

function SectionHeader({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shadow-md shrink-0">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
          Step {step}
        </p>
        <h2 className="text-2xl font-extrabold text-on-surface mt-0.5">
          {title}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">{description}</p>
      </div>
    </div>
  );
}

const emptyMedication: Omit<Medication, "id"> = {
  name: "",
  dosage: "",
  schedule: "",
  status: "continue",
  reason: "",
};

function MePageInner() {
  const {
    profile,
    updateProfile,
    resetProfile,
    readinessScore,
    setProcedure,
    setCustomProcedure,
  } = useProfile();
  const { isEmbed } = useViewMode();
  const [saved, setSaved] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [draftMed, setDraftMed] = useState<Omit<Medication, "id">>(emptyMedication);

  if (isEmbed) {
    return (
      <PageShell>
        <MeMobile />
      </PageShell>
    );
  }

  function openMedicationModal() {
    setDraftMed(emptyMedication);
    setMedModalOpen(true);
  }

  function saveDraftMedication() {
    if (!draftMed.name.trim()) return;
    const id = `m-${Date.now()}`;
    updateProfile({
      medications: [...profile.medications, { id, ...draftMed }],
    });
    setMedModalOpen(false);
  }

  function updateMedication(id: string, patch: Partial<Medication>) {
    updateProfile({
      medications: profile.medications.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    });
  }

  function removeMedication(id: string) {
    updateProfile({
      medications: profile.medications.filter((m) => m.id !== id),
    });
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <PageShell>
      <div className="max-w-5xl mx-auto space-y-12 pb-32">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
            Your Profile
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
              About{" "}
              <span className="gradient-text-static">
                {profile.firstName?.trim() || "you"}.
              </span>
            </h1>
            <div className="rounded-2xl glass-card-strong px-6 py-4">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                Profile complete
              </p>
              <p className="text-3xl font-extrabold gradient-text-static tabular-nums">
                {readinessScore}%
              </p>
            </div>
          </div>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl">
            The more we know, the more PreOpPal can tailor your timeline,
            medications, and AI companion. Everything is saved locally to this
            device.
          </p>
        </ScrollReveal>

        {/* PERSONAL */}
        <ScrollReveal>
          <GlassCard className="p-8 md:p-10" tilt={false}>
            <SectionHeader
              step={1}
              icon="person"
              title="Personal"
              description="The basics, so we know how to greet you."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="First name">
                <input
                  className={inputCls}
                  value={profile.firstName}
                  onChange={(e) =>
                    updateProfile({ firstName: e.target.value })
                  }
                  placeholder="Alex"
                />
              </Field>
              <Field label="Last name">
                <input
                  className={inputCls}
                  value={profile.lastName}
                  onChange={(e) =>
                    updateProfile({ lastName: e.target.value })
                  }
                  placeholder="Morgan"
                />
              </Field>
              <Field label="Age">
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
              </Field>
              <Field label="Patient ID">
                <input
                  className={inputCls}
                  value={profile.patientId}
                  onChange={(e) =>
                    updateProfile({ patientId: e.target.value })
                  }
                  placeholder="4920"
                />
              </Field>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* SURGERY */}
        <ScrollReveal>
          <GlassCard className="p-8 md:p-10" tilt={false}>
            <SectionHeader
              step={2}
              icon="event"
              title="Upcoming surgery"
              description="What you're preparing for, and where."
            />
            <div className="mb-6">
              <span className={labelCls}>Procedure</span>
              <ProcedurePicker
                value={profile.procedureId}
                onChange={setProcedure}
                onCustom={setCustomProcedure}
                customLabel={profile.procedure}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Surgeon">
                <input
                  className={inputCls}
                  value={profile.surgeon}
                  onChange={(e) =>
                    updateProfile({ surgeon: e.target.value })
                  }
                  placeholder="Dr. Sarah Chen"
                />
              </Field>
              <Field label="Surgery date">
                <input
                  type="date"
                  className={inputCls}
                  value={profile.surgeryDate}
                  onChange={(e) =>
                    updateProfile({ surgeryDate: e.target.value })
                  }
                />
              </Field>
              <Field label="Days until surgery">
                <div
                  className={`${inputCls} flex items-center justify-between cursor-not-allowed bg-white/40 text-on-surface-variant`}
                  aria-readonly="true"
                >
                  <span className="tabular-nums font-bold text-on-surface">
                    {profile.daysToSurgery}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest">
                    Auto
                  </span>
                </div>
              </Field>
              <Field label="Hospital">
                <input
                  className={inputCls}
                  value={profile.hospitalName}
                  onChange={(e) =>
                    updateProfile({ hospitalName: e.target.value })
                  }
                  placeholder="Memorial East"
                />
              </Field>
              <Field label="Address">
                <input
                  className={inputCls}
                  value={profile.hospitalAddress}
                  onChange={(e) =>
                    updateProfile({ hospitalAddress: e.target.value })
                  }
                  placeholder="421 Park Avenue, New York, NY 10022"
                />
              </Field>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* VITALS */}
        <ScrollReveal>
          <GlassCard className="p-8 md:p-10" tilt={false}>
            <SectionHeader
              step={3}
              icon="monitor_heart"
              title="Vitals & body"
              description="Baseline numbers so we can flag changes."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Blood type">
                <input
                  className={inputCls}
                  value={profile.bloodType}
                  onChange={(e) =>
                    updateProfile({ bloodType: e.target.value })
                  }
                  placeholder="O+"
                />
              </Field>
              <Field label="Blood pressure">
                <input
                  className={inputCls}
                  value={profile.bloodPressure}
                  onChange={(e) =>
                    updateProfile({ bloodPressure: e.target.value })
                  }
                  placeholder="118/76"
                />
              </Field>
              <Field label="Resting heart rate (bpm)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={profile.heartRate || ""}
                  onChange={(e) =>
                    updateProfile({ heartRate: Number(e.target.value) || 0 })
                  }
                  placeholder="64"
                />
              </Field>
              <Field label="Weight (lb)">
                <input
                  type="number"
                  min={0}
                  className={inputCls}
                  value={profile.weightLb || ""}
                  onChange={(e) =>
                    updateProfile({ weightLb: Number(e.target.value) || 0 })
                  }
                  placeholder="168"
                />
              </Field>
              <Field label="Height">
                <input
                  className={inputCls}
                  value={profile.heightFtIn}
                  onChange={(e) =>
                    updateProfile({ heightFtIn: e.target.value })
                  }
                  placeholder="5'10&quot;"
                />
              </Field>
              <Field label="Allergies">
                <input
                  className={inputCls}
                  value={profile.allergies}
                  onChange={(e) =>
                    updateProfile({ allergies: e.target.value })
                  }
                  placeholder="Penicillin, latex"
                />
              </Field>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* MEDICATIONS */}
        <ScrollReveal>
          <GlassCard className="p-8 md:p-10" tilt={false}>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <SectionHeader
                step={4}
                icon="medication"
                title="Medications"
                description="What you take today. Mark which to stop, continue, or add."
              />
              <button
                onClick={openMedicationModal}
                className="rounded-xl bg-primary text-on-primary px-4 py-2.5 text-sm font-bold flex items-center gap-2 hover:shadow-glow-teal transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add medication
              </button>
            </div>

            <AnimatePresence initial={false}>
              {profile.medications.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-dashed border-primary/30 bg-white/40 p-8 text-center text-on-surface-variant"
                >
                  No medications yet. Tap{" "}
                  <span className="font-bold text-primary">Add medication</span>{" "}
                  to start.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {profile.medications.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="rounded-2xl bg-white/55 backdrop-blur-md border border-white/60 p-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3">
                        <Field label="Name">
                          <input
                            className={inputCls}
                            value={m.name}
                            onChange={(e) =>
                              updateMedication(m.id, { name: e.target.value })
                            }
                            placeholder="Ibuprofen"
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-2">
                        <Field label="Dosage">
                          <input
                            className={inputCls}
                            value={m.dosage}
                            onChange={(e) =>
                              updateMedication(m.id, {
                                dosage: e.target.value,
                              })
                            }
                            placeholder="200mg"
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-3">
                        <Field label="Schedule">
                          <input
                            className={inputCls}
                            value={m.schedule}
                            onChange={(e) =>
                              updateMedication(m.id, {
                                schedule: e.target.value,
                              })
                            }
                            placeholder="Daily morning"
                          />
                        </Field>
                      </div>
                      <div className="md:col-span-3">
                        <Field label="Status">
                          <select
                            className={inputCls}
                            value={m.status}
                            onChange={(e) =>
                              updateMedication(m.id, {
                                status: e.target.value as Medication["status"],
                              })
                            }
                          >
                            <option value="continue">Continue</option>
                            <option value="stop">Stop before surgery</option>
                            <option value="new">New (post-op)</option>
                          </select>
                        </Field>
                      </div>
                      <div className="md:col-span-1 flex md:items-end justify-end">
                        <button
                          onClick={() => removeMedication(m.id)}
                          aria-label="Remove medication"
                          className="h-10 w-10 rounded-xl bg-error/10 text-error flex items-center justify-center hover:bg-error hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">
                            close
                          </span>
                        </button>
                      </div>
                      <div className="md:col-span-12">
                        <Field label="Reason / notes">
                          <input
                            className={inputCls}
                            value={m.reason}
                            onChange={(e) =>
                              updateMedication(m.id, {
                                reason: e.target.value,
                              })
                            }
                            placeholder="Increases bleeding risk during surgery."
                          />
                        </Field>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* EMERGENCY + PREFERENCES */}
        <ScrollReveal>
          <GlassCard className="p-8 md:p-10" tilt={false}>
            <SectionHeader
              step={5}
              icon="contact_emergency"
              title="Emergency contact & care preferences"
              description="Who we call, and how you like to hear from us."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Emergency contact name">
                <input
                  className={inputCls}
                  value={profile.emergencyContactName}
                  onChange={(e) =>
                    updateProfile({ emergencyContactName: e.target.value })
                  }
                  placeholder="Jamie Morgan"
                />
              </Field>
              <Field label="Emergency contact phone">
                <input
                  className={inputCls}
                  value={profile.emergencyContactPhone}
                  onChange={(e) =>
                    updateProfile({ emergencyContactPhone: e.target.value })
                  }
                  placeholder="(212) 555-0142"
                />
              </Field>
              <Field label="Preferred way to reach you">
                <select
                  className={inputCls}
                  value={profile.preferredContact}
                  onChange={(e) =>
                    updateProfile({
                      preferredContact: e.target
                        .value as typeof profile.preferredContact,
                    })
                  }
                >
                  <option value="app">In-app notifications</option>
                  <option value="phone">Phone call</option>
                  <option value="email">Email</option>
                </select>
              </Field>
              <Field
                label={`Anxiety level — ${profile.anxietyLevel}/10`}
              >
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={profile.anxietyLevel}
                  onChange={(e) =>
                    updateProfile({
                      anxietyLevel: Number(e.target.value),
                    })
                  }
                  className="w-full accent-primary mt-2"
                />
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-on-surface-variant/70 mt-1">
                  <span>Calm</span>
                  <span>Worried</span>
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Anything else your team should know">
                  <textarea
                    className={`${inputCls} min-h-[100px] resize-y`}
                    value={profile.notes}
                    onChange={(e) =>
                      updateProfile({ notes: e.target.value })
                    }
                    placeholder="Mobility limitations, dietary needs, recovery support at home…"
                  />
                </Field>
              </div>
            </div>
          </GlassCard>
        </ScrollReveal>

        {/* SAVE BAR */}
        <div className="sticky bottom-24 lg:bottom-6 z-30 flex justify-center">
          <div className="rounded-2xl glass-card-strong px-5 py-3 flex items-center gap-3 shadow-glass-lg">
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 text-primary text-sm font-bold"
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Saved to this device
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={resetProfile}
              className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors px-3 py-2"
            >
              Reset
            </button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={handleSave}
              className="rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:shadow-glow-teal transition-all"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Save profile
            </motion.button>
          </div>
        </div>
      </div>

      <Modal
        open={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        title="Add medication"
        description="Capture what you take so we can flag what to stop or continue."
        icon="medication"
        footer={
          <>
            <button
              onClick={() => setMedModalOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2"
            >
              Cancel
            </button>
            <button
              onClick={saveDraftMedication}
              disabled={!draftMed.name.trim()}
              className="rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold flex items-center gap-2 hover:shadow-glow-teal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add medication
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Name">
              <input
                autoFocus
                className={inputCls}
                value={draftMed.name}
                onChange={(e) =>
                  setDraftMed((d) => ({ ...d, name: e.target.value }))
                }
                placeholder="Ibuprofen"
              />
            </Field>
          </div>
          <Field label="Dosage">
            <input
              className={inputCls}
              value={draftMed.dosage}
              onChange={(e) =>
                setDraftMed((d) => ({ ...d, dosage: e.target.value }))
              }
              placeholder="200mg"
            />
          </Field>
          <Field label="Schedule">
            <input
              className={inputCls}
              value={draftMed.schedule}
              onChange={(e) =>
                setDraftMed((d) => ({ ...d, schedule: e.target.value }))
              }
              placeholder="Daily morning"
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Status">
              <select
                className={inputCls}
                value={draftMed.status}
                onChange={(e) =>
                  setDraftMed((d) => ({
                    ...d,
                    status: e.target.value as Medication["status"],
                  }))
                }
              >
                <option value="continue">Continue</option>
                <option value="stop">Stop before surgery</option>
                <option value="new">New (post-op)</option>
              </select>
            </Field>
          </div>
          <div className="md:col-span-2">
            <Field label="Reason / notes">
              <input
                className={inputCls}
                value={draftMed.reason}
                onChange={(e) =>
                  setDraftMed((d) => ({ ...d, reason: e.target.value }))
                }
                placeholder="Increases bleeding risk during surgery."
              />
            </Field>
          </div>
        </div>
      </Modal>
    </PageShell>
  );
}

export default function MePage() {
  return (
    <AuthGuard>
      <MePageInner />
    </AuthGuard>
  );
}
