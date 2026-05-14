"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { procedures, type Procedure } from "@/data/procedures";

type Props = {
  value: string;
  onChange: (procedureId: string) => void;
  /**
   * Called when the patient types a surgery that isn't in our catalog and
   * picks "Use this as my procedure". We store the typed name verbatim and
   * keep a sensible template behind the scenes.
   */
  onCustom?: (name: string) => void;
  /** Current custom procedure name, if any (so it shows as selected). */
  customLabel?: string;
  /**
   * "grid" — full card grid (desktop /me, onboarding).
   * "compact" — horizontally scrolling pills + selected card detail (mobile).
   */
  variant?: "grid" | "compact";
};

function matches(p: Procedure, q: string): boolean {
  if (!q) return true;
  const haystack = [
    p.name,
    p.shortName,
    p.bodyRegion,
    p.description,
    p.emoji,
  ]
    .join(" ")
    .toLowerCase();
  // Multi-word AND match — every search token must appear somewhere.
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((tok) => haystack.includes(tok));
}

export default function ProcedurePicker({
  value,
  onChange,
  onCustom,
  customLabel,
  variant = "grid",
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => procedures.filter((p) => matches(p, query)),
    [query],
  );

  // A custom procedure is active when the displayed name diverges from the
  // catalog name for the selected procedureId (i.e. the user typed their own).
  const catalogProc = procedures.find((p) => p.id === value);
  const trimmedQuery = query.trim();
  const customActive =
    !!customLabel &&
    customLabel.trim().length > 0 &&
    customLabel.trim().toLowerCase() !==
      (catalogProc?.name ?? "").toLowerCase();
  const exactCatalogMatch = procedures.some(
    (p) => p.name.toLowerCase() === trimmedQuery.toLowerCase(),
  );
  const showCustomOption =
    !!onCustom &&
    ((trimmedQuery.length >= 2 && !exactCatalogMatch) || customActive);

  /* -------------------------- COMPACT (mobile) -------------------------- */
  if (variant === "compact") {
    const selected =
      procedures.find((p) => p.id === value) ?? procedures[0];
    const selectedName = customActive ? (customLabel as string) : selected.name;
    const selectedRegion = customActive ? "Custom procedure" : selected.bodyRegion;

    return (
      <div className="space-y-3">
        {/* search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search surgery…"
            className="w-full rounded-full border border-white/60 bg-white/80 backdrop-blur-md pl-9 pr-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none px-1">
          {filtered.map((p) => {
            const isActive = p.id === value && !customActive;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChange(p.id)}
                aria-pressed={isActive}
                className={`snap-start shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(0,97,114,0.55)]"
                    : "glass-card text-on-surface"
                }`}
              >
                <span aria-hidden className="text-[14px]">
                  {p.emoji}
                </span>
                {p.shortName}
              </button>
            );
          })}
          {showCustomOption && (
            <button
              type="button"
              onClick={() =>
                onCustom?.(customActive ? (customLabel as string) : trimmedQuery)
              }
              aria-pressed={customActive}
              className={`snap-start shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-bold transition-all border ${
                customActive
                  ? "bg-primary text-white border-primary shadow-[0_8px_20px_-8px_rgba(0,97,114,0.55)]"
                  : "glass-card text-primary border-primary/40 border-dashed"
              }`}
            >
              <span aria-hidden className="text-[14px]">＋</span>
              {customActive ? (customLabel as string) : `Use “${trimmedQuery}”`}
            </button>
          )}
          {filtered.length === 0 && !showCustomOption && (
            <div className="px-3 py-2 text-[12px] text-on-surface-variant">
              No matches. Try a different word.
            </div>
          )}
        </div>

        <motion.div
          key={customActive ? `custom-${customLabel}` : selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`relative rounded-2xl overflow-hidden p-4 text-white bg-gradient-to-br ${selected.accent}`}
        >
          <div className="flex items-start gap-3">
            <span aria-hidden className="text-2xl leading-none">
              {customActive ? "✨" : selected.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                {selectedRegion}
              </p>
              <h3 className="text-[15px] font-extrabold leading-tight">
                {selectedName}
              </h3>
              <p className="text-[11px] text-white/80 mt-1 leading-snug">
                {customActive
                  ? "Custom procedure — Pal will still help, using your name throughout the app."
                  : selected.description}
              </p>
              {!customActive && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2 py-0.5">
                    {selected.hospitalStay}
                  </span>
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2 py-0.5">
                    Recovery {selected.recoveryWindow}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------- GRID (desktop) ---------------------------- */
  return (
    <div className="space-y-5">
      {/* search */}
      <div className="relative max-w-md">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, body part, or keyword…"
          className="w-full rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md pl-12 pr-10 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-on-surface/5 flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence initial={false} mode="popLayout">
          {filtered.map((p) => {
            const isActive = p.id === value && !customActive;
            return (
              <motion.button
                key={p.id}
                layout
                type="button"
                onClick={() => onChange(p.id)}
                aria-pressed={isActive}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative text-left rounded-2xl p-5 overflow-hidden transition-all ${
                  isActive
                    ? "ring-2 ring-primary shadow-glow-teal"
                    : "ring-1 ring-white/60 hover:ring-primary/40"
                } bg-gradient-to-br ${p.accent} text-white`}
              >
                {isActive && (
                  <motion.span
                    aria-hidden
                    layoutId="proc-pick-badge"
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/95 text-primary flex items-center justify-center shadow-md"
                    transition={{ duration: 0.3 }}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check
                    </span>
                  </motion.span>
                )}
                <div className="flex items-start gap-3">
                  <span aria-hidden className="text-3xl leading-none">
                    {p.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
                      {p.bodyRegion}
                    </p>
                    <h3 className="text-[17px] font-extrabold leading-tight pr-6">
                      {p.name}
                    </h3>
                  </div>
                </div>
                <p className="text-[12px] text-white/85 mt-3 leading-snug">
                  {p.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5 text-[10px] font-bold">
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1">
                    {p.hospitalStay}
                  </span>
                  <span className="rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1">
                    Recovery {p.recoveryWindow}
                  </span>
                </div>
              </motion.button>
            );
          })}

          {/* Custom procedure tile */}
          {showCustomOption && (
            <motion.button
              key="__custom"
              layout
              type="button"
              onClick={() =>
                onCustom?.(customActive ? (customLabel as string) : trimmedQuery)
              }
              aria-pressed={customActive}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative text-left rounded-2xl p-5 overflow-hidden transition-all bg-white/70 backdrop-blur-md text-on-surface ${
                customActive
                  ? "ring-2 ring-primary shadow-glow-teal"
                  : "ring-1 ring-primary/30 ring-dashed hover:ring-primary/60"
              }`}
              style={
                customActive
                  ? undefined
                  : {
                      backgroundImage:
                        "linear-gradient(135deg, rgba(172,237,255,0.45), rgba(136,209,229,0.18))",
                    }
              }
            >
              {customActive && (
                <span
                  aria-hidden
                  className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md"
                >
                  <span
                    className="material-symbols-outlined text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                </span>
              )}
              <div className="flex items-start gap-3">
                <span aria-hidden className="text-3xl leading-none">
                  ✨
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                    Custom procedure
                  </p>
                  <h3 className="text-[17px] font-extrabold leading-tight text-on-surface pr-6">
                    {customActive
                      ? (customLabel as string)
                      : `Use “${trimmedQuery}”`}
                  </h3>
                </div>
              </div>
              <p className="text-[12px] text-on-surface-variant mt-3 leading-snug">
                Don&apos;t see your surgery? Tap to use this name throughout the
                app. Pal will still help — just with your wording.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold text-primary">
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
                {customActive ? "Selected" : "Use this name"}
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {filtered.length === 0 && !showCustomOption && (
          <div className="col-span-full glass-card rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-on-surface-variant text-3xl">
              search_off
            </span>
            <p className="mt-3 text-sm text-on-surface-variant">
              No surgeries match <strong>“{query}”</strong>. Try a different
              keyword, or type the full name to use it as a custom procedure.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
