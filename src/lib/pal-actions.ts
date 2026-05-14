import { procedures } from "@/data/procedures";
import type { Medication } from "@/data/content";

export const NAV_PATHS = [
  "/dashboard",
  "/me",
  "/timeline",
  "/medications",
  "/bag",
  "/arrival",
  "/care",
] as const;
export type NavPath = (typeof NAV_PATHS)[number];

export type PalAction =
  | {
      tool: "setProcedure";
      args: { procedureId: string };
    }
  | {
      tool: "navigateTo";
      args: { path: NavPath };
    }
  | {
      tool: "addMedication";
      args: {
        name: string;
        dosage?: string;
        schedule?: string;
        status?: Medication["status"];
        reason?: string;
      };
    };

export type PalActionResult = {
  action: PalAction;
  ok: boolean;
  label: string;
  icon: string;
};

const ACTION_LINE = /^ACTION:\s*(\{.*\})\s*$/gm;

/**
 * Pulls out any `ACTION: { ... }` lines from the streamed text and returns
 * the cleaned text plus the parsed actions. Tolerant: invalid JSON or
 * unknown tools are silently dropped (the natural text has already given
 * the user the answer; a busted action is not worth a chat error).
 */
export function parsePalActions(raw: string): {
  strippedText: string;
  actions: PalAction[];
} {
  const actions: PalAction[] = [];
  const strippedText = raw
    .replace(ACTION_LINE, (_match, json: string) => {
      const parsed = tryParseAction(json);
      if (parsed) actions.push(parsed);
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { strippedText, actions };
}

/**
 * For streaming display: hide everything from the first `ACTION:` token
 * onwards, even if the closing brace hasn't arrived yet. This keeps the
 * user from seeing a half-formed JSON tail flicker into view.
 */
export function stripPartialActions(raw: string): string {
  const idx = raw.indexOf("\nACTION:");
  const strippedTail = idx === -1 ? raw : raw.slice(0, idx);
  return parsePalActions(strippedTail).strippedText || strippedTail.trim();
}

function tryParseAction(json: string): PalAction | null {
  try {
    const obj = JSON.parse(json) as { tool?: string; args?: unknown };
    if (!obj || typeof obj !== "object" || typeof obj.tool !== "string") {
      return null;
    }
    if (obj.tool === "setProcedure") {
      const args = obj.args as { procedureId?: string } | undefined;
      const procedureId = args?.procedureId;
      if (
        typeof procedureId === "string" &&
        procedures.some((p) => p.id === procedureId)
      ) {
        return { tool: "setProcedure", args: { procedureId } };
      }
      return null;
    }
    if (obj.tool === "navigateTo") {
      const args = obj.args as { path?: string } | undefined;
      const path = args?.path;
      if (typeof path === "string" && (NAV_PATHS as readonly string[]).includes(path)) {
        return { tool: "navigateTo", args: { path: path as NavPath } };
      }
      return null;
    }
    if (obj.tool === "addMedication") {
      const args = obj.args as Record<string, unknown> | undefined;
      const name = typeof args?.name === "string" ? args.name.trim() : "";
      if (!name) return null;
      const status =
        args?.status === "stop" ||
        args?.status === "continue" ||
        args?.status === "new"
          ? args.status
          : "continue";
      return {
        tool: "addMedication",
        args: {
          name,
          dosage: typeof args?.dosage === "string" ? args.dosage : "",
          schedule: typeof args?.schedule === "string" ? args.schedule : "",
          status,
          reason: typeof args?.reason === "string" ? args.reason : "",
        },
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function actionDisplay(action: PalAction): { label: string; icon: string } {
  switch (action.tool) {
    case "setProcedure": {
      const proc = procedures.find((p) => p.id === action.args.procedureId);
      return {
        label: `Switched your procedure to ${proc?.name ?? action.args.procedureId}`,
        icon: "auto_awesome",
      };
    }
    case "navigateTo":
      return {
        label: `Opening ${action.args.path}`,
        icon: "open_in_new",
      };
    case "addMedication":
      return {
        label: `Added ${action.args.name}${
          action.args.dosage ? ` ${action.args.dosage}` : ""
        } to your medications`,
        icon: "medication",
      };
  }
}
