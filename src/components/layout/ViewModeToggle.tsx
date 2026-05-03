"use client";

import { motion } from "framer-motion";
import { useViewMode } from "@/lib/view-mode-context";

export default function ViewModeToggle() {
  const { mode, setMode, isEmbed, hydrated } = useViewMode();

  if (!hydrated || isEmbed) return null;

  const options: { value: "web" | "phone"; label: string; icon: string }[] = [
    { value: "web", label: "Web", icon: "desktop_windows" },
    { value: "phone", label: "Phone", icon: "smartphone" },
  ];

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[110] pointer-events-auto">
      <div
        className="relative flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-xl border border-white/60 p-1 shadow-[0_10px_40px_-10px_rgba(42,122,140,0.25)]"
        role="tablist"
        aria-label="View mode"
      >
        {options.map((opt) => {
          const isActive = mode === opt.value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setMode(opt.value)}
              className={`relative z-10 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive ? "text-white" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="view-mode-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2a7a8c] to-[#006172] -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className="material-symbols-outlined text-base"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {opt.icon}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
