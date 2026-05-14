"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bagCategories, BagCategory } from "@/data/content";
import { bagCategoriesFor } from "@/data/procedures";
import { useProfile } from "@/lib/profile-context";

export default function BagMobile() {
  const { profile, currentProcedure } = useProfile();
  const [cats, setCats] = useState<BagCategory[]>(() =>
    bagCategoriesFor(profile.procedureId, bagCategories)
  );

  useEffect(() => {
    setCats(bagCategoriesFor(profile.procedureId, bagCategories));
  }, [profile.procedureId]);

  const totals = useMemo(() => {
    const all = cats.flatMap((c) => c.items);
    return {
      done: all.filter((i) => i.checked).length,
      total: all.length,
    };
  }, [cats]);

  function toggle(catId: string, itemId: string) {
    setCats((cur) =>
      cur.map((c) =>
        c.id === catId
          ? {
              ...c,
              items: c.items.map((i) =>
                i.id === itemId ? { ...i, checked: !i.checked } : i
              ),
            }
          : c
      )
    );
  }

  const overallPct = (totals.done / totals.total) * 100;

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
            Hospital Bag
          </p>
          <h1 className="mt-1 text-[22px] leading-tight font-extrabold tracking-tight">
            Pack with{" "}
            <span className="text-[#acedff]">confidence.</span>
          </h1>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-1 text-[10px] font-bold text-white/90">
            <span aria-hidden>{currentProcedure.emoji}</span>
            For your {currentProcedure.shortName}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#acedff] rounded-full"
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="text-[14px] font-extrabold tabular-nums">
              {totals.done}
              <span className="text-white/60 font-bold">
                {" "}
                / {totals.total}
              </span>
            </p>
          </div>
        </div>
      </motion.section>

      {/* CATEGORIES */}
      <section className="space-y-3">
        {cats.map((cat, idx) => {
          const done = cat.items.filter((i) => i.checked).length;
          const pct = (done / cat.items.length) * 100;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.05 + idx * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="glass-card rounded-3xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]">
                    {cat.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[15px] font-extrabold text-on-surface leading-tight">
                    {cat.title}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    {done} of {cat.items.length} packed
                  </p>
                </div>
                <p className="text-[18px] font-extrabold text-primary tabular-nums">
                  {Math.round(pct)}%
                </p>
              </div>

              <div className="px-4">
                <div className="h-1 w-full bg-primary-fixed/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#88d1e5] to-[#006172] rounded-full"
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>

              <ul className="mt-2 pb-2">
                {cat.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(cat.id, item.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 active:bg-white/40 transition-colors text-left"
                    >
                      <div
                        className={`relative h-5 w-5 rounded-md flex items-center justify-center border-2 transition-colors shrink-0 ${
                          item.checked
                            ? "bg-primary border-primary"
                            : "bg-white/70 border-primary/30"
                        }`}
                      >
                        <AnimatePresence>
                          {item.checked && (
                            <motion.svg
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="h-3.5 w-3.5"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <motion.path
                                d="M5 12l5 5L20 7"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.25 }}
                              />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </div>
                      <span
                        className={`flex-1 text-[13px] transition-all ${
                          item.checked
                            ? "text-on-surface-variant line-through"
                            : "text-on-surface"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </section>
    </div>
  );
}
