"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import PageShell from "@/components/layout/PageShell";
import LandingNav from "@/components/layout/LandingNav";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/ScrollReveal";
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import MagneticButton from "@/components/ui/MagneticButton";
import CodeBlock from "@/components/case-study/CodeBlock";
import InlinePairDemo from "@/components/case-study/InlinePairDemo";
import TalkToPalButton from "@/components/case-study/TalkToPalButton";
import InstallDemoButton from "@/components/case-study/InstallDemoButton";
import { useViewMode } from "@/lib/view-mode-context";

const STATS = [
  { v: 24, suffix: "", label: "New files", icon: "description" },
  { v: 3, suffix: "", label: "Killer features", icon: "auto_awesome" },
  { v: 1, suffix: " day", label: "From idea to ship", icon: "bolt" },
];

const DECISIONS: Array<{ title: string; chose: string; over: string; why: string }> = [
  {
    title: "Voice transport",
    chose: "Browser Web Speech API",
    over: "Whisper / ElevenLabs",
    why: "Zero backend cost, instant first-token, works offline on iOS 16+. Swap to ElevenLabs is a one-file change in use-speech-synthesis.ts.",
  },
  {
    title: "Pairing storage",
    chose: "In-memory Map with TTL",
    over: "Redis / Postgres",
    why: "Demo. Pairing happens in seconds; cold starts are irrelevant. Interface is one file — swap in Upstash later without touching API consumers.",
  },
  {
    title: "PWA tooling",
    chose: "Hand-rolled service worker",
    over: "next-pwa plugin",
    why: "30 lines vs another dependency tree. Lets me tune cache strategy per route (network-first HTML, cache-first static, never API).",
  },
  {
    title: "Real-time pair signal",
    chose: "Plain HTTP polling",
    over: "WebSocket / SSE",
    why: "Two endpoints, no infra, total pair latency under 2s. Worth nothing more for a 5-minute one-shot session.",
  },
  {
    title: "TTS chunking",
    chose: "Sentence-buffered queue",
    over: "Speak per token",
    why: "Token-level TTS chops words. I split on /[.!?…]\\s+/ and queue complete sentences. Pal sounds human, not robotic.",
  },
];

const STACK = [
  { label: "Next.js 16", icon: "bolt" },
  { label: "React 19", icon: "extension" },
  { label: "TypeScript", icon: "code" },
  { label: "Tailwind", icon: "format_paint" },
  { label: "Framer Motion", icon: "animation" },
  { label: "Lenis", icon: "view_carousel" },
  { label: "Gemini 3 Flash", icon: "smart_toy" },
  { label: "Vercel AI SDK", icon: "auto_awesome" },
  { label: "Web Speech API", icon: "graphic_eq" },
  { label: "Service Worker", icon: "cloud_off" },
  { label: "qrcode", icon: "qr_code_2" },
];

const NEXT_UP = [
  {
    title: "ElevenLabs for premium voice",
    detail:
      "Drop-in /api/tts endpoint, swap the speakNext() implementation. Pal sounds like a thoughtful friend, not a system voice.",
  },
  {
    title: "Caregiver share link",
    detail:
      "Tokenized read-only URL of the patient's prep so loved ones can follow along — same pairing infra, scoped permissions.",
  },
  {
    title: "Apple Wallet pass",
    detail:
      "Generate a .pkpass with surgery date + arrival info. Lives on the lock screen the morning of.",
  },
  {
    title: "Discharge paperwork ingest",
    detail:
      "Drop a PDF or photo, Gemini Vision extracts meds, restrictions, follow-up dates, auto-fills the timeline.",
  },
];

