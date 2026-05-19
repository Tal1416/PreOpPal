/**
 * Idempotent demo-user seeder.
 *
 * Run with: `npm run db:seed`
 *
 * Creates (or finds) the demo@preoppal.app user, then upserts a populated
 * profile + medications + sample checked items so anyone can log into the
 * deployed demo and immediately see a fully-furnished app.
 */

import { createClient } from "@supabase/supabase-js";
import { defaultProfile } from "../src/data/user";
import { medications as defaultMedications } from "../src/data/content";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const DEMO_EMAIL = "demo@preoppal.app";
const DEMO_PASSWORD = "preop-demo";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findOrCreateUser(): Promise<string> {
  // listUsers is paginated. The demo project has very few users, so page 1 is fine.
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) {
    console.log(`✔ user already exists (${existing.id})`);
    return existing.id;
  }
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });
  if (createErr) throw createErr;
  if (!created.user) throw new Error("createUser returned no user");
  console.log(`+ created user ${created.user.id}`);
  return created.user.id;
}

async function upsertProfile(userId: string): Promise<void> {
  const p = defaultProfile;
  const { error } = await supabase
    .from("profiles")
    .upsert(
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
  if (error) throw error;
  console.log("✔ profile upserted");
}

async function replaceMedications(userId: string): Promise<void> {
  const { error: delErr } = await supabase
    .from("medications")
    .delete()
    .eq("user_id", userId);
  if (delErr) throw delErr;

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
  console.log(`✔ inserted ${rows.length} medications`);
}

async function seedSampleChecks(userId: string): Promise<void> {
  // A handful of pre-checked items so the demo feels lived-in.
  const items: { kind: "bag" | "task"; item_id: string }[] = [
    { kind: "bag", item_id: "id" }, // photo ID + insurance card
    { kind: "bag", item_id: "advance" }, // advance directive copy
    { kind: "bag", item_id: "robe" }, // loose-fitting robe
    { kind: "bag", item_id: "headphones" }, // headphones + playlist
    { kind: "task", item_id: "consent" }, // sign consent forms
  ];
  const rows = items.map((i) => ({
    user_id: userId,
    kind: i.kind,
    item_id: i.item_id,
  }));
  const { error } = await supabase
    .from("checklist_state")
    .upsert(rows, { onConflict: "user_id,kind,item_id" });
  if (error) throw error;
  console.log(`✔ seeded ${rows.length} sample checklist items`);
}

async function main() {
  console.log(`Seeding demo user → ${DEMO_EMAIL}`);
  const userId = await findOrCreateUser();
  await upsertProfile(userId);
  await replaceMedications(userId);
  await seedSampleChecks(userId);
  console.log("Done.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
