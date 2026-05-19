"use client";

import Modal from "@/components/ui/Modal";
import { Phase, PhaseDetails, personalize } from "@/data/content";
import { useProfile } from "@/lib/profile-context";
import { useChecklist } from "@/lib/useChecklist";

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

type Props = {
  open: boolean;
  onClose: () => void;
  phase: Phase | null;
  details?: PhaseDetails;
};

export default function PhaseDetailModal({
  open,
  onClose,
  phase,
  details,
}: Props) {
  const { profile } = useProfile();
  const { isChecked, setChecked } = useChecklist("phase");

  if (!phase) return null;

  const stateBadge =
    phase.state === "current" ? (
      <span className="rounded-full bg-primary text-white px-3 py-1 text-[10px] font-bold tracking-widest">
        IN PROGRESS
      </span>
    ) : phase.state === "complete" ? (
      <span className="rounded-full bg-primary-fixed/40 text-primary px-3 py-1 text-[10px] font-bold tracking-widest">
        COMPLETE
      </span>
    ) : (
      <span className="rounded-full bg-white/60 text-on-surface-variant px-3 py-1 text-[10px] font-bold tracking-widest">
        UPCOMING
      </span>
    );

  const meds = details?.medications ?? [];
  const checklist = details?.checklist ?? [];
  const tips = details?.tips ?? [];

  const checkedCount = checklist.filter((c) => isChecked(c.id)).length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={phase.title}
      description={`${phase.label} · ${phase.range}`}
      icon="event"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        <div className="flex items-center justify-between">
          {stateBadge}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">
              progress_activity
            </span>
            <span className="font-bold">{Math.round(phase.progress * 100)}%</span>
            <span>complete</span>
          </div>
        </div>

        {details?.summary && (
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {personalize(details.summary, profile)}
          </p>
        )}

        {phase.highlights.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Highlights
            </h3>
            <ul className="space-y-2">
              {phase.highlights.map((h) => (
                <li
                  key={h.title}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-white/50"
                >
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    {h.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface">
                      {personalize(h.title, profile)}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {personalize(h.detail, profile)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {meds.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Medications this phase
            </h3>
            <ul className="space-y-2">
              {meds.map((m) => {
                const theme = STATUS_THEME[m.status];
                return (
                  <li
                    key={m.id}
                    className={`p-3 rounded-2xl bg-white/50 ${
                      m.status === "stop" ? "border-l-4 border-error" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface">
                          {m.name}{" "}
                          <span className="text-on-surface-variant font-normal">
                            · {m.dosage}
                          </span>
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {m.schedule}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-widest ${theme.badge}`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {theme.icon}
                        </span>
                        {theme.label}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-2 leading-snug">
                      {personalize(m.reason, profile)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {checklist.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                Checklist
              </h3>
              <span className="text-[11px] font-bold text-on-surface-variant">
                {checkedCount}/{checklist.length}
              </span>
            </div>
            <ul className="space-y-1.5">
              {checklist.map((item) => {
                const itemChecked = isChecked(item.id);
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setChecked(item.id, !itemChecked)}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/50 hover:bg-white text-left transition-colors"
                    >
                      <span
                        className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                          itemChecked
                            ? "bg-primary text-white"
                            : "border-2 border-on-surface-variant/40"
                        }`}
                      >
                        {itemChecked && (
                          <span className="material-symbols-outlined text-[14px]">
                            check
                          </span>
                        )}
                      </span>
                      <span
                        className={`text-sm ${
                          itemChecked
                            ? "line-through text-on-surface-variant"
                            : "text-on-surface"
                        }`}
                      >
                        {personalize(item.label, profile)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {tips.length > 0 && (
          <section>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              Tips
            </h3>
            <ul className="space-y-2">
              {tips.map((t) => (
                <li
                  key={t.title}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-gradient-to-br from-[#b0ecfe]/30 to-[#88d1e5]/20"
                >
                  <span className="material-symbols-outlined text-primary mt-0.5">
                    {t.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface">
                      {t.title}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {personalize(t.detail, profile)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Modal>
  );
}
