"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import LoginMobile from "@/components/mobile/LoginMobile";
import GoogleIcon from "@/components/ui/GoogleIcon";
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from "@/lib/auth-context";
import { useViewMode } from "@/lib/view-mode-context";

type Mode = "login" | "signup";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/me";
  const { signIn, signUp, signInWithGoogle, isAuthenticated, hydrated } =
    useAuth();
  const { isEmbed } = useViewMode();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  // Surface OAuth errors that the /auth/callback route bounced back here.
  useEffect(() => {
    const oauthError = params.get("error");
    if (!oauthError) return;
    const msg = params.get("message");
    if (oauthError === "oauth_no_code") {
      setError("Google sign-in was cancelled or failed.");
    } else if (oauthError === "oauth_exchange_failed") {
      setError(msg || "Google sign-in failed. Please try again.");
    }
  }, [params]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(next);
    }
  }, [hydrated, isAuthenticated, next, router]);

  async function handleGoogle() {
    setError(null);
    setGoogleSubmitting(true);
    const result = await signInWithGoogle(next);
    // On success the browser is already redirecting to Google. Only reach
    // this branch on a synchronous setup failure.
    if (!result.ok) {
      setError(result.error);
      setGoogleSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!email.trim()) return setError("Enter an email.");
      if (password.length < 6)
        return setError("Password must be at least 6 characters.");
      if (password !== confirm) return setError("Passwords don't match.");
      setSubmitting(true);
      const result = await signUp(email, password);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace(next);
      return;
    }

    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next);
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setError(null);
  }

  if (isEmbed) {
    return (
      <PageShell bare>
        <LoginMobile />
      </PageShell>
    );
  }

  return (
    <PageShell bare>
      <main className="relative min-h-screen flex items-center justify-center px-5 py-16">
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-7">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 mb-5"
            >
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#88d1e5] via-[#2a7a8c] to-[#006172] flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-base">P</span>
              </div>
              <span className="font-extrabold tracking-tighter text-xl gradient-text-static">
                PreOpPal
              </span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
              {mode === "login" ? "Welcome back." : "Create your sanctuary."}
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              {mode === "login"
                ? "Sign in to view your profile and dashboard."
                : "Sign up to start your surgery journey."}
            </p>
          </div>

          <GlassCard className="p-6 md:p-8" tilt={false}>
            {/* Tabs */}
            <div className="relative grid grid-cols-2 gap-1 p-1 mb-6 rounded-2xl bg-white/40 border border-white/60">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    setError(null);
                  }}
                  className={`relative z-10 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    mode === m
                      ? "text-on-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {mode === m && (
                    <motion.span
                      layoutId="auth-tab-pill"
                      className="absolute inset-0 -z-10 rounded-xl bg-primary shadow-[0_8px_20px_-6px_rgba(0,97,114,0.45)]"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                  {m === "login" ? "Sign in" : "Sign up"}
                </button>
              ))}
            </div>

            {/* Google OAuth — above the email form so it's the primary path */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleSubmitting || submitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-white border border-on-surface/10 px-5 py-3 text-sm font-semibold text-on-surface shadow-sm hover:shadow-md hover:border-on-surface/20 transition-all disabled:opacity-60 disabled:pointer-events-none"
            >
              {googleSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-primary text-[18px]">
                  progress_activity
                </span>
              ) : (
                <GoogleIcon />
              )}
              {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
            </button>

            <div className="flex items-center gap-3 my-5">
              <span className="h-px flex-1 bg-on-surface/10" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                or
              </span>
              <span className="h-px flex-1 bg-on-surface/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Email
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@mail.com"
                  className="mt-1.5 w-full rounded-xl bg-white/70 border border-white/70 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                  Password
                </span>
                <input
                  type="password"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••"
                  className="mt-1.5 w-full rounded-xl bg-white/70 border border-white/70 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition"
                />
              </label>

              <AnimatePresence initial={false}>
                {mode === "signup" && (
                  <motion.label
                    key="confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="block overflow-hidden"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/70">
                      Confirm password
                    </span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="••••"
                      className="mt-1.5 w-full rounded-xl bg-white/70 border border-white/70 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition"
                    />
                  </motion.label>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    role="alert"
                    className="rounded-xl bg-error/10 border border-error/30 px-4 py-3 text-xs font-semibold text-error leading-relaxed"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <MagneticButton
                type="submit"
                className={`w-full rounded-2xl bg-primary text-on-primary px-6 py-3.5 font-bold tracking-wide shadow-[0_20px_40px_-10px_rgba(0,97,114,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(0,97,114,0.7)] transition-shadow gap-2 ${
                  submitting ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {mode === "login" ? "Sign in" : "Create account"}
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </MagneticButton>
            </form>

            <div className="mt-6 rounded-2xl bg-white/40 border border-white/60 px-4 py-3.5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-1">
                Demo account
              </p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                <span className="font-mono text-on-surface">{DEMO_EMAIL}</span>
                <br />
                Password:{" "}
                <span className="font-mono text-on-surface">
                  {DEMO_PASSWORD}
                </span>
              </p>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2 text-xs font-bold text-primary hover:underline"
              >
                Fill demo credentials
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </main>
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
