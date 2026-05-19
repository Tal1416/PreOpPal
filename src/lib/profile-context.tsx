"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultProfile, Profile } from "@/data/user";
import {
  medications as defaultMedications,
  type Medication,
} from "@/data/content";
import { getProcedure, type Procedure } from "@/data/procedures";
import { daysUntilSurgery, isISODate, toISODate } from "@/lib/date";
import { useAuth } from "@/lib/auth-context";

const STORAGE_KEY = "preoppal-profile-v1";

type Ctx = {
  profile: Profile;
  hydrated: boolean;
  updateProfile: (patch: Partial<Profile>) => void;
  setProfile: (p: Profile) => void;
  resetProfile: () => void;
  /**
   * Live readiness score: percentage of personal-info fields the patient has filled in.
   * Bounded to 5–100 so the dashboard ring always looks meaningful.
   */
  readinessScore: number;
  /**
   * The selected procedure template. Always defined — falls back to the default
   * procedure if `profile.procedureId` is unknown.
   */
  currentProcedure: Procedure;
  setProcedure: (procedureId: string) => void;
  /**
   * Use a user-provided procedure name that isn't in the catalog. We keep
   * a sensible template (defaults to general "knee" data) so the rest of
   * the app — bag, timeline, Pal — still has structured content to render,
   * but the displayed name reflects what the patient actually typed.
   */
  setCustomProcedure: (name: string) => void;
  completeOnboarding: () => void;
};

const ProfileCtx = createContext<Ctx | null>(null);

const seedProfile: Profile = {
  ...defaultProfile,
  medications: defaultMedications,
};

/** Empty Profile used when a user has just signed up — paired with the empty
 *  row created by the auth.users insert trigger. */
const emptyProfile: Profile = {
  ...defaultProfile,
  firstName: "",
  lastName: "",
  age: 0,
  patientId: "",
  procedureId: "",
  procedure: "",
  surgeon: "",
  surgeryDate: "",
  hospitalName: "",
  hospitalAddress: "",
  hospitalCoords: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  bloodType: "",
  allergies: "",
  bloodPressure: "",
  heartRate: 0,
  weightLb: 0,
  heightFtIn: "",
  anxietyLevel: 0,
  preferredContact: "app",
  notes: "",
  avatar: "",
  onboardingComplete: false,
  medications: [],
};

function computeReadiness(p: Profile): number {
  const fields: (keyof Profile)[] = [
    "firstName",
    "lastName",
    "age",
    "procedure",
    "surgeon",
    "surgeryDate",
    "hospitalName",
    "hospitalAddress",
    "emergencyContactName",
    "emergencyContactPhone",
    "bloodType",
    "allergies",
    "bloodPressure",
    "heartRate",
    "weightLb",
    "heightFtIn",
    "preferredContact",
  ];
  const filled = fields.filter((k) => {
    const v = p[k];
    if (typeof v === "number") return v > 0;
    if (typeof v === "string") return v.trim().length > 0;
    return v !== undefined && v !== null;
  }).length;
  const medsBonus = p.medications.length > 0 ? 8 : 0;
  const pct = Math.round((filled / fields.length) * 92 + medsBonus);
  return Math.max(5, Math.min(100, pct));
}

/** A profile row from the API is "empty" if the trigger-created defaults are
 *  still in place. Used to detect first-login state for the migration import. */
function isEmptyProfile(p: Partial<Profile>): boolean {
  return !p.firstName?.trim() && !p.lastName?.trim() && !p.procedureId?.trim();
}

async function pushPatch(patch: Partial<Profile>): Promise<void> {
  try {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      // Surface server errors loudly. Silent console.warn was hiding the 401s
      // that caused "nothing persists in production" — see middleware.ts.
      const text = await res.text().catch(() => "");
      console.error(
        `[profile] PATCH /api/profile -> ${res.status}`,
        text || res.statusText,
      );
    }
  } catch (err) {
    console.error("[profile] PATCH failed", err);
  }
}

