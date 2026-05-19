"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/ui/Modal";
import AvatarPicker from "@/components/ui/AvatarPicker";
import ProcedurePicker from "@/components/ui/ProcedurePicker";
import { useProfile } from "@/lib/profile-context";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import type { Medication } from "@/data/content";

const SECTIONS = [
  { id: "personal", icon: "person", label: "Personal" },
  { id: "surgery", icon: "event", label: "Surgery" },
  { id: "vitals", icon: "monitor_heart", label: "Vitals" },
  { id: "medications", icon: "medication", label: "Meds" },
  { id: "emergency", icon: "contact_emergency", label: "Contact" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const inputCls =
  "w-full rounded-xl border border-white/60 bg-white/80 px-3.5 py-2.5 text-[14px] text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition";

const labelCls =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant mb-1.5 block";

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

const emptyMedication: Omit<Medication, "id"> = {
  name: "",
  dosage: "",
  schedule: "",
  status: "continue",
  reason: "",
};

export default function MeMobile() {
  const {
    profile,
    updateProfile,
    resetProfile,
    readinessScore,
    setProcedure,
    setCustomProcedure,
    hydrated,
  } = useProfile();
  const [active, setActive] = useState<SectionId>("personal");
  const [saved, setSaved] = useState(false);
  const [medModalOpen, setMedModalOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [draftMed, setDraftMed] =
    useState<Omit<Medication, "id">>(emptyMedication);

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
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5 pb-4">
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
        <div className="relative px-5 pt-5 pb-5 flex items-center gap-4">
          {hydrated ? (
            <button
              type="button"
              onClick={() => setAvatarPickerOpen(true)}
              aria-label="Change avatar"
              className="group relative h-16 w-16 rounded-2xl overflow-hidden ring-2 ring-white/40 shrink-0 active:scale-95 transition-transform"
            >
              <img
                src={profile.avatar}
                alt={profile.firstName}
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-on-surface/40 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[20px]">
                  photo_camera
                </span>
              </span>
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-tl-lg bg-primary text-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[12px]">
                  edit
                </span>
              </span>
            </button>
          ) : (
            <Skeleton rounded="rounded-2xl" className="h-16 w-16 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
              About you
            </p>
            {hydrated ? (
              <>
                <h1 className="text-xl font-extrabold tracking-tight truncate">
                  {profile.firstName?.trim() || "you"}{" "}
                  {profile.lastName?.trim()}
                </h1>
                <p className="text-[12px] text-white/80 truncate">
                  {profile.procedure}
                </p>
              </>
            ) : (
              <div className="space-y-1.5 mt-1">
                <SkeletonText widthClass="w-32" heightClass="h-5" />
                <SkeletonText widthClass="w-24" heightClass="h-3" />
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] uppercase tracking-widest text-white/70 font-bold">
              Profile
            </p>
            {hydrated ? (
              <p className="text-2xl font-extrabold tabular-nums text-[#acedff] leading-none mt-0.5">
                {readinessScore}%
              </p>
            ) : (
              <SkeletonText
                widthClass="w-12"
                heightClass="h-6"
                className="mt-0.5"
              />
            )}
          </div>
        </div>
      </motion.section>

      {/* SECTION TABS */}
      <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`snap-start shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(0,97,114,0.55)]"
                  : "glass-card text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {s.icon}
              </span>
              {s.label}
            </button>
          );
        })}
      </div>

      {/* SECTION CONTENT */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.section
          key={active}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card rounded-3xl p-5"
        >
          {active === "personal" && (
            <div className="space-y-3">
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
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age">
                  <input
                    type="number"
                    inputMode="numeric"
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
            </div>
          )}

          {active === "surgery" && (
            <div className="space-y-3">
              <div>
                <span className={labelCls}>Procedure</span>
                <ProcedurePicker
                  variant="compact"
                  value={profile.procedureId}
                  onChange={setProcedure}
                  onCustom={setCustomProcedure}
                  customLabel={profile.procedure}
                />
              </div>
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
              <div className="grid grid-cols-2 gap-3">
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
                <Field label="Days left">
                  <div
                    className={`${inputCls} flex items-center justify-between bg-white/40`}
                  >
                    <span className="tabular-nums font-bold text-on-surface">
                      {profile.daysToSurgery}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-on-surface-variant">
                      auto
                    </span>
                  </div>
                </Field>
              </div>
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
                  placeholder="421 Park Avenue, NY"
                />
              </Field>
            </div>
          )}

          {active === "vitals" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Heart rate (bpm)">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className={inputCls}
                    value={profile.heartRate || ""}
                    onChange={(e) =>
                      updateProfile({
                        heartRate: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="64"
                  />
                </Field>
                <Field label="Weight (lb)">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    className={inputCls}
                    value={profile.weightLb || ""}
                    onChange={(e) =>
                      updateProfile({
                        weightLb: Number(e.target.value) || 0,
                      })
                    }
                    placeholder="168"
                  />
                </Field>
              </div>
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
          )}

          {active === "medications" && (
            <div>
              <button
                onClick={openMedicationModal}
                className="w-full rounded-2xl bg-primary text-on-primary px-4 py-3 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-base">
                  add
                </span>
                Add medication
              </button>

              {profile.medications.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-primary/30 bg-white/40 p-6 text-center text-sm text-on-surface-variant">
                  No medications yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {profile.medications.map((m) => (
                      <motion.div
                        key={m.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="rounded-2xl bg-white/70 border border-white/60 p-3.5"
                      >
                        <div className="flex items-start gap-2">
                          <input
                            className={`${inputCls} flex-1`}
                            value={m.name}
                            onChange={(e) =>
                              updateMedication(m.id, { name: e.target.value })
                            }
                            placeholder="Name"
                          />
                          <button
                            onClick={() => removeMedication(m.id)}
                            aria-label="Remove"
                            className="h-10 w-10 shrink-0 rounded-xl bg-error/10 text-error flex items-center justify-center active:scale-95 transition-transform"
                          >
                            <span className="material-symbols-outlined text-lg">
                              close
                            </span>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            className={inputCls}
                            value={m.dosage}
                            onChange={(e) =>
                              updateMedication(m.id, {
                                dosage: e.target.value,
                              })
                            }
                            placeholder="Dosage"
                          />
                          <input
                            className={inputCls}
                            value={m.schedule}
                            onChange={(e) =>
                              updateMedication(m.id, {
                                schedule: e.target.value,
                              })
                            }
                            placeholder="Schedule"
                          />
                        </div>
                        <select
                          className={`${inputCls} mt-2`}
                          value={m.status}
                          onChange={(e) =>
                            updateMedication(m.id, {
                              status: e.target
                                .value as Medication["status"],
                            })
                          }
                        >
                          <option value="continue">Continue</option>
                          <option value="stop">Stop before surgery</option>
                          <option value="new">New (post-op)</option>
                        </select>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {active === "emergency" && (
            <div className="space-y-3">
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
              <Field label="Phone">
                <input
                  className={inputCls}
                  inputMode="tel"
                  value={profile.emergencyContactPhone}
                  onChange={(e) =>
                    updateProfile({ emergencyContactPhone: e.target.value })
                  }
                  placeholder="(212) 555-0142"
                />
              </Field>
              <Field label="Preferred contact">
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
              <Field label={`Anxiety level — ${profile.anxietyLevel}/10`}>
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
                  className="w-full accent-primary mt-1"
                />
                <div className="flex justify-between text-[9px] uppercase tracking-widest text-on-surface-variant/70 mt-1">
                  <span>Calm</span>
                  <span>Worried</span>
                </div>
              </Field>
              <Field label="Notes for your team">
                <textarea
                  className={`${inputCls} min-h-[88px] resize-y`}
                  value={profile.notes}
                  onChange={(e) =>
                    updateProfile({ notes: e.target.value })
                  }
                  placeholder="Mobility, dietary needs…"
                />
              </Field>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {/* SAVE BAR */}
      <div className="flex items-center justify-between gap-3 px-1">
        <button
          onClick={resetProfile}
          className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant active:text-error transition-colors px-3 py-2"
        >
          Reset
        </button>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 text-primary text-[11px] font-bold"
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                Saved
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            className="rounded-xl bg-primary text-on-primary px-5 py-2.5 text-[13px] font-bold flex items-center gap-2 active:shadow-glow-teal transition-all"
          >
            <span className="material-symbols-outlined text-base">save</span>
            Save
          </motion.button>
        </div>
      </div>

      <AvatarPicker
        open={avatarPickerOpen}
        current={profile.avatar}
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={(url) => updateProfile({ avatar: url })}
      />

      <Modal
        open={medModalOpen}
        onClose={() => setMedModalOpen(false)}
        title="Add medication"
        description="Capture what you take so we can flag stops and continues."
        icon="medication"
        footer={
          <>
            <button
              onClick={() => setMedModalOpen(false)}
              className="text-sm font-bold uppercase tracking-widest text-on-surface-variant px-3 py-2"
            >
              Cancel
            </button>
            <button
              onClick={saveDraftMedication}
              disabled={!draftMed.name.trim()}
              className="rounded-xl bg-primary text-on-primary px-5 py-2.5 text-sm font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add
            </button>
          </>
        }
      >
        <div className="space-y-3">
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
          <div className="grid grid-cols-2 gap-3">
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
                placeholder="Daily"
              />
            </Field>
          </div>
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
          <Field label="Reason / notes">
            <input
              className={inputCls}
              value={draftMed.reason}
              onChange={(e) =>
                setDraftMed((d) => ({ ...d, reason: e.target.value }))
              }
              placeholder="Increases bleeding risk."
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
