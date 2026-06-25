/**
 * Demo-account self-provisioning.
 *
 * The login screen advertises a public demo account (demo@preoppal.app /
 * preop-demo) so anyone can click in and see a fully-furnished app. The
 * "proper" way to create that user is `npm run db:seed`, but that needs the
 * service-role key. To keep the live demo bulletproof without any secret, the
 * signin route falls back to creating + furnishing the account on the very
 * first login attempt. Everyone after that just signs in normally.
 *
 * `furnishDemoProfile` writes the same lived-in data the seed script does, but
 * using the caller's own (RLS-bound) session — which is allowed because the
 * profiles / medications / checklist_state policies all permit
 * `auth.uid() = id/user_id`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultProfile } from "@/data/user";
import { medications as defaultMedications } from "@/data/content";

// Kept in sync with the constants exported from auth-context.tsx (client) and
// scripts/seed-demo-user.ts. Duplicated here so this server-only module never
// pulls in the "use client" auth context.
export const DEMO_EMAIL = "demo@preoppal.app";
export const DEMO_PASSWORD = "preop-demo";

export function isDemoCredentials(email: string, password: string): boolean {
  return email === DEMO_EMAIL && password === DEMO_PASSWORD;
}

/**
 * Upsert the furnished demo profile, medications, and a few pre-checked items
 * for `userId`. Idempotent — safe to call more than once. Uses the provided
 * client, so RLS sees the demo user as the owner of every row it writes.
 */
export async function furnishDemoProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const p = defaultProfile;

  // Profile — mirror the column mapping in scripts/seed-demo-user.ts, plus
  // onboarding_complete=true so the dashboard skips the onboarding overlay.
  const { error: profileErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      first_name: p.firstName,
      last_name: p.lastName,
      age: p.age,
      patient_id: p.patientId,
      procedure_id: p.procedureId,
      procedure: p.procedure,
      surgeon: p.surgeon,
      surgery_date: p.surgeryDate,
      hospital_name: p.hospitalName,
      hospital_address: p.hospitalAddress,
      hospital_coords: p.hospitalCoords,
      emergency_contact_name: p.emergencyContactName,
      emergency_contact_phone: p.emergencyContactPhone,
      blood_type: p.bloodType,
      allergies: p.allergies,
      blood_pressure: p.bloodPressure,
      heart_rate: p.heartRate,
      weight_lb: p.weightLb,
      height_ft_in: p.heightFtIn,
      anxiety_level: p.anxietyLevel,
      preferred_contact: p.preferredContact,
      notes: p.notes,
      avatar: p.avatar,
      onboarding_complete: true,
    },
    { onConflict: "id" },
  );
  if (profileErr) throw profileErr;

  // Medications — replace any existing rows so re-runs stay clean.
  const { error: delErr } = await supabase
    .from("medications")
    .delete()
    .eq("user_id", userId);
  if (delErr) throw delErr;

  if (defaultMedications.length) {
    const rows = defaultMedications.map((m, i) => ({
      user_id: userId,
      name: m.name,
      dosage: m.dosage,
      schedule: m.schedule,
      status: m.status,
      reason: m.reason,
      days_left: m.daysLeft ?? null,
      sort_order: i,
    }));
    const { error: insErr } = await supabase.from("medications").insert(rows);
    if (insErr) throw insErr;
  }

  // A handful of pre-checked items so the demo feels lived-in.
  const checks: { kind: "bag" | "task"; item_id: string }[] = [
    { kind: "bag", item_id: "id" },
    { kind: "bag", item_id: "advance" },
    { kind: "bag", item_id: "robe" },
    { kind: "bag", item_id: "headphones" },
    { kind: "task", item_id: "consent" },
  ];
  const { error: checkErr } = await supabase.from("checklist_state").upsert(
    checks.map((c) => ({ user_id: userId, kind: c.kind, item_id: c.item_id })),
    { onConflict: "user_id,kind,item_id" },
  );
  if (checkErr) throw checkErr;
}
