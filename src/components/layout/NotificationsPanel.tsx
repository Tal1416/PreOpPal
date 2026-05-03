"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";
import { bagCategories, personalize, todayTasks } from "@/data/content";

type Severity = "critical" | "due" | "info";

type Notification = {
  id: string;
  icon: string;
  title: string;
  body: string;
  severity: Severity;
  href?: string;
};

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 0,
  due: 1,
  info: 2,
};

const SEVERITY_STYLES: Record<
  Severity,
  { wrap: string; chip: string; label: string }
> = {
  critical: {
    wrap: "bg-error/10 text-error",
    chip: "bg-error text-white",
    label: "Critical",
  },
  due: {
    wrap: "bg-amber-500/10 text-amber-700",
    chip: "bg-amber-500 text-white",
    label: "Due today",
  },
  info: {
    wrap: "bg-primary/10 text-primary",
    chip: "bg-primary/15 text-primary",
    label: "Reminder",
  },
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationsPanel({ open, onClose }: Props) {
  const { profile } = useProfile();
  const { isEmbed } = useViewMode();

  const notifications = useMemo<Notification[]>(() => {
    const list: Notification[] = [];
    const days = profile.daysToSurgery;
    const ctx = {
      firstName: profile.firstName,
      procedure: profile.procedure,
      surgeon: profile.surgeon,
      hospitalName: profile.hospitalName,
    };

    if (days >= 0) {
      const countdownSeverity: Severity =
        days <= 2 ? "critical" : days <= 7 ? "due" : "info";
      list.push({
        id: "countdown",
        icon: "event",
        title:
          days === 0
            ? "Surgery is today"
            : days === 1
            ? "Surgery is tomorrow"
            : `${days} days until surgery`,
        body: `${profile.procedure} with ${profile.surgeon} at ${profile.hospitalName}.`,
        severity: countdownSeverity,
        href: "/timeline",
      });
    }

    for (const med of profile.medications) {
      if (med.status === "stop") {
        list.push({
          id: `med-${med.id}`,
          icon: "block",
          title: `Don't take ${med.name} today`,
          body: personalize(med.reason, ctx),
          severity: "critical",
          href: "/medications",
        });
      } else if (med.status === "continue") {
        list.push({
          id: `med-${med.id}`,
          icon: "medication",
          title: `Take ${med.name} ${med.dosage.toLowerCase()}`,
          body: personalize(`${med.schedule} — ${med.reason}`, ctx),
          severity: "due",
          href: "/medications",
        });
      }
    }

    for (const task of todayTasks) {
      if (task.status === "done") continue;
      list.push({
        id: `task-${task.id}`,
        icon: task.icon,
        title: task.title,
        body: personalize(task.description, ctx),
        severity: task.status === "critical" ? "critical" : "due",
      });
    }

    for (const cat of bagCategories) {
      const missing = cat.items.filter((i) => !i.checked);
      if (!missing.length) continue;
      list.push({
        id: `bag-${cat.id}`,
        icon: cat.icon,
        title: `Still to pack: ${cat.title.toLowerCase()}`,
        body: missing.map((m) => m.label).join(", "),
        severity: "info",
        href: "/bag",
      });
    }

    return list.sort(
      (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
    );
  }, [profile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const criticalCount = notifications.filter(
    (n) => n.severity === "critical"
  ).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            aria-hidden
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed z-50 glass-card-strong rounded-3xl shadow-glass-lg overflow-hidden flex flex-col ${
              isEmbed
                ? "top-[92px] left-3 right-3 max-h-[70vh]"
                : "top-[68px] right-4 lg:right-6 w-[380px] max-w-[calc(100vw-2rem)] max-h-[min(560px,75vh)]"
            }`}
          >
            <div
              className="shrink-0 px-5 py-4 border-b border-white/40 flex items-center gap-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,97,114,0.92), rgba(42,122,140,0.92))",
              }}
            >
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#acedff] to-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-primary">
                  notifications
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-white">
                  Notifications
                </p>
                <p className="text-[11px] text-white/70 font-medium">
                  {notifications.length === 0
                    ? "You're all caught up"
                    : `${notifications.length} update${
                        notifications.length === 1 ? "" : "s"
                      }${
                        criticalCount > 0 ? ` · ${criticalCount} critical` : ""
                      }`}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close notifications"
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-2 bg-white/40"
            >
              {notifications.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-on-surface-variant">
                  Nothing pressing right now. Pal will ping you when something
                  changes.
                </div>
              ) : (
                notifications.map((n) => {
                  const styles = SEVERITY_STYLES[n.severity];
                  const content = (
                    <div className="flex items-start gap-3 rounded-2xl bg-white/85 hover:bg-white border border-white/70 p-3 transition-colors">
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${styles.wrap}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {n.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[13px] font-bold text-on-surface truncate">
                            {n.title}
                          </p>
                          <span
                            className={`shrink-0 text-[9px] uppercase tracking-widest font-bold rounded-full px-1.5 py-0.5 ${styles.chip}`}
                          >
                            {styles.label}
                          </span>
                        </div>
                        <p className="text-[12px] text-on-surface-variant leading-snug">
                          {n.body}
                        </p>
                      </div>
                      {n.href && (
                        <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px] self-center">
                          chevron_right
                        </span>
                      )}
                    </div>
                  );
                  return n.href ? (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={onClose}
                      className="block"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
