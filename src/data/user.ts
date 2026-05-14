import type { Medication } from "./content";

export type Profile = {
  firstName: string;
  lastName: string;
  age: number;
  patientId: string;
  procedureId: string;
  procedure: string;
  surgeon: string;
  surgeryDate: string; // ISO YYYY-MM-DD, e.g. "2026-06-24"
  daysToSurgery: number; // derived from surgeryDate at read time
  hospitalName: string;
  hospitalAddress: string;
  hospitalCoords: string; // lat,lng for Google Maps
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType: string;
  allergies: string;
  bloodPressure: string;
  heartRate: number;
  weightLb: number;
  heightFtIn: string;
  anxietyLevel: number; // 1-10
  preferredContact: "app" | "phone" | "email";
  notes: string;
  readinessScore: number;
  medications: Medication[];
  avatar: string;
  onboardingComplete: boolean;
};

export const defaultProfile: Profile = {
  firstName: "Alex",
  lastName: "Morgan",
  age: 47,
  patientId: "4920",
  procedureId: "knee",
  procedure: "Knee Replacement",
  surgeon: "Dr. Sarah Chen",
  surgeryDate: "2026-06-24",
  daysToSurgery: 0,
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
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAR_KLNHPFHZhRxfEd_xk06F8G4yjfCYA1NWz5FwyO3QXPp-CIFN3udm_RTM9wB23aN4VfqQggqGAlgwk556QFLJSfwuck9zwzy3eFNO4VvJFdaSiqmENcUKjeya5-eFFn1G2vjVhgcR1FWZllNN8_7mSalTxmLPjUoGG34qZHx6DUZ9lb091g1k1SawvG9vVe5ILKhVePYS-crowqUUuuMEIdTPqFDoNaHJi59hczmrBw07SShKa2cplWrhADeC5g5T8NHuFGmH7w",
  onboardingComplete: false,
};

// Back-compat: legacy default user object referenced by older imports.
export const user = defaultProfile;
