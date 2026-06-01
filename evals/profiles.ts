/**
 * Shared Profile fixtures for both eval workflows.
 *
 * Each fixture mixes a different procedure with a different surgery-date offset
 * from EVAL_TODAY (2026-06-01) so the snapshot + chat eval together cover:
 *   - all 5 phases (p1=T-30..T-8, p2=T-7..T-3, p3=T-1, p4=T-0, p5=post-op)
 *   - varied anxiety levels (drives prompt tone)
 *   - varied medication lists (drives interaction-checking behavior)
 *   - varied allergies (drives "don't suggest X" guardrails)
 *
 * Dates are written as YYYY-MM-DD strings — the same shape used in real profiles
 * — so we can swap EVAL_TODAY and get a different daysToSurgery without editing
 * the fixtures themselves.
 */

import type { Profile } from "@/data/user";

/** Hardcoded "today" so snapshots are deterministic. */
export const EVAL_TODAY = process.env.EVAL_TODAY ?? "2026-06-01";

/**
 * Same math as `daysUntilSurgery` in src/lib/date.ts, but pinned to EVAL_TODAY
 * instead of `new Date()`. We keep the production helper wall-clock-based
 * (since real users want the real day count) and shadow it here.
 */
function daysFromEvalTodayTo(targetISO: string): number {
  const [ty, tm, td] = targetISO.split("-").map(Number);
  const [ey, em, ed] = EVAL_TODAY.split("-").map(Number);
  const target = new Date(ty, tm - 1, td).getTime();
  const today = new Date(ey, em - 1, ed).getTime();
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/**
 * No-op kept for backwards compatibility with callers that previously needed a
 * Date monkey-patch. Safe to call multiple times. Date pinning is now handled
 * by computing daysToSurgery directly against EVAL_TODAY in this file.
 */
export function pinDateForEvals(): void {
  // intentionally empty
}

const base: Omit<Profile, "procedureId" | "procedure" | "surgeryDate" | "daysToSurgery"> = {
  firstName: "Alex",
  lastName: "Morgan",
  age: 47,
  patientId: "4920",
  surgeon: "Dr. Sarah Chen",
  hospitalName: "Memorial East",
  hospitalAddress: "421 Park Avenue, New York, NY 10022",
  hospitalCoords: "40.7587,-73.9712",
  emergencyContactName: "Jamie Morgan",
  emergencyContactPhone: "(212) 555-0142",
  bloodType: "O+",
  allergies: "Penicillin, latex",
  bloodPressure: "118/76",
  heartRate: 64,
  weightLb: 168,
  heightFtIn: "5'10\"",
  anxietyLevel: 4,
  preferredContact: "app",
  notes: "",
  readinessScore: 85,
  medications: [],
  avatar: "",
  onboardingComplete: true,
};

type ProfileSpec = {
  id: string;
  surgeryDate: string;
  procedureId: string;
  procedure: string;
  surgeon?: string;
  anxietyLevel?: number;
  allergies?: string;
  firstName?: string;
  medications?: Profile["medications"];
};

const SPECS: ProfileSpec[] = [
  // Phase 1 — T-30 to T-8 — early prep, lots of time
  {
    id: "knee-t14",
    surgeryDate: "2026-06-15", // T-14
    procedureId: "knee",
    procedure: "Knee Replacement",
    surgeon: "Dr. Sarah Chen",
    anxietyLevel: 3,
    medications: [
      { id: "m1", name: "Ibuprofen", dosage: "400mg", schedule: "Twice daily", status: "stop", reason: "Pause 7 days pre-op." },
      { id: "m2", name: "Lisinopril", dosage: "10mg", schedule: "Daily morning", status: "continue", reason: "Continue through surgery." },
    ],
  },
  // Phase 2 — T-7 to T-3 — the current "active prep" window
  {
    id: "cataract-t3",
    surgeryDate: "2026-06-04", // T-3
    procedureId: "cataract",
    procedure: "Cataract Surgery",
    surgeon: "Dr. Priya Rao",
    firstName: "Eleanor",
    anxietyLevel: 6,
    allergies: "Sulfa drugs",
    medications: [
      { id: "m1", name: "Moxifloxacin drops", dosage: "1 drop", schedule: "4× daily", status: "new", reason: "Starts 3 days pre-op." },
    ],
  },
  // Phase 3 — T-1 — day before, peak anxiety
  {
    id: "csection-t1",
    surgeryDate: "2026-06-02", // T-1
    procedureId: "csection",
    procedure: "Scheduled C-Section",
    surgeon: "Dr. Maya Patel",
    firstName: "Jordan",
    anxietyLevel: 9,
    allergies: "None",
    medications: [],
  },
  // Phase 4 — T-0 — surgery day
  {
    id: "wisdom-t0",
    surgeryDate: "2026-06-01", // T-0
    procedureId: "wisdom",
    procedure: "Wisdom Teeth Extraction",
    surgeon: "Dr. Marcus Lee",
    firstName: "Sam",
    anxietyLevel: 7,
    medications: [],
  },
  // Phase 5 — post-op — recovery
  // (Note: daysUntilSurgery() clamps to >=0, so we use T+0 + simulate via fixture id only.)
  {
    id: "hip-postop",
    surgeryDate: "2026-06-01", // also T-0; the eval uses fixture id to signal post-op context
    procedureId: "hip",
    procedure: "Hip Replacement",
    surgeon: "Dr. Helena Cruz",
    firstName: "Robert",
    anxietyLevel: 4,
    allergies: "Codeine (nausea)",
    medications: [
      { id: "m1", name: "Aspirin", dosage: "81mg", schedule: "Twice daily", status: "new", reason: "DVT prophylaxis × 4 weeks post-op." },
      { id: "m2", name: "Acetaminophen", dosage: "1000mg", schedule: "Every 6h", status: "new", reason: "Scheduled pain control." },
    ],
  },
];

export type ProfileFixture = Profile & { id: string };

/** Build all profile fixtures with daysToSurgery computed against EVAL_TODAY. */
export function getProfileFixtures(): ProfileFixture[] {
  pinDateForEvals();
  return SPECS.map((s) => ({
    ...base,
    firstName: s.firstName ?? base.firstName,
    surgeon: s.surgeon ?? base.surgeon,
    anxietyLevel: s.anxietyLevel ?? base.anxietyLevel,
    allergies: s.allergies ?? base.allergies,
    medications: s.medications ?? base.medications,
    procedureId: s.procedureId,
    procedure: s.procedure,
    surgeryDate: s.surgeryDate,
    daysToSurgery: daysFromEvalTodayTo(s.surgeryDate),
    id: s.id,
  }));
}
