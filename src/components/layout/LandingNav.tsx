"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/me", label: "Profile" },
  { to: "/timeline", label: "Timeline" },
  { to: "/medications", label: "Meds" },
  { to: "/bag", label: "Bag" },
  { to: "/care", label: "Care" },
  { to: "/arrival", label: "Arrival" },
  { to: "/case-study", label: "Case study" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, hydrated, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors ${
          scrolled
            ? "bg-white/80 border-white/60 shadow-[0_8px_32px_-8px_rgba(42,122,140,0.12)]"
            : "bg-white/55 border-white/40"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10 h-16 flex items-center justify-between gap-4">
          {/* logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <motion.div
              whileHover={{ rotate: -8, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 320, damping: 18 }}
              className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#88d1e5] via-[#2a7a8c] to-[#006172] flex items-center justify-center shadow-md"
            >
              <span className="text-white font-extrabold text-sm">P</span>
            </motion.div>
            <span className="font-extrabold tracking-tighter text-lg gradient-text-static">
              PreOpPal
            </span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                href={link.to}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-on-surface-variant hover:text-primary hover:bg-white/60 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + mobile menu */}
          <div className="flex items-center gap-2">
            {hydrated && isAuthenticated ? (
              <button
                onClick={() => {
                  signOut();
                  router.push("/");
                }}
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/70 border border-white/70 text-primary px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all active:scale-95"
              >
                Sign out
                <span className="material-symbols-outlined text-base">
                  logout
                </span>
              </button>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1 rounded-full bg-white/70 border border-white/70 text-primary px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all active:scale-95"
              >
                Sign in
                <span className="material-symbols-outlined text-base">
                  login
                </span>
              </Link>
            )}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-primary text-on-primary px-4 py-2 text-xs font-bold uppercase tracking-widest hover:shadow-glow-teal transition-all active:scale-95"
            >
              Open app
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              className="lg:hidden h-10 w-10 rounded-full flex items-center justify-center text-primary hover:bg-white/60 transition-colors"
            >
              <span className="material-symbols-outlined">
                {open ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* mobile menu drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mmenu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden overflow-hidden border-t border-white/40 bg-white/85 backdrop-blur-xl"
            >
              <div className="px-5 py-4 grid grid-cols-2 gap-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    href={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-white/70 border border-white/60 px-4 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="col-span-2 rounded-xl bg-primary text-white px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  Open the dashboard
                  <span className="material-symbols-outlined text-base">
                    arrow_forward
                  </span>
                </Link>
                {hydrated && isAuthenticated ? (
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut();
                      router.push("/");
                    }}
                    className="col-span-2 rounded-xl bg-white/80 border border-white/70 text-primary px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    Sign out
                    <span className="material-symbols-outlined text-base">
                      logout
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="col-span-2 rounded-xl bg-white/80 border border-white/70 text-primary px-4 py-3 text-sm font-bold flex items-center justify-center gap-2"
                  >
                    Sign in
                    <span className="material-symbols-outlined text-base">
                      login
                    </span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      {/* spacer so the hero starts below the fixed nav */}
      <div aria-hidden className="h-16" />
    </>
  );
}
