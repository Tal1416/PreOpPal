"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAI, subscribeToStream } from "@/components/ai/ai-store";
import { usePalExecutor } from "@/components/ai/use-pal-executor";
import { useSpeechRecognition } from "@/lib/voice/use-speech-recognition";
import { useSpeechSynthesis } from "@/lib/voice/use-speech-synthesis";
import { useMicLevel } from "@/lib/voice/use-mic-level";
import { useProfile } from "@/lib/profile-context";

type Phase = "idle" | "listening" | "thinking" | "speaking";

/**
 * Full-screen voice conversation UI. Tap the orb to listen, Pal answers
 * back out loud, then re-arms the mic automatically. Tap anywhere to interrupt.
 *
 * Mounted at the root via providers so it can sit above every page.
 */
export default function VoiceOverlay() {
  const ai = useAI();
  const { profile } = useProfile();
  const executor = usePalExecutor();
  const tts = useSpeechSynthesis();

  const stt = useSpeechRecognition({
    onFinal: (text) => {
      // User finished a thought — send it.
      lastUserRef.current = text;
      ai.send(text, profile, executor);
    },
  });

  // Track the currently-streaming AI message so we can show captions + speak it.
  const [captionId, setCaptionId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const lastUserRef = useRef<string>("");
  const armNextRef = useRef<boolean>(false);

  // Subscribe to streaming chunks → pipe into TTS sentence-by-sentence,
  // and update the on-screen caption.
  useEffect(() => {
    if (!ai.voiceOverlay) return;
    const unsub = subscribeToStream((messageId, delta, done) => {
      setCaptionId(messageId);
      if (delta) {
        setCaption((c) => c + delta);
        tts.enqueue(delta);
      }
      if (done) {
        tts.flush();
        armNextRef.current = true;
      }
    });
    return unsub;
  }, [ai.voiceOverlay, tts]);

  // When TTS finishes speaking and we've armed for another turn, re-open the mic.
  useEffect(() => {
    if (!ai.voiceOverlay) return;
    if (tts.speaking) return;
    if (!armNextRef.current) return;
    if (stt.listening) return;
    if (ai.typing) return;
    // Small breath before re-listening so we don't catch our own tail audio.
    const t = window.setTimeout(() => {
      armNextRef.current = false;
      setCaption("");
      stt.start();
    }, 350);
    return () => clearTimeout(t);
  }, [tts.speaking, ai.voiceOverlay, ai.typing, stt]);

  // When the overlay closes, hard-stop everything.
  useEffect(() => {
    if (ai.voiceOverlay) return;
    tts.cancel();
    stt.stop();
    armNextRef.current = false;
    setCaption("");
    setCaptionId(null);
  }, [ai.voiceOverlay, tts, stt]);

  // Greet the user the first time the overlay opens with a brand-new session.
  useEffect(() => {
    if (!ai.voiceOverlay) return;
    if (lastUserRef.current) return; // already had a turn
    tts.say("Hey, I'm Pal. Tap the orb whenever you want to talk.");
    // The user starts the conversation, not us — so don't auto-arm.
  }, [ai.voiceOverlay, tts]);

  const phase: Phase = useMemo(() => {
    if (stt.listening) return "listening";
    if (ai.typing) return "thinking";
    if (tts.speaking) return "speaking";
    return "idle";
  }, [stt.listening, ai.typing, tts.speaking]);

  // Drive the orb scale: by mic level when listening, by sine when speaking.
  const micLevel = useMicLevel(phase === "listening");
  const [speakPulse, setSpeakPulse] = useState(0);
  useEffect(() => {
    if (phase !== "speaking") {
      setSpeakPulse(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = (t - start) / 1000;
      // Layer two sine waves for an organic, breathing pulse.
      const v =
        0.5 +
        0.35 * Math.sin(elapsed * 6.2) +
        0.15 * Math.sin(elapsed * 2.3 + 1.2);
      setSpeakPulse(Math.max(0, Math.min(1, v)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const intensity =
    phase === "listening" ? micLevel : phase === "speaking" ? speakPulse : 0;

  function onOrbPress() {
    if (phase === "listening") {
      stt.stop();
      return;
    }
    if (phase === "speaking" || phase === "thinking") {
      tts.cancel();
      armNextRef.current = false;
      return;
    }
    setCaption("");
    armNextRef.current = false;
    stt.start();
  }

  function close() {
    ai.setVoiceOverlay(false);
  }

  const phaseLabel: Record<Phase, string> = {
    idle: "Tap to talk",
    listening: "Listening…",
    thinking: "Pal is thinking",
    speaking: "Pal is speaking",
  };

  // What to show in the caption pane — user's spoken words while listening,
  // Pal's reply when speaking.
  const captionText =
    phase === "listening"
      ? (stt.transcript + " " + stt.interim).trim()
      : caption;

  return (
    <AnimatePresence>
      {ai.voiceOverlay && (
        <motion.div
          key="voice-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-between overflow-hidden"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 0%, #0e3640 0%, #061b22 60%, #03131a 100%)",
          }}
        >
          {/* aurora background */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 50%, rgba(136,209,229,0.30) 0%, rgba(0,97,114,0.10) 50%, rgba(0,0,0,0) 70%)",
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-32 -left-32 h-[60vh] w-[60vh] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(172,237,255,0.20), transparent 70%)",
            }}
            animate={{ x: [0, 60, -30, 0], y: [0, -20, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-40 -right-32 h-[55vh] w-[55vh] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(0,97,114,0.45), transparent 70%)",
            }}
            animate={{ x: [0, -40, 30, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* TOP BAR */}
          <div className="relative z-10 w-full flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3">
            <div className="flex items-center gap-2 rounded-full glass-card-dark px-3 py-1.5 text-white/80">
              <span className="material-symbols-outlined text-[16px] text-[#7CFFA7]">
                graphic_eq
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                Voice mode
              </span>
            </div>
            <button
              onClick={close}
              aria-label="Close voice"
              className="rounded-full glass-card-dark h-10 w-10 flex items-center justify-center text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* PHASE LABEL */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <motion.p
              key={phase}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#88d1e5]"
            >
              {phaseLabel[phase]}
            </motion.p>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-white">
              {phase === "idle" && lastUserRef.current
                ? "Ask Pal anything else…"
                : phase === "idle"
                  ? "I'm here when you're ready."
                  : phase === "listening"
                    ? "I'm listening…"
                    : phase === "thinking"
                      ? "One moment…"
                      : "…"}
            </h2>
          </div>

          {/* ORB */}
          <div className="relative z-10 flex-1 flex items-center justify-center w-full">
            <button
              onClick={onOrbPress}
              className="relative h-[58vmin] w-[58vmin] max-h-[420px] max-w-[420px] focus:outline-none"
              aria-label={phase === "listening" ? "Stop listening" : "Start talking"}
            >
              {/* outer pulse rings */}
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: "1px solid rgba(136,209,229,0.45)",
                    boxShadow: "0 0 60px rgba(136,209,229,0.15)",
                  }}
                  animate={{
                    scale: [1, 1.25 + intensity * 0.4, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 3 + i * 0.6,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: "easeInOut",
                  }}
                />
              ))}

              {/* The orb itself — scale tracks audio intensity */}
              <motion.div
                className="absolute inset-[8%] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #e7f8ff 0%, #acedff 25%, #88d1e5 50%, #2a7a8c 75%, #006172 100%)",
                  boxShadow:
                    "0 30px 80px -10px rgba(136,209,229,0.55), 0 0 0 6px rgba(255,255,255,0.12) inset, 0 -40px 80px rgba(0,97,114,0.4) inset",
                }}
                animate={{
                  scale: 1 + intensity * 0.18,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              />

              {/* breathing inner glow when idle */}
              {phase === "idle" && (
                <motion.span
                  aria-hidden
                  className="absolute inset-[18%] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)",
                  }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}

              {/* center icon */}
              <span
                className="absolute inset-0 flex items-center justify-center text-white drop-shadow-lg"
                style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}
              >
                <motion.span
                  key={phase}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="material-symbols-outlined"
                  style={{ fontSize: "clamp(48px, 10vmin, 96px)" }}
                >
                  {phase === "listening"
                    ? "mic"
                    : phase === "thinking"
                      ? "more_horiz"
                      : phase === "speaking"
                        ? "graphic_eq"
                        : "smart_toy"}
                </motion.span>
              </span>

              {/* live waveform under the orb when listening */}
              {phase === "listening" && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-[3px] h-10">
                  {[...Array(11)].map((_, i) => {
                    const phaseOff = Math.sin((Date.now() / 200 + i) * 1.4);
                    const h =
                      6 +
                      Math.max(0, micLevel) * 28 *
                        (0.45 + 0.55 * Math.abs(phaseOff));
                    return (
                      <motion.span
                        key={i}
                        className="w-[3px] rounded-full bg-[#88d1e5]"
                        animate={{ height: h }}
                        transition={{
                          type: "spring",
                          stiffness: 320,
                          damping: 18,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          </div>

          {/* CAPTION + HINT */}
          <div className="relative z-10 w-full px-5 pb-[max(env(safe-area-inset-bottom),24px)]">
            <AnimatePresence mode="wait">
              {captionText && (
                <motion.div
                  key={captionId || "live"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto max-w-xl rounded-3xl glass-card-dark px-5 py-4 text-center"
                >
                  <p className="text-[15px] leading-snug text-white/95 font-medium">
                    {captionText}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!stt.supported && (
              <p className="mt-3 text-center text-xs text-amber-200/80">
                Your browser doesn&apos;t support speech recognition. Try
                Safari, Chrome, or Edge.
              </p>
            )}
            {stt.error === "not-allowed" && (
              <p className="mt-3 text-center text-xs text-rose-200/90">
                Microphone access was blocked. Enable it in your browser
                settings to talk to Pal.
              </p>
            )}

            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-white/50 font-medium">
              <span className="material-symbols-outlined text-[14px]">
                lock
              </span>
              Audio stays on your device. Pal hears the text, not the sound.
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
