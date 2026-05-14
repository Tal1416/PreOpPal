"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/profile-context";
import {
  actionDisplay,
  type PalAction,
  type PalActionResult,
} from "@/lib/pal-actions";
import type { Medication } from "@/data/content";

/**
 * Builds the function ai-store calls when Pal emits an ACTION marker.
 * Side effects: routes the user, switches procedure, or appends a medication
 * to the live profile context. Returns a `PalActionResult` for chat display.
 */
export function usePalExecutor(): (action: PalAction) => PalActionResult {
  const router = useRouter();
  const { profile, updateProfile, setProcedure } = useProfile();

  return useCallback(
    (action: PalAction): PalActionResult => {
      const display = actionDisplay(action);
      try {
        switch (action.tool) {
          case "setProcedure":
            setProcedure(action.args.procedureId);
            return { action, ok: true, ...display };
          case "navigateTo":
            router.push(action.args.path);
            return { action, ok: true, ...display };
          case "addMedication": {
            const med: Medication = {
              id: `m-${Date.now()}`,
              name: action.args.name,
              dosage: action.args.dosage ?? "",
              schedule: action.args.schedule ?? "",
              status: action.args.status ?? "continue",
              reason: action.args.reason ?? "",
            };
            updateProfile({ medications: [...profile.medications, med] });
            return { action, ok: true, ...display };
          }
        }
      } catch {
        return {
          action,
          ok: false,
          label: `Couldn't complete: ${display.label}`,
          icon: "error",
        };
      }
    },
    [router, profile.medications, updateProfile, setProcedure]
  );
}
