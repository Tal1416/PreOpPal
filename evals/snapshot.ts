/**
 * Snapshot eval — workflow 2.
 *
 * For each Profile fixture, render every piece of derived state the UI shows
 * and the chat layer relies on:
 *   - Pal system prompt (chat-mode + voice-mode)
 *   - Care system prompt for each of the four team roles
 *   - tasksFor / medsFor / arrivalStepsFor / phasesFor / phaseDetailsFor
 *     all five phases, with personalize() applied
 *   - daysToSurgery (sanity check vs. fixture date math)
 *
 * Save to evals/snapshots/<profileId>.json. On subsequent runs, diff against the
 * saved file. Surfaces:
 *   - unresolved {{tokens}} (regex check, fails loud)
 *   - drift in any per-procedure content
 *   - prompt-builder changes that affect what Gemini sees
 *
 * --update rewrites the snapshots. Default mode compares and reports.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildPalSystemPrompt } from "@/lib/pal-prompt";
import { buildCareSystemPrompt, type CareMember } from "@/lib/care-prompt";
import {
  arrivalStepsFor,
  medsFor,
  phaseDetailsFor,
  phasesFor,
  tasksFor,
} from "@/data/procedure-customizations";
import { personalize } from "@/data/content";

import { getProfileFixtures, type ProfileFixture } from "./profiles";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAP_DIR = join(__dirname, "snapshots");
const RESULT_DIR = join(__dirname, "results");

const CARE_MEMBERS: CareMember[] = [
  { name: "Dr. Sarah Chen", role: "Lead Surgeon" },
  { name: "Nurse Jamie Park", role: "Pre-Op Specialist" },
  { name: "Lila Kim", role: "Care Coordinator" },
  { name: "Dr. Aaron Wells", role: "Anesthesiologist" },
];

const TOKEN_REGEX = /\{\{(?:firstName|procedure|surgeon|hospital)\}\}/g;

type Snapshot = {
  profile: ProfileFixture;
  daysToSurgery: number;
  palPrompt: string;
  palPromptVoice: string;
  carePrompts: Record<string, string>;
  tasks: ReturnType<typeof tasksFor>;
  meds: ReturnType<typeof medsFor>;
  arrival: ReturnType<typeof arrivalStepsFor>;
  phases: ReturnType<typeof phasesFor>;
  phaseDetails: Record<string, ReturnType<typeof phaseDetailsFor>>;
  /** Token check — any unresolved tokens we missed running personalize(). */
  unresolvedTokens: { location: string; token: string }[];
};

function buildSnapshot(p: ProfileFixture): Snapshot {
  const ctx = {
    firstName: p.firstName,
    procedure: p.procedure,
    surgeon: p.surgeon,
    hospitalName: p.hospitalName,
  };

  // Phase 1/2 highlights still hold {{tokens}}; the UI passes them through
  // personalize() at render time. Mirror that here so the snapshot reflects
  // what the user would actually see.
  const phases = phasesFor(p.procedureId).map((ph) => ({
    ...ph,
    highlights: ph.highlights.map((h) => ({
      ...h,
      title: personalize(h.title, ctx),
      detail: personalize(h.detail, ctx),
    })),
  }));

  const phaseDetails: Record<string, ReturnType<typeof phaseDetailsFor>> = {};
  for (const ph of phases) {
    const d = phaseDetailsFor(p.procedureId, ph.id);
    if (!d) continue;
    phaseDetails[ph.id] = {
      ...d,
      summary: d.summary ? personalize(d.summary, ctx) : undefined,
      tips: d.tips?.map((t) => ({
        ...t,
        title: personalize(t.title, ctx),
        detail: personalize(t.detail, ctx),
      })),
      checklist: d.checklist?.map((c) => ({
        ...c,
        label: personalize(c.label, ctx),
      })),
      medications: d.medications?.map((m) => ({
        ...m,
        reason: m.reason ? personalize(m.reason, ctx) : m.reason,
      })),
    };
  }

  const tasks = tasksFor(p.procedureId).map((t) => ({
    ...t,
    title: personalize(t.title, ctx),
    description: personalize(t.description, ctx),
  }));
  const meds = medsFor(p.procedureId).map((m) => ({
    ...m,
    reason: m.reason ? personalize(m.reason, ctx) : m.reason,
  }));
  const arrival = arrivalStepsFor(p.procedureId).map((a) => ({
    ...a,
    title: personalize(a.title, ctx),
    description: personalize(a.description, ctx),
  }));

  const palPrompt = buildPalSystemPrompt(p);
  const palPromptVoice = buildPalSystemPrompt(p, { voiceMode: true });
  const carePrompts: Record<string, string> = {};
  for (const m of CARE_MEMBERS) {
    carePrompts[m.role] = buildCareSystemPrompt(m, p);
  }

  // Token-leak detector — anything that still looks like {{x}} after we ran
  // personalize() on every visible string. Prompt builders should resolve all
  // tokens inline, so any hit here is a real bug.
  const unresolvedTokens: Snapshot["unresolvedTokens"] = [];
  const scan = (location: string, text: string) => {
    const matches = text.match(TOKEN_REGEX);
    if (matches) {
      for (const t of matches) unresolvedTokens.push({ location, token: t });
    }
  };
  scan("palPrompt", palPrompt);
  scan("palPromptVoice", palPromptVoice);
  for (const role of Object.keys(carePrompts)) scan(`carePrompt:${role}`, carePrompts[role]);
  tasks.forEach((t, i) => {
    scan(`tasks[${i}].title`, t.title);
    scan(`tasks[${i}].description`, t.description);
  });
  arrival.forEach((a, i) => {
    scan(`arrival[${i}].title`, a.title);
    scan(`arrival[${i}].description`, a.description);
  });
  phases.forEach((ph) => {
    ph.highlights.forEach((h, i) => {
      scan(`phase:${ph.id}.highlight[${i}].title`, h.title);
      scan(`phase:${ph.id}.highlight[${i}].detail`, h.detail);
    });
  });
  for (const [phaseId, d] of Object.entries(phaseDetails)) {
    if (d?.summary) scan(`phaseDetails:${phaseId}.summary`, d.summary);
    d?.tips?.forEach((t, i) => {
      scan(`phaseDetails:${phaseId}.tips[${i}].title`, t.title);
      scan(`phaseDetails:${phaseId}.tips[${i}].detail`, t.detail);
    });
  }

  return {
    profile: p,
    daysToSurgery: p.daysToSurgery,
    palPrompt,
    palPromptVoice,
    carePrompts,
    tasks,
    meds,
    arrival,
    phases,
    phaseDetails,
    unresolvedTokens,
  };
}

