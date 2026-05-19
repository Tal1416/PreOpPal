"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export type ChecklistKind = "bag" | "task" | "phase";

type State = {
  /** Set of currently-checked item ids. */
  checked: Set<string>;
  /** True after the initial fetch (or skipped fetch for logged-out users). */
  hydrated: boolean;
  isChecked: (itemId: string) => boolean;
  /** Optimistically flips local state and POSTs to /api/checklist. */
  setChecked: (itemId: string, checked: boolean) => void;
  toggle: (itemId: string) => void;
};

/**
 * Per-user persistent checklist state. Reads on mount/login, writes on every
 * toggle. Falls back to a purely in-memory set when the user is logged out
 * (e.g. landing-page previews) so behavior is graceful.
 */
export function useChecklist(kind: ChecklistKind): State {
  const { isAuthenticated, hydrated: authHydrated } = useAuth();
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  // Avoid stale closure inside async handlers
  const checkedRef = useRef(checked);
  checkedRef.current = checked;

  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      setChecked(new Set());
      setHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/checklist?kind=${kind}`, {
          cache: "no-store",
        });
        if (!cancelled && res.ok) {
          const json = (await res.json()) as { checked: string[] };
          setChecked(new Set(json.checked));
        }
      } catch {
        // ignore — leave empty
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated, kind]);

  const persist = useCallback(
    async (itemId: string, nextChecked: boolean) => {
      if (!isAuthenticated) return;
      try {
        await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind, itemId, checked: nextChecked }),
        });
      } catch (err) {
        console.warn("[checklist] persist failed", err);
      }
    },
    [isAuthenticated, kind],
  );

  const setItem = useCallback(
    (itemId: string, nextChecked: boolean) => {
      setChecked((cur) => {
        const next = new Set(cur);
        if (nextChecked) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
      void persist(itemId, nextChecked);
    },
    [persist],
  );

  const toggle = useCallback(
    (itemId: string) => {
      setItem(itemId, !checkedRef.current.has(itemId));
    },
    [setItem],
  );

  const isChecked = useCallback(
    (itemId: string) => checked.has(itemId),
    [checked],
  );

  return {
    checked,
    hydrated,
    isChecked,
    setChecked: setItem,
    toggle,
  };
}