// Brute-force sync: delete all then insert all. Fine for the small lists in
// this demo and keeps the optimistic-update code simple. We do two things to
// keep it safe under rapid edits (e.g. the user typing in a med name field):
//   1) DEBOUNCE so we collapse many keystrokes into one network round-trip.
//   2) SERIALIZE so an in-flight replace can't be interleaved with a fresh
//      one, which would race on the "fetch existing → delete all → insert"
//      sequence and clobber the user's data.
let pendingMeds: Medication[] | null = null;
let medsBusy = false;
let medsDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const MEDS_DEBOUNCE_MS = 350;

async function runMedicationsReplace(): Promise<void> {
  if (medsBusy) return;
  medsBusy = true;
  try {
    while (pendingMeds !== null) {
      const next = pendingMeds;
      pendingMeds = null;
      try {
        const current = await fetch("/api/medications").then((r) => r.json());
        const existing: Medication[] = current.medications ?? [];
        await Promise.all(
          existing.map((m) =>
            fetch(`/api/medications/${m.id}`, { method: "DELETE" }),
          ),
        );
        await Promise.all(
          next.map((m, i) =>
            fetch("/api/medications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...m, sortOrder: i }),
            }),
          ),
        );
      } catch (err) {
        console.warn("[profile] medications sync failed", err);
      }
    }
  } finally {
    medsBusy = false;
  }
}

function pushMedicationsReplace(meds: Medication[]): void {
  // Always coalesce on the latest list — a later call supersedes the queued one.
  pendingMeds = meds;
  if (medsDebounceTimer) clearTimeout(medsDebounceTimer);
  medsDebounceTimer = setTimeout(() => {
    medsDebounceTimer = null;
    void runMedicationsReplace();
  }, MEDS_DEBOUNCE_MS);
}

/** Force-flush any pending medication writes synchronously-ish. Used by
 *  setProfile (e.g. reset) to make sure a hard replace lands without waiting
 *  out the debounce. */
