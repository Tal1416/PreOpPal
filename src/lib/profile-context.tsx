"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { defaultProfile, Profile } from "@/data/user";
import { medications as defaultMedications } from "@/data/content";
import { getProcedure, type Procedure } from "@/data/procedures";
import { daysUntilSurgery, isISODate, toISODate } from "@/lib/date";

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
  completeOnboarding: () => void;
};

const ProfileCtx = createContext<Ctx | null>(null);

const seedProfile: Profile = {
  ...defaultProfile,
  medications: defaultMedications,
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

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(seedProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Profile>;
        if (parsed.surgeryDate && !isISODate(parsed.surgeryDate)) {
          parsed.surgeryDate = toISODate(parsed.surgeryDate);
        }
        setProfile((cur) => ({ ...cur, ...parsed }));
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore quota/permission errors
    }
  }, [profile, hydrated]);

  const updateProfile = (patch: Partial<Profile>) =>
    setProfile((p) => ({ ...p, ...patch }));

  const setProcedure = (procedureId: string) => {
    const proc = getProcedure(procedureId);
    setProfile((p) => ({
      ...p,
      procedureId: proc.id,
      procedure: proc.name,
    }));
  };

  const completeOnboarding = () =>
    setProfile((p) => ({ ...p, onboardingComplete: true }));

  const resetProfile = () => setProfile(seedProfile);

  const currentProcedure = getProcedure(profile.procedureId);
  const derivedProfile: Profile = {
    ...profile,
    daysToSurgery: daysUntilSurgery(profile.surgeryDate),
  };
  const readinessScore = computeReadiness(derivedProfile);

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