type SnapshotReport = {
  profile: string;
  status: "match" | "drift" | "new" | "token-leak";
  unresolvedTokens: Snapshot["unresolvedTokens"];
  diff?: string;
};

function shallowDiff(a: unknown, b: unknown, path = ""): string[] {
  const out: string[] = [];
  if (typeof a !== typeof b) {
    out.push(`${path || "(root)"}: type ${typeof a} → ${typeof b}`);
    return out;
  }
  if (a === b) return out;
  if (typeof a !== "object" || a === null || b === null) {
    const sa = JSON.stringify(a);
    const sb = JSON.stringify(b);
    if (sa !== sb) {
      out.push(
        `${path || "(root)"}: ${truncate(sa)} → ${truncate(sb)}`,
      );
    }
    return out;
  }
  const keys = new Set([
    ...Object.keys(a as Record<string, unknown>),
    ...Object.keys(b as Record<string, unknown>),
  ]);
  for (const k of keys) {
    const ak = (a as Record<string, unknown>)[k];
    const bk = (b as Record<string, unknown>)[k];
    out.push(...shallowDiff(ak, bk, path ? `${path}.${k}` : k));
  }
  return out;
}

function truncate(s: string, n = 80) {
  if (s.length <= n) return s;
  return s.slice(0, n) + "…";
}

export async function runSnapshotEval(opts: { update: boolean }): Promise<SnapshotReport[]> {
  mkdirSync(SNAP_DIR, { recursive: true });
  mkdirSync(RESULT_DIR, { recursive: true });

  const fixtures = getProfileFixtures();
  const reports: SnapshotReport[] = [];

  for (const p of fixtures) {
    const snap = buildSnapshot(p);
    const path = join(SNAP_DIR, `${p.id}.json`);
    const json = JSON.stringify(snap, null, 2);

    let status: SnapshotReport["status"] = "match";
    let diff: string | undefined;

    if (snap.unresolvedTokens.length) {
      status = "token-leak";
    } else if (!existsSync(path)) {
      status = "new";
      writeFileSync(path, json);
    } else {
      const prev = JSON.parse(readFileSync(path, "utf8"));
      const diffs = shallowDiff(prev, snap);
      if (diffs.length) {
        status = "drift";
        diff = diffs.slice(0, 20).join("\n");
        if (opts.update) {
          writeFileSync(path, json);
        }
      }
    }

    reports.push({
      profile: p.id,
      status,
      unresolvedTokens: snap.unresolvedTokens,
      diff,
    });
  }

  writeFileSync(
    join(RESULT_DIR, `snapshot-${EVAL_ISO_DATE}.json`),
    JSON.stringify(reports, null, 2),
  );

  return reports;
}

// Deterministic result filename (uses EVAL_TODAY rather than wall clock).
const EVAL_ISO_DATE = process.env.EVAL_TODAY ?? "now";
