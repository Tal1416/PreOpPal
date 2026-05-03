"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "preoppal-auth-v1";

// Demo-only hardcoded credentials. No backend yet; this gates client-side
// access to the personalized views until real auth is wired up.
export const DEMO_EMAIL = "talyar1@mail.tau.ac.il";
const DEMO_PASSWORD = "1234";

type Session = {
  email: string;
  signedInAt: string; // ISO timestamp
};

type Ctx = {
  session: Session | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  signIn: (
    email: string,
    password: string,
  ) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Session;
        if (parsed?.email) setSession(parsed);
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  const signIn = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (normalized !== DEMO_EMAIL.toLowerCase()) {
      return { ok: false as const, error: "Email not recognized." };
    }
    if (password !== DEMO_PASSWORD) {
      return { ok: false as const, error: "Incorrect password." };
    }
    const next: Session = {
      email: DEMO_EMAIL,
      signedInAt: new Date().toISOString(),
    };
    setSession(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore quota/permission errors
    }
    return { ok: true as const };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        session,
        hydrated,
        isAuthenticated: !!session,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider />");
  return ctx;
}