export default function CaseStudyPage() {
  const { isEmbed } = useViewMode();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <PageShell bare>
      {!isEmbed && <LandingNav />}

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 pt-12 pb-16 overflow-hidden"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-32 h-[60vh] w-[60vh] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(172,237,255,0.45), transparent 70%)",
          }}
          animate={{ x: [0, 60, -30, 0], y: [0, -20, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-32 h-[55vh] w-[55vh] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(0,97,114,0.35), transparent 70%)",
          }}
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -20, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl text-center"
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full glass-card-strong px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.22em] text-primary"
          >
            <span className="material-symbols-outlined text-[14px]">
              science
            </span>
            Case study · Engineering breakdown
          </motion.div>

          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.9,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 text-balance font-extrabold tracking-tighter leading-[0.95] text-[clamp(2.4rem,7vw,5.5rem)] text-on-surface"
          >
            How I upscaled a static demo into a{" "}
            <span className="gradient-text leading-[1.15] pb-[0.15em]">
              feels-native, voice-driven companion.
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 text-balance text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed"
          >
            Three features, shipped in a day. A real PWA you can install on your
            phone, a full-screen voice mode with an audio-reactive orb, and a
            QR handoff that teleports your prep from desktop to phone in two
            seconds.
          </motion.p>

          {/* metrics */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-3 md:gap-5 max-w-xl mx-auto"
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-3xl p-4 md:p-5 flex flex-col items-center"
              >
                <span
                  className="material-symbols-outlined text-primary mb-1 text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
                <span className="text-2xl md:text-3xl font-extrabold tabular-nums text-primary">
                  <AnimatedNumber to={s.v} duration={1.6} />
                  {s.suffix}
                </span>
                <span className="mt-1 text-[10px] md:text-xs uppercase tracking-widest text-on-surface-variant/70 font-bold text-center">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-14 flex justify-center"
          >
            <motion.a
              href="#brief"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-on-surface-variant/60 hover:text-primary text-xs uppercase tracking-[0.3em] flex flex-col items-center gap-1 transition-colors"
            >
              read it
              <span className="material-symbols-outlined text-base">
                arrow_downward
              </span>
            </motion.a>
          </motion.div>
        </motion.div>
      </section>

      {/* THE BRIEF */}
      <section id="brief" className="relative px-6 py-24 scroll-mt-24">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              The brief
            </p>
            <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              PreOpPal is a portfolio piece, not a HIPAA product.
            </h2>
            <p className="mt-6 text-on-surface-variant text-lg leading-relaxed">
              That single decision drove everything. I optimized for{" "}
              <strong className="text-on-surface">demo-ability in 60 seconds on a phone</strong>{" "}
              instead of compliance, BAAs, or audit logs. Every feature in this
              breakdown is the path that looks better in a 30-second clip — not
              necessarily the path you&apos;d ship to a real hospital.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="mt-10 grid md:grid-cols-2 gap-4">
              <GlassCard className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">
                  What I optimized for
                </p>
                <ul className="space-y-2 text-on-surface-variant text-sm">
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                      check
                    </span>
                    Visible wow features (AI, animation, mobile feel)
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                      check
                    </span>
                    Real install on a real phone in &lt; 10 seconds
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                      check
                    </span>
                    Fake-but-believable data flows
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px]">
                      check
                    </span>
                    Looks better in a 30-second video than in a code review
                  </li>
                </ul>
              </GlassCard>
              <GlassCard className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-3">
                  What I explicitly skipped
                </p>
                <ul className="space-y-2 text-on-surface-variant text-sm">
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
                      close
                    </span>
                    HIPAA / BAA work, audit logs, encryption review
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
                      close
                    </span>
                    Real backend persistence (localStorage is the source of truth)
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
                      close
                    </span>
                    Production auth — there&apos;s a single demo password
                  </li>
                  <li className="flex gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">
                      close
                    </span>
                    Big-name UI libraries — every motion piece is hand-rolled
                  </li>
                </ul>
              </GlassCard>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FEATURE 01 — PWA */}
      <FeatureSection
        eyebrow="Feature 01 · Installable"
        title="A real PWA, not a tab pretending to be an app."
        story="Most “web apps” live in a tab. I wanted PreOpPal to install onto a home screen, launch in standalone mode, work offline, and look identical on Android Chrome and iOS Safari — without dragging in a 300 KB framework. The whole PWA layer is a hand-written service worker plus a manifest plus three components."
        right={
          <InstallShowcase />
        }
        decisions={[
          {
            line: "Service worker = 80 lines, no library.",
            detail:
              "Network-first for HTML. Cache-first for /_next/static, /icons, /fonts. Never touches /api/ — chat is a live SSE stream and caching it would break Pal's voice.",
          },
          {
            line: "Manifest has shortcuts.",
            detail:
              "Long-press the installed icon and you get \"Open Pal\" and \"Timeline\" — instant intent, no nav drilling.",
          },
          {
            line: "Custom install prompt for both platforms.",
            detail:
              "Chrome / Android: capture beforeinstallprompt, one-tap install. iOS Safari (no event): animated Share→Add to Home Screen guide with the actual share-icon glyph.",
          },
        ]}
        code={`// public/sw.js — the core fetch handler
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never cache API routes — chat is a live SSE stream.
  if (url.pathname.startsWith('/api/')) return;

  const isHTML =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    // network-first → cache → /offline
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(RUNTIME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((c) => c || caches.match('/offline')),
        ),
    );
  }
});`}
        codeFile="public/sw.js"
      />

      {/* FEATURE 02 — VOICE */}
      <FeatureSection
        flipped
        eyebrow="Feature 02 · Voice"
        title="A full-screen voice mode that breathes with you."
        story="Voice in 2026 is a screenshot. I wanted Pal to listen, think, speak, and visibly react to your voice in a way that reads instantly in a clip. So the overlay has an audio-reactive orb wired to the live mic AnalyserNode, sentence-buffered TTS so streamed Gemini output sounds spoken not chopped, and a voice-aware system prompt that forces 1-2 sentence answers."
        right={
          <VoiceShowcase />
        }
        decisions={[
          {
            line: "Audio-reactive orb, not a static mic icon.",
            detail:
              "useMicLevel hook taps an AnalyserNode at 512 FFT, smooths via EMA, returns 0..1 amplitude. The orb scales 1.0 → 1.18 with your voice. While Pal speaks, two layered sine waves drive an organic breathing pulse.",
          },
          {
            line: "Sentence-buffered TTS.",
            detail:
              "Naive TTS speaks per streamed token and chops words. I buffer the stream, split on /[.!?…]\\s+/, and queue complete sentences. Result: spoken cadence, not robotic stutter.",
          },
          {
            line: "Voice-aware system prompt.",
            detail:
              "When voiceMode: true is in the request body, the prompt builder adds: \"Keep replies to 1-2 short sentences. No markdown. Use spoken cadence.\" maxOutputTokens drops from 1500 → 400. Same model, very different vibe.",
          },
          {
            line: "Auto re-arms the mic.",
            detail:
              "When TTS finishes speaking, a 350ms grace timer fires, then the mic opens again. Continuous conversation without taps.",
          },
        ]}
        code={`// src/lib/voice/use-speech-synthesis.ts — sentence drainer
const enqueue = useCallback((chunk: string) => {
  bufferRef.current += chunk;

  const SENTENCE = /([^.!?…]+[.!?…]+)(\\s+|$)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = SENTENCE.exec(bufferRef.current)) !== null) {
    const sentence = match[1].trim();
    if (sentence) queueRef.current.push(sentence);
    lastIndex = SENTENCE.lastIndex;
  }
  if (lastIndex > 0) {
    bufferRef.current = bufferRef.current.slice(lastIndex);
  }
  if (queueRef.current.length && !playingRef.current) {
    speakNext();
  }
}, [speakNext]);`}
        codeFile="src/lib/voice/use-speech-synthesis.ts"
      />

      {/* FEATURE 03 — QR PAIRING */}
      <FeatureSection
        eyebrow="Feature 03 · Pairing"
        title="Scan a QR. Your prep teleports to your phone in 2 seconds."
        story="Recruiters love the moment when desktop and phone sync. I built it as a one-shot pairing handshake: desktop POSTs the profile, gets a 6-character code, renders a QR pointing at /pair?code=…. Phone scans, hits the API, the payload is consumed (one-time use), localStorage gets written, page reloads, confetti fires."
        right={
          <div className="flex flex-col items-center">
            <InlinePairDemo />
          </div>
        }
        decisions={[
          {
            line: "In-memory Map with 5-minute TTL.",
            detail:
              "Pairing happens within seconds — a serverless cold start matters more than persistence. Interface is two functions (createPair, consumePair); swap to Upstash Redis is a 10-line change.",
          },
          {
            line: "6-char alphanumeric, no 0/O/1/I/L.",
            detail:
              "32-letter alphabet → 1B+ codes. Manual entry on iOS keyboards needs unambiguous glyphs.",
          },
          {
            line: "Polling beats sockets here.",
            detail:
              "Desktop polls /api/pair/status every 1.6s. Total perceived latency under 2s. WebSocket infra for a 5-minute, low-traffic handshake would have been overkill.",
          },
          {
            line: "One-shot consume with a 10-second grace window.",
            detail:
              "GET /api/pair?code=… marks the entry consumed and returns the payload, but doesn't delete for 10 more seconds — so the desktop poll sees status: 'consumed' and fires its celebration animation before the entry is swept.",
          },
        ]}
        code={`// src/lib/pairing/store.ts
export function consumePair(code: string): PairPayload | null {
  sweep();
  const entry = STORE.get(code.toUpperCase());
  if (!entry) return null;
  // Mark consumed but keep briefly so the desktop poll can see it
  // before TTL sweeps it out.
  entry.status = "consumed";
  entry.consumedAt = Date.now();
  setTimeout(() => STORE.delete(code.toUpperCase()), 10_000);
  return entry.payload;
}`}
        codeFile="src/lib/pairing/store.ts"
      />

      {/* DECISION LOG */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              Decision log
            </p>
            <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              Five trade-offs I&apos;d defend in a code review.
            </h2>
          </ScrollReveal>

          <StaggerGroup className="space-y-3">
            {DECISIONS.map((d) => (
              <StaggerItem key={d.title}>
                <GlassCard className="p-5 md:p-6">
                  <div className="grid md:grid-cols-[180px_1fr] gap-4 items-start">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                        {d.title}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-on-surface font-bold leading-snug">
                        Chose <span className="text-primary">{d.chose}</span>{" "}
                        over{" "}
                        <span className="text-on-surface-variant/80 line-through decoration-on-surface-variant/40">
                          {d.over}
                        </span>
                      </p>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {d.why}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* STACK */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              Stack
            </p>
            <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              Everything is{" "}
              <span className="gradient-text-static">in the open.</span>
            </h2>
            <p className="mt-4 text-on-surface-variant max-w-xl mx-auto">
              No proprietary boxes, no closed-source UI kit. If you can read
              TypeScript and Tailwind, you can read every file in this project.
            </p>
          </ScrollReveal>

          <StaggerGroup className="flex flex-wrap justify-center gap-2 md:gap-3">
            {STACK.map((s) => (
              <StaggerItem key={s.label}>
                <div className="inline-flex items-center gap-2 rounded-full glass-card-strong px-4 py-2 text-on-surface">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    {s.icon}
                  </span>
                  <span className="text-sm font-extrabold tracking-tight">
                    {s.label}
                  </span>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              Architecture
            </p>
            <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              The wiring, in one diagram.
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <GlassCard className="p-6 md:p-10">
              <ArchitectureDiagram />
            </GlassCard>
          </ScrollReveal>
        </div>
      </section>

      {/* WHAT'S NEXT */}
      <section className="relative px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
              What&apos;s next
            </p>
            <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              Roadmap, ordered by{" "}
              <span className="gradient-text-static">demo impact.</span>
            </h2>
          </ScrollReveal>

          <StaggerGroup className="grid md:grid-cols-2 gap-4">
            {NEXT_UP.map((n, i) => (
              <StaggerItem key={n.title}>
                <GlassCard className="p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 h-9 w-9 rounded-2xl bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center font-extrabold">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-on-surface">
                        {n.title}
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">
                        {n.detail}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 pb-32 pt-12">
        <ScrollReveal className="max-w-4xl mx-auto text-center">
          <GlassCard className="p-12 md:p-16" tilt={false}>
            <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface">
              Stop reading.
              <br />
              <span className="gradient-text">Tap something.</span>
            </h2>
            <p className="mt-5 text-on-surface-variant max-w-md mx-auto">
              The fastest way to see this case study is to use the app it&apos;s
              describing.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton className="rounded-2xl bg-primary text-on-primary px-8 py-4 font-bold tracking-wide shadow-[0_20px_40px_-10px_rgba(0,97,114,0.5)] hover:shadow-[0_30px_60px_-10px_rgba(0,97,114,0.7)] transition-shadow">
                <Link href="/dashboard" className="flex items-center gap-2">
                  Open the app
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </MagneticButton>
              <TalkToPalButton />
            </div>
          </GlassCard>
        </ScrollReveal>
      </section>

      <footer className="relative pb-12 text-center text-xs text-on-surface-variant/60">
        © 2026 PreOpPal · Case study
      </footer>
    </PageShell>
  );
}

/* -------------------------------------------------------------------------- */
/* feature section primitive                                                  */
/* -------------------------------------------------------------------------- */

type Decision = { line: string; detail: string };

function FeatureSection({
  eyebrow,
  title,
  story,
  right,
  decisions,
  code,
  codeFile,
  flipped,
}: {
  eyebrow: string;
  title: string;
  story: string;
  right: React.ReactNode;
  decisions: Decision[];
  code: string;
  codeFile: string;
  flipped?: boolean;
}) {
  return (
    <section className="relative px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">
            {eyebrow}
          </p>
          <h2 className="text-balance text-3xl md:text-5xl font-extrabold tracking-tight text-on-surface max-w-3xl mx-auto leading-tight">
            {title}
          </h2>
        </ScrollReveal>

        <div
          className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
            flipped ? "lg:[&>div:first-child]:order-2" : ""
          }`}
        >
          <ScrollReveal className="lg:col-span-7" delay={0.05}>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              {story}
            </p>
            <div className="mt-8 space-y-3">
              {decisions.map((d) => (
                <div
                  key={d.line}
                  className="rounded-2xl glass-card p-4 md:p-5"
                >
                  <p className="text-on-surface font-bold leading-snug flex items-start gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                      check_circle
                    </span>
                    {d.line}
                  </p>
                  <p className="mt-1.5 pl-7 text-on-surface-variant text-sm leading-relaxed">
                    {d.detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <CodeBlock filename={codeFile}>{code}</CodeBlock>
            </div>
          </ScrollReveal>

          <ScrollReveal className="lg:col-span-5" delay={0.15}>
            <div className="flex justify-center">{right}</div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* feature showcases (right column)                                            */
/* -------------------------------------------------------------------------- */

function InstallShowcase() {
  return (
    <GlassCard className="p-8 w-full max-w-sm">
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="relative h-24 w-24 rounded-3xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, #acedff 0%, #88d1e5 35%, #2a7a8c 70%, #006172 100%)",
            boxShadow:
              "0 22px 44px -10px rgba(0,97,114,0.55), 0 0 0 4px rgba(255,255,255,0.4) inset",
          }}
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <motion.span
            aria-hidden
            className="absolute inset-0 ring-2 ring-white/60 rounded-3xl"
            animate={{ opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />
          <span className="material-symbols-outlined text-white text-5xl drop-shadow">
            favorite
          </span>
        </motion.div>
        <h3 className="mt-6 text-xl font-extrabold text-on-surface">
          PreOpPal
        </h3>
        <p className="text-[12px] text-on-surface-variant mt-1">
          v1 · 380 KB gzipped
        </p>
        <div className="mt-6 w-full">
          <InstallDemoButton />
        </div>
        <p className="mt-3 text-[11px] text-on-surface-variant">
          Tap above. On iOS, use{" "}
          <span className="inline-flex items-center gap-1 align-middle">
            <svg
              viewBox="0 0 24 24"
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="inline-block text-primary"
            >
              <path d="M12 3v12" />
              <path d="m7 8 5-5 5 5" />
              <path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
            </svg>{" "}
            Share → Add to Home Screen
          </span>
          .
        </p>
      </div>
    </GlassCard>
  );
}

function VoiceShowcase() {
  return (
    <GlassCard
      className="p-8 w-full max-w-sm overflow-hidden relative"
      tilt={false}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(136,209,229,0.4), transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <div className="relative flex flex-col items-center text-center">
        <div className="relative h-44 w-44 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="absolute inset-0 rounded-full"
              style={{
                border: "1px solid rgba(136,209,229,0.45)",
              }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
              transition={{
                duration: 3 + i * 0.6,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.div
            className="relative h-32 w-32 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, #e7f8ff 0%, #acedff 25%, #88d1e5 50%, #2a7a8c 75%, #006172 100%)",
              boxShadow:
                "0 22px 44px -10px rgba(136,209,229,0.55), 0 0 0 4px rgba(255,255,255,0.18) inset",
            }}
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          />
          <span className="absolute material-symbols-outlined text-white text-5xl drop-shadow-lg">
            graphic_eq
          </span>
        </div>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          Voice mode
        </p>
        <h3 className="mt-1 text-xl font-extrabold text-on-surface">
          Audio-reactive orb
        </h3>
        <p className="mt-2 text-sm text-on-surface-variant max-w-[260px]">
          Pulses with your voice. Breathes when Pal is thinking. Speaks in
          sentence-buffered chunks.
        </p>
        <div className="mt-6 w-full">
          <TalkToPalButton />
        </div>
        <p className="mt-3 text-[11px] text-on-surface-variant">
          Audio stays on your device · Pal hears the text.
        </p>
      </div>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/* tiny architecture diagram                                                  */
/* -------------------------------------------------------------------------- */

function ArchitectureDiagram() {
  return (
    <svg
      viewBox="0 0 800 360"
      className="w-full h-auto"
      role="img"
      aria-label="PreOpPal architecture overview"
    >
      <defs>
        <linearGradient id="cardgrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="1" stopColor="#e7f8ff" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="primary" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#88d1e5" />
          <stop offset="1" stopColor="#006172" />
        </linearGradient>
        <marker
          id="arr"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="#2a7a8c" />
        </marker>
      </defs>

      {/* Client column */}
      <text
        x="140"
        y="34"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        letterSpacing="3"
        fill="#006172"
      >
        BROWSER
      </text>
      <Box x={40} y={50} w={200} h={70} title="Next.js app" sub="React 19 · Tailwind" />
      <Box x={40} y={140} w={200} h={70} title="ai-store (singleton)" sub="streams · voiceMode" />
      <Box x={40} y={230} w={200} h={70} title="Service Worker" sub="cache · offline · install" />

      {/* Edge / Node column */}
      <text
        x="400"
        y="34"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        letterSpacing="3"
        fill="#006172"
      >
        SERVER ROUTES
      </text>
      <Box
        x={300}
        y={50}
        w={200}
        h={70}
        title="/api/chat"
        sub="edge · streamText · Gemini"
        accent
      />
      <Box
        x={300}
        y={140}
        w={200}
        h={70}
        title="/api/pair"
        sub="node · POST + GET"
        accent
      />
      <Box
        x={300}
        y={230}
        w={200}
        h={70}
        title="/api/pair/status"
        sub="node · GET poll"
        accent
      />

      {/* External */}
      <text
        x="660"
        y="34"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        letterSpacing="3"
        fill="#006172"
      >
        EXTERNAL
      </text>
      <Box x={560} y={50} w={200} h={70} title="Gemini 3 Flash" sub="Vercel AI SDK" />
      <Box
        x={560}
        y={140}
        w={200}
        h={70}
        title="Pair store"
        sub="in-memory Map · 5m TTL"
      />
      <Box
        x={560}
        y={230}
        w={200}
        h={70}
        title="Web Speech API"
        sub="STT + TTS · client"
      />

      {/* arrows */}
      <line
        x1="240"
        y1="85"
        x2="300"
        y2="85"
        stroke="#2a7a8c"
        strokeWidth="2"
        markerEnd="url(#arr)"
      />
      <line
        x1="500"
        y1="85"
        x2="560"
        y2="85"
        stroke="#2a7a8c"
        strokeWidth="2"
        markerEnd="url(#arr)"
      />
      <line
        x1="240"
        y1="175"
        x2="300"
        y2="175"
        stroke="#2a7a8c"
        strokeWidth="2"
        markerEnd="url(#arr)"
      />
      <line
        x1="500"
        y1="175"
        x2="560"
        y2="175"
        stroke="#2a7a8c"
        strokeWidth="2"
        markerEnd="url(#arr)"
      />
      <line
        x1="240"
        y1="265"
        x2="300"
        y2="265"
        stroke="#2a7a8c"
        strokeWidth="2"
        markerEnd="url(#arr)"
      />
      <line
        x1="500"
        y1="265"
        x2="560"
        y2="265"
        stroke="#2a7a8c"
        strokeWidth="2"
        markerEnd="url(#arr)"
      />
      {/* ai-store ↔ Web Speech */}
      <path
        d="M140 210 C 140 290, 560 290, 660 280"
        fill="none"
        stroke="#88d1e5"
        strokeDasharray="4 4"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function Box({
  x,
  y,
  w,
  h,
  title,
  sub,
  accent,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        ry={14}
        fill={accent ? "url(#primary)" : "url(#cardgrad)"}
        stroke={accent ? "#006172" : "#bfe3ec"}
        strokeWidth={1}
      />
      <text
        x={x + w / 2}
        y={y + 30}
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill={accent ? "#ffffff" : "#003844"}
      >
        {title}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + 50}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill={accent ? "rgba(255,255,255,0.85)" : "#2a7a8c"}
        >
          {sub}
        </text>
      )}
    </g>
  );
}
