/**
 * Hand-written DB row types + mappers between snake_case Postgres rows and the
 * camelCase Profile / Medication types used throughout the app.
 *
 * Keep this file in sync with /supabase/migrations/0001_init.sql.
 */
import type { Profile } from "@/data/user";
import type { Medication } from "@/data/content";

// --- profiles ---------------------------------------------------------------

export type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  age: number;
  patient_id: string;
  procedure_id: string;
  procedure: string;
  surgeon: string;
  surgery_date: string | null; // "YYYY-MM-DD"
  hospital_name: string;
  hospital_address: string;
  hospital_coords: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_type: string;
  allergies: string;
  blood_pressure: string;
  heart_rate: number;
  weight_lb: number;
  height_ft_in: string;
  anxiety_level: number;
  preferred_contact: "app" | "phone" | "email";
  notes: string;
  avatar: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

/** Convert a DB row to the partial Profile shape consumed by the client.
 *  daysToSurgery + readinessScore are derived client-side; medications come
 *  from a separate query. */
export function profileRowToProfile(
  row: ProfileRow,
): Omit<Profile, "daysToSurgery" | "readinessScore" | "medications"> {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    age: row.age,
    patientId: row.patient_id,
    procedureId: row.procedure_id,
    procedure: row.procedure,
    surgeon: row.surgeon,
    surgeryDate: row.surgery_date ?? "",
    hospitalName: row.hospital_name,
    hospitalAddress: row.hospital_address,
    hospitalCoords: row.hospital_coords,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    bloodType: row.blood_type,
    allergies: row.allergies,
    bloodPressure: row.blood_pressure,
    heartRate: row.heart_rate,
    weightLb: row.weight_lb,
    heightFtIn: row.height_ft_in,
    anxietyLevel: row.anxiety_level,
    preferredContact: row.preferred_contact,
    notes: row.notes,
    avatar: row.avatar,
    onboardingComplete: row.onboarding_complete,
  };
}

/** Convert a partial camelCase Profile into a snake_case patch for UPDATE. */
export function profilePatchToRow(
  patch: Partial<Profile>,
): Partial<Omit<ProfileRow, "id" | "created_at" | "updated_at">> {
  const out: Partial<ProfileRow> = {};
  if (patch.firstName !== undefined) out.first_name = patch.firstName;
  if (patch.lastName !== undefined) out.last_name = patch.lastName;
  if (patch.age !== undefined) out.age = patch.age;
  if (patch.patientId !== undefined) out.patient_id = patch.patientId;
  if (patch.procedureId !== undefined) out.procedure_id = patch.procedureId;
  if (patch.procedure !== undefined) out.procedure = patch.procedure;
  if (patch.surgeon !== undefined) out.surgeon = patch.surgeon;
  if (patch.surgeryDate !== undefined) {
    out.surgery_date = patch.surgeryDate === "" ? null : patch.surgeryDate;
  }
  if (patch.hospitalName !== undefined) out.hospital_name = patch.hospitalName;
  if (patch.hospitalAddress !== undefined)
    out.hospital_address = patch.hospitalAddress;
  if (patch.hospitalCoords !== undefined)
    out.hospital_coords = patch.hospitalCoords;
  if (patch.emergencyContactName !== undefined)
    out.emergency_contact_name = patch.emergencyContactName;
  if (patch.emergencyContactPhone !== undefined)
    out.emergency_contact_phone = patch.emergencyContactPhone;
  if (patch.bloodType !== undefined) out.blood_type = patch.bloodType;
  if (patch.allergies !== undefined) out.allergies = patch.allergies;
  if (patch.bloodPressure !== undefined)
    out.blood_pressure = patch.bloodPressure;
  if (patch.heartRate !== undefined) out.heart_rate = patch.heartRate;
  if (patch.weightLb !== undefined) out.weight_lb = patch.weightLb;
  if (patch.heightFtIn !== undefined) out.height_ft_in = patch.heightFtIn;
  if (patch.anxietyLevel !== undefined) out.anxiety_level = patch.anxietyLevel;
  if (patch.preferredContact !== undefined)
    out.preferred_contact = patch.preferredContact;
  if (patch.notes !== undefined) out.notes = patch.notes;
  if (patch.avatar !== undefined) out.avatar = patch.avatar;
  if (patch.onboardingComplete !== undefined)
    out.onboarding_complete = patch.onboardingComplete;
  return out;
}

// --- medications ------------------------------------------------------------

export type MedicationRow = {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  schedule: string;
  status: "stop" | "continue" | "new";
  reason: string;
  days_left: number | null;
  sort_order: number;
  created_at: string;
};

export function medicationRowToMedication(row: MedicationRow): Medication {
  const med: Medication = {
    id: row.id,
    name: row.name,
    dosage: row.dosage,
    schedule: row.schedule,
    status: row.status,
    reason: row.reason,
  };
  if (row.days_left !== null) med.daysLeft = row.days_left;
  return med;
}

export function medicationToInsertRow(
  med: Omit<Medication, "id"> & { id?: string },
  userId: string,
  sortOrder: number,
): Omit<MedicationRow, "id" | "created_at"> & { id?: string } {
  return {
    ...(med.id ? { id: med.id } : {}),
    user_id: userId,
    name: med.name,
    dosage: med.dosage,
    schedule: med.schedule,
    status: med.status,
    reason: med.reason,
    days_left: med.daysLeft ?? null,
    sort_order: sortOrder,
  };
}

// --- chat messages ----------------------------------------------------------

export type PalMessageRow = {
  id: string;
  user_id: string;
  role: "user" | "ai";
  text: string;
  actions: unknown; // jsonb — opaque to the server route, parsed by the client
  created_at: string;
};

export type CareMessageRow = {
  id: string;
  user_id: string;
  role: "user" | "nurse";
  text: string;
  created_at: string;
};

// --- checklist --------------------------------------------------------------

export type ChecklistKind = "bag" | "task" | "phase";

export type ChecklistRow = {
  user_id: string;
  item_id: string;
  kind: ChecklistKind;
  checked_at: string;
};

// --- pairing ----------------------------------------------------------------

export type PairingCodeRow = {
  code: string;
  payload: unknown;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
};
