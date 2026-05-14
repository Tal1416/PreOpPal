"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Confetti from "./Confetti";

function PairedToastInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (params.get("paired") !== "1") return;
    setVisible(true);
    // Clear the query so refreshes don't re-trigger.
    const next = new URLSearchParams(params.toString());
    next.delete("paired");
    const qs = next.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    const t = window.setTimeout(() => setVisible(false), 4200);
    return () => clearTimeout(t);
  }, [params, pathname, router]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[130] pointer-events-auto"
        >
          <div className="relative glass-card-strong rounded-full pl-2 pr-4 py-2 flex items-center gap-3 shadow-[0_18px_40px_-12px_rgba(0,97,114,0.45)]">
            <div className="relative h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white">
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <Confetti count={28} duration={2.2} />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-primary">
                Paired
              </p>
              <p className="text-[12px] font-bold text-on-surface">
                Your prep just teleported to this device.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function PairedToast() {
  return (
    <Suspense fallback={null}>
      <PairedToastInner />
    </Suspense>
  );
}
