"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import { DEMO_EMAIL, useAuth } from "@/lib/auth-context";

type Mode = "login" | "signup";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/me";
  const { signIn, isAuthenticated, hydrated } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      router.replace(next);
    }
  }, [hydrated, isAuthenticated, next, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signup") {
      if (!email.trim()) return setError("Enter an email.");
      if (password.length < 4)
        return setError("Password must be at least 4 characters.");
      if (password !== confirm) return setError("Passwords don't match.");
      // No backend yet — point the user to the demo credentials.
      setError(
        `Sign-up isn't connected yet. Use the demo account: ${DEMO_EMAIL} / 1234`,
      );
      return;
    }

    setSubmitting(true);
    const result = signIn(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(next);
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword("1234");
    setError(null);
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
                Password: <span className="font-mono text-on-surface">1234</span>
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
