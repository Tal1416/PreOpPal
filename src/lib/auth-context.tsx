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

// Offline demo: when someone signs in with the demo credentials we mint a
// purely local session (no Supabase round-trip) and the app runs on built-in
// static data. This keeps the portfolio demo working anywhere — phone, any
// machine — even if the Supabase backend is paused or unreachable.
const DEMO_SESSION_KEY = "preoppal-demo-session";
const DEMO_USER: AuthUser = { id: "demo-user", email: DEMO_EMAIL };

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
  /** True when the local, no-backend demo session is active. Consumers use
   *  this to serve static data instead of hitting Supabase. */
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<Result>;
  /**
   * Kick off Google OAuth. The browser is redirected to Google's consent
   * screen and (on success) eventually lands on `/auth/callback`, which
   * exchanges the PKCE code for a Supabase session and then redirects to
   * `nextPath` (defaults to `/me`). Returns `{ok:false}` only on
   * synchronous setup failure — once the redirect kicks in, control leaves
   * this page so the resolved promise rarely matters.
   */
  signInWithGoogle: (nextPath?: string) => Promise<Result>;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  // Track signed-in-at locally — Supabase doesn't expose it directly. Falls
  // back to "now" on initial hydration if we discover an existing session.
  const signedInAtRef = useRef<string | null>(null);

  // Initial session check + subscribe to auth changes.
  useEffect(() => {
    // Restore an offline demo session before any network work — this path
    // never touches Supabase, so it works even when the backend is down.
    try {
      if (localStorage.getItem(DEMO_SESSION_KEY) === "1") {
        setUser(DEMO_USER);
        setIsDemo(true);
        signedInAtRef.current = new Date().toISOString();
        setHydrated(true);
        return;
      }
    } catch {
      // localStorage unavailable (SSR/private mode) — fall through to Supabase.
    }

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
      // Offline demo account: mint a local session with no backend call so
      // anyone can get into the dashboard even if Supabase is unreachable.
      if (
        email.trim().toLowerCase() === DEMO_EMAIL &&
        password === DEMO_PASSWORD
      ) {
        try {
          localStorage.setItem(DEMO_SESSION_KEY, "1");
        } catch {
          // ignore — session still works in-memory for this tab.
        }
        setUser(DEMO_USER);
        setIsDemo(true);
        signedInAtRef.current = new Date().toISOString();
        return { ok: true };
      }

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

  const signInWithGoogle = useCallback(
    async (nextPath?: string): Promise<Result> => {
      try {
        const supabase = getBrowserClient();
        // The callback route exchanges the PKCE code for a session, then
        // forwards the user to `next`. We use the browser's current origin so
        // this works on prod, vercel previews, and localhost without any
        // env-var plumbing.
        const next = nextPath ?? "/me";
        const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
            queryParams: {
              // Always show the account chooser so users on shared machines
              // can pick the right Google account.
              prompt: "select_account",
            },
          },
        });
        if (error) {
          return { ok: false, error: error.message };
        }
        // The browser navigates away on success — we don't get here.
        return { ok: true };
      } catch (e) {
        return { ok: false, error: (e as Error).message ?? "OAuth error." };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (isDemo) {
      // Offline demo: just drop the local session — nothing to sign out of.
      try {
        localStorage.removeItem(DEMO_SESSION_KEY);
      } catch {
        // ignore
      }
      setIsDemo(false);
      setUser(null);
      signedInAtRef.current = null;
      clearPalHistory();
      return;
    }
    try {
      await fetch("/api/auth/signout", { method: "POST" });
    } catch {
      // ignore — onAuthStateChange will still flip state if cookies are gone
    }
    setUser(null);
    signedInAtRef.current = null;
    clearPalHistory();
  }, [isDemo]);

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
        isDemo,
        signIn,
        signUp,
        signInWithGoogle,
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
