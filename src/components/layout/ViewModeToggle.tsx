"use client";

import { motion } from "framer-motion";
import { useViewMode } from "@/lib/view-mode-context";

export default function ViewModeToggle() {
  const { mode, setMode, isEmbed, hydrated } = useViewMode();

  if (!hydrated || isEmbed) return null;

  const options: { value: "web" | "phone"; label: string; icon: string }[] = [
    { value: "web", label: "Web view", icon: "desktop_windows" },
    { value: "phone", label: "Phone view", icon: "smartphone" },
  ];

  return (
    <div className="fixed top-[15px] right-[68px] z-[110] pointer-events-auto">
      <div
        className="relative flex items-center gap-0.5 rounded-full bg-white/75 backdrop-blur-xl border border-white/60 p-0.5 shadow-[0_6px_24px_-8px_rgba(42,122,140,0.22)]"
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
              aria-label={opt.label}
              title={opt.label}
              onClick={() => setMode(opt.value)}
              className={`relative z-10 flex items-center justify-center h-7 w-7 rounded-full transition-colors ${
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
                className="material-symbols-outlined text-[16px] leading-none"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {opt.icon}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
