"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when expensive visual effects should be disabled or cheapened.
 *
 * Triggers on:
 *   - `prefers-reduced-motion: reduce` (any device)
 *   - coarse pointer (touch) + narrow viewport (≤ 900px), i.e. real phones
 *
 * As a side effect, toggles a `data-reduce-effects` attribute on `<html>`
 * so CSS can react (e.g. cheapen `backdrop-filter`, stop infinite animations).
 *
 * SSR-safe: returns `false` until mount to avoid hydration mismatch.
 */
export function useReduceEffects() {
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    const mqNarrow = window.matchMedia("(max-width: 900px)");

    const update = () => {
      const v = mqMotion.matches || (mqCoarse.matches && mqNarrow.matches);
      setReduce(v);
      if (v) {
        document.documentElement.setAttribute("data-reduce-effects", "");
      } else {
        document.documentElement.removeAttribute("data-reduce-effects");
      }
    };

    update();

    // Safari < 14 used `addListener`; modern browsers use `addEventListener`.
    const add = (mq: MediaQueryList, fn: () => void) => {
      if (mq.addEventListener) mq.addEventListener("change", fn);
      else mq.addListener(fn);
    };
    const remove = (mq: MediaQueryList, fn: () => void) => {
      if (mq.removeEventListener) mq.removeEventListener("change", fn);
      else mq.removeListener(fn);
    };

    add(mqMotion, update);
    add(mqCoarse, update);
    add(mqNarrow, update);

    return () => {
      remove(mqMotion, update);
      remove(mqCoarse, update);
      remove(mqNarrow, update);
    };
  }, []);

  return reduce;
}
