"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/ScrollReveal";
import { bagCategories } from "@/data/content";

type CategoryState = (typeof bagCategories)[number];

export default function HospitalBag() {
  const [cats, setCats] = useState<CategoryState[]>(bagCategories);

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

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto space-y-12">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
            Hospital Bag
          </p>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h1 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
              Pack with{" "}
              <span className="gradient-text-static">confidence.</span>
            </h1>
            <div className="rounded-2xl glass-card-strong px-6 py-4">
              <p className="text-xs uppercase tracking-widest text-on-surface-variant">
                Packed
              </p>
              <p className="text-3xl font-extrabold gradient-text-static tabular-nums">
                {totals.done} / {totals.total}
              </p>
            </div>
          </div>
        </ScrollReveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cats.map((cat) => {
            const done = cat.items.filter((i) => i.checked).length;
            const pct = (done / cat.items.length) * 100;
            return (
              <StaggerItem key={cat.id}>
                <GlassCard className="p-6 md:p-8" tilt={false}>
                  <div className="flex items-center justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined">
                          {cat.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-on-surface">
                          {cat.title}
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                          {done} of {cat.items.length} packed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-primary tabular-nums">
                        {Math.round(pct)}%
                      </p>
                    </div>
                  </div>

                  <div className="h-1.5 w-full bg-primary-fixed/40 rounded-full overflow-hidden mb-5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#88d1e5] to-[#006172] rounded-full"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>

                  <ul className="space-y-2">
                    {cat.items.map((item) => (
                      <motion.li key={item.id} layout>
                        <button
                          onClick={() => toggle(cat.id, item.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/40 transition-colors text-left"
                        >
                          <div
                            className={`relative h-6 w-6 rounded-md flex items-center justify-center border-2 transition-colors ${
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
                                  transition={{ duration: 0.3 }}
                                  className="h-4 w-4"
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
                                    transition={{ duration: 0.3 }}
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </div>
                          <span
                            className={`flex-1 text-sm transition-all ${
                              item.checked
                                ? "text-on-surface-variant line-through"
                                : "text-on-surface"
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      </motion.li>
                    ))}
                  </ul>
                </GlassCard>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </PageShell>
  );
}