function flushMedicationsReplace(meds: Medication[]): void {
  pendingMeds = meds;
  if (medsDebounceTimer) {
    clearTimeout(medsDebounceTimer);
    medsDebounceTimer = null;
  }
  void runMedicationsReplace();
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, hydrated: authHydrated } = useAuth();
  const [profile, setProfileState] = useState<Profile>(seedProfile);
  const [hydrated, setHydrated] = useState(false);
  // Compare against this snapshot to detect medication-list identity changes.
  const medsSnapshotRef = useRef<Medication[]>(seedProfile.medications);

  // Hydrate from /api/profile on login. Migrates localStorage on first run.
  useEffect(() => {
    if (!authHydrated) return;
    if (!isAuthenticated) {
      // Logged-out view falls back to the demo seed so the landing/marketing
      // surfaces still render polished content.
      setProfileState(seedProfile);
      medsSnapshotRef.current = seedProfile.medications;
      setHydrated(true);
      return;
    }

    // Flip hydrated back to false for the duration of the fetch so consumers
    // can render skeletons through the *transition* into the authenticated
    // view too. Without this, a user who just signed in keeps seeing the
    // logged-out seed ("Alex Morgan") for the few hundred ms it takes
    // /api/profile to land — the exact flash this whole skeleton system is
    // here to prevent.
    setHydrated(false);

    let cancelled = false;
    (async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch("/api/profile", { cache: "no-store" }),
          fetch("/api/medications", { cache: "no-store" }),
        ]);
        const pJson = await pRes.json();
        const mJson = await mRes.json();
        if (cancelled) return;

        const rowProfile = (pJson.profile ?? null) as Partial<Profile> | null;
        const rowMeds = (mJson.medications ?? []) as Medication[];

        let merged: Profile = rowProfile
          ? { ...emptyProfile, ...rowProfile, medications: rowMeds }
          : { ...emptyProfile, medications: rowMeds };

        // One-time localStorage migration: if Supabase looks brand-new but the
        // browser has a saved profile, push it up.
        if (rowProfile && isEmptyProfile(rowProfile)) {
          try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
              const local = JSON.parse(raw) as Partial<Profile>;
              if (local.surgeryDate && !isISODate(local.surgeryDate)) {
                local.surgeryDate = toISODate(local.surgeryDate);
              }
              const { medications: localMeds = [], ...localScalar } = local;
              merged = { ...merged, ...localScalar };
              if (Array.isArray(localMeds) && localMeds.length > 0) {
                merged.medications = localMeds as Medication[];
              }
              void pushPatch(localScalar);
              if (Array.isArray(localMeds) && localMeds.length > 0) {
                void pushMedicationsReplace(localMeds as Medication[]);
              }
              localStorage.removeItem(STORAGE_KEY);
            }
          } catch {
            // ignore parse / quota errors
          }
        }

        setProfileState(merged);
        medsSnapshotRef.current = merged.medications;
      } catch (err) {
        console.warn("[profile] hydrate failed", err);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authHydrated, isAuthenticated]);

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      setProfileState((p) => {
        const next = { ...p, ...patch };
        if (isAuthenticated) {
          const scalarPatch: Partial<Profile> = {};
          for (const key of Object.keys(patch) as (keyof Profile)[]) {
            if (key === "medications" || key === "daysToSurgery") continue;
            (scalarPatch as Record<string, unknown>)[key] = (
              next as Record<string, unknown>
            )[key];
          }
          if (Object.keys(scalarPatch).length > 0) {
            void pushPatch(scalarPatch);
          }
          if (patch.medications && patch.medications !== p.medications) {
            medsSnapshotRef.current = next.medications;
            void pushMedicationsReplace(next.medications);
          }
        }
        return next;
      });
    },
    [isAuthenticated],
  );

  const setProfile = useCallback(
    (p: Profile) => {
      setProfileState(p);
      if (isAuthenticated) {
        const { medications, ...scalar } = p;
        void pushPatch(scalar);
        medsSnapshotRef.current = medications;
        // Reset / hard set bypasses the keystroke debounce — we want the
        // user's "Reset" tap to feel instantaneous on the server.
        flushMedicationsReplace(medications);
      }
    },
    [isAuthenticated],
  );

  const setProcedure = useCallback(
    (procedureId: string) => {
      const proc = getProcedure(procedureId);
      updateProfile({ procedureId: proc.id, procedure: proc.name });
    },
    [updateProfile],
  );

  const setCustomProcedure = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      // Keep a template procedure for downstream content (bag, timeline) but
      // surface the user's name everywhere we display it.
      updateProfile({
        procedureId: profile.procedureId || "knee",
        procedure: trimmed,
      });
    },
    [updateProfile, profile.procedureId],
  );

  const completeOnboarding = useCallback(() => {
    updateProfile({ onboardingComplete: true });
  }, [updateProfile]);

  const resetProfile = useCallback(() => {
    setProfile(seedProfile);
  }, [setProfile]);

  const currentProcedure = useMemo(
    () => getProcedure(profile.procedureId),
    [profile.procedureId],
  );

  const derivedProfile: Profile = useMemo(
    () => ({
      ...profile,
      daysToSurgery: daysUntilSurgery(profile.surgeryDate),
    }),
    [profile],
  );

  const readinessScore = useMemo(
    () => computeReadiness(derivedProfile),
    [derivedProfile],
  );

  return (
    <ProfileCtx.Provider
      value={{
        profile: derivedProfile,
        hydrated,
        updateProfile,
        setProfile,
        resetProfile,
        readinessScore,
        currentProcedure,
        setProcedure,
        setCustomProcedure,
        completeOnboarding,
      }}
    >
      {children}
    </ProfileCtx.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileCtx);
  if (!ctx)
    throw new Error("useProfile must be used inside <ProfileProvider />");
  return ctx;
}
