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
import { getBrowserClient } from "@/lib/supabase/browser";
import { clearPalHistory, hydratePalHistory } from "@/components/ai/ai-store";

// Hint shown on the login screen so demo viewers can click "Fill demo
// credentials" and log straight in as the seeded account. Provision this
// user via `npm run db:seed` after applying the migration.
export const DEMO_EMAIL = "demo@preoppal.app";
export const DEMO_PASSWORD = "preop-demo";

export type AuthUser = { id: string; email: string };

/** Back-compat shape: the rest of the codebase reads `session.email` and
 *  `session.signedInAt`. We derive it from the Supabase user. */
export type Session = {
  email: string;
  signedInAt: string;
};

type Result = { ok: true } | { ok: false; error: string };

type Ctx = {
  user: AuthUser | null;
  /** Derived back-compat session shape. */
  session: Session | null;
  hydrated: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // Track signed-in-at locally — Supabase doesn't expose it directly. Falls
  // back to "now" on initial hydration if we discover an existing session.
  const signedInAtRef = useRef<string | null>(null);

  // Initial session check + subscribe to auth changes.
  useEffect(() => {
    let cancelled = false;
    const supabase = getBrowserClient();

    (async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (cancelled) return;
        if (res.ok) {
          const json = (await res.json()) as { user: AuthUser | null };
          if (json.user) {
            setUser(json.user);
            signedInAtRef.current = new Date().toISOString();
            void hydratePalHistory();
          }
        }
      } catch {
        // network blip — leave user null
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT" || !sess?.user) {
        setUser(null);
        signedInAtRef.current = null;
      } else {
        setUser({ id: sess.user.id, email: sess.user.email ?? "" });
        signedInAtRef.current ??= new Date().toISOString();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<Result> => {
      try {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = (await res.json()) as
          | { user: AuthUser | null }
          | { error: string };
        if (!res.ok || "error" in json) {
          return {
            ok: false,
            error: "error" in json ? json.error : "Sign-in failed.",
          };
        }
        if (json.user) {
          setUser(json.user);
          signedInAtRef.current = new Date().toISOString();
          void hydratePalHistory();
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Network error." };
      }
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<Result> => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = (await res.json()) as
          | { user: AuthUser | null }
          | { error: string };
        if (!res.ok || "error" in json) {
          return {
            ok: false,
            error: "error" in json ? json.error : "Sign-up failed.",
          };
        }
        if (json.user) {
          setUser(json.user);
          signedInAtRef.current = new Date().toISOString();
          void hydratePalHistory();
        }
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "Network error." };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // ignore — onAuthStateChange will still flip state if cookies are gone
    }
    setUser(null);
    signedInAtRef.current = null;
    clearPalHistory();
  }, []);

  const session: Session | null = useMemo(() => {
    if (!user) return null;
    return {
      email: user.email,
      signedInAt: signedInAtRef.current ?? new Date().toISOString(),
    };
  }, [user]);

  return (
    <AuthCtx.Provider
      value={{
        user,
        session,
        hydrated,
        isAuthenticated: !!user,
        signIn,
        signUp,
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
