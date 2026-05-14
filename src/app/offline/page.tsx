"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto h-28 w-28 rounded-full flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #acedff 0%, #88d1e5 35%, #2a7a8c 70%, #006172 100%)",
            boxShadow:
              "0 30px 60px -10px rgba(0,97,114,0.55), 0 0 0 6px rgba(255,255,255,0.4) inset",
          }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-white/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.6, repeat: Infinity }}
          />
          <span className="material-symbols-outlined text-white text-5xl drop-shadow">
            wifi_off
          </span>
        </motion.div>

        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-on-surface">
          You&apos;re offline.
        </h1>
        <p className="mt-3 text-on-surface-variant">
          Pal needs a connection to talk, but your prep is safe and saved.
          We&apos;ll reconnect the moment your signal comes back.
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mt-8 rounded-2xl bg-primary text-on-primary px-6 py-3 font-bold hover:shadow-glow-teal transition-all"
        >
          <span className="material-symbols-outlined">refresh</span>
          Try again
        </Link>
      </div>
    </main>
  );
}
