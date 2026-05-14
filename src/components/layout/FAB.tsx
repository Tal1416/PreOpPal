"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAI, SUGGESTIONS } from "@/components/ai/ai-store";
import { usePalExecutor } from "@/components/ai/use-pal-executor";
import { useSpeechRecognition } from "@/lib/voice/use-speech-recognition";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";

export default function FAB() {
  const ai = useAI();
  const { profile } = useProfile();
  const { isEmbed } = useViewMode();
  const executor = usePalExecutor();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // One-shot mic for the chat input. The fullscreen voice flow lives in VoiceOverlay.
  const stt = useSpeechRecognition({
    onFinal: (text) => {
      ai.send(text, profile, executor);
      setInput("");
    },
  });

  useEffect(() => {
    if (!ai.open) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [ai.messages, ai.typing, ai.open]);

  // Mirror the in-flight transcript into the input so the user sees what's heard.
  useEffect(() => {
    if (!stt.listening) return;
    const live = (stt.transcript + " " + stt.interim).trim();
    if (live) setInput(live);
  }, [stt.transcript, stt.interim, stt.listening]);

  function send() {
    if (!input.trim()) return;
    ai.send(input, profile, executor);
    setInput("");
  }

  function openVoiceOverlay() {
    ai.setOpen(false);
    ai.setVoiceOverlay(true);
    if ("vibrate" in navigator) navigator.vibrate?.(10);
  }

  return (
    <>
      {/* HINT BUBBLE — visible when closed */}
      <AnimatePresence>
        {!ai.open && (
          <motion.button
            key="hint"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onClick={() => ai.setOpen(true)}
            className="hidden md:flex fixed bottom-32 right-32 lg:bottom-12 lg:right-32 z-40 items-center gap-2 rounded-2xl glass-card-strong px-4 py-2.5 shadow-glass-lg hover:scale-105 transition-transform"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Ask Pal
            </span>
            <span className="material-symbols-outlined text-primary text-base">
              arrow_forward
            </span>
            <span
              aria-hidden
              className="absolute right-[-8px] top-1/2 -translate-y-1/2 h-3 w-3 rotate-45 bg-white/85 border-r border-b border-white/40"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* THE BIG ORB BUTTON */}
      <motion.button
        onClick={() => ai.toggle()}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.06 }}
        animate={{ rotate: ai.open ? 45 : 0 }}
        className={`fixed z-50 flex items-center justify-center rounded-full text-on-primary ${
          isEmbed
            ? "bottom-[88px] right-4 h-12 w-12"
            : "bottom-24 right-6 lg:bottom-8 lg:right-8 h-20 w-20 lg:h-24 lg:w-24"
        }`}
        style={{
          background:
            "linear-gradient(135deg, #acedff 0%, #88d1e5 35%, #2a7a8c 70%, #006172 100%)",
          boxShadow: isEmbed
            ? "0 12px 24px -6px rgba(0,97,114,0.45), 0 0 0 3px rgba(255,255,255,0.35) inset"
            : "0 30px 60px -10px rgba(0,97,114,0.55), 0 0 0 6px rgba(255,255,255,0.4) inset",
        }}
        aria-label={ai.open ? "Close AI companion" : "Open AI companion"}
      >
        {/* outer breathing rings */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-white/40"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.6, repeat: Infinity }}
        />
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-white/30"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: 0.4 }}
        />
        <span
          className={`material-symbols-outlined text-white drop-shadow-md ${
            isEmbed ? "text-[22px]" : "text-4xl lg:text-5xl"
          }`}
        >
          {ai.open ? "close" : "smart_toy"}
        </span>
        {!ai.open && (
          <span
            className={`absolute rounded-full bg-green-400 ring-2 ring-white animate-pulse-teal ${
              isEmbed ? "top-0.5 right-0.5 h-2.5 w-2.5" : "top-1 right-1 h-3.5 w-3.5"
            }`}
          />
        )}
      </motion.button>

      {/* DRAWER */}
      <AnimatePresence>
        {ai.open && (
          <motion.div
            key="drawer"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed z-40 glass-card-strong rounded-3xl shadow-glass-lg overflow-hidden flex flex-col
              bottom-48 right-4 left-4 lg:left-auto lg:right-8 lg:bottom-36
              w-auto lg:w-[420px] h-[min(640px,72vh)]"
          >
            {/* header */}
            <div className="relative shrink-0 px-5 py-4 border-b border-white/40 flex items-center gap-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,97,114,0.92), rgba(42,122,140,0.92))",
              }}
            >
              <div className="relative h-11 w-11 rounded-full bg-gradient-to-br from-[#acedff] to-white flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-primary">
                  smart_toy
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-400 ring-2 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-white">Pal</p>
                <p className="text-[11px] text-white/70 font-medium">
                  AI Companion · Always with you
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.06 }}
                onClick={openVoiceOverlay}
                aria-label="Open voice conversation"
                title="Talk to Pal"
                className="relative h-9 w-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center border border-white/25"
              >
                <span className="material-symbols-outlined text-[18px]">
                  graphic_eq
                </span>
                <span
                  aria-hidden
                  className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#7CFFA7] ring-2 ring-[#0e3640]"
                />
              </motion.button>
              <button
                onClick={() => ai.setOpen(false)}
                aria-label="Close"
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* messages */}
            <div
              ref={scrollRef}
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 space-y-3 bg-white/40"
            >
              <AnimatePresence initial={false}>
                {ai.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 28,
                    }}
                    className={`flex gap-2 ${
                      msg.from === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {msg.from === "ai" && (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shrink-0 self-end">
                        <span className="material-symbols-outlined text-sm">
                          smart_toy
                        </span>
                      </div>
                    )}
                    <div className={`max-w-[80%] flex flex-col gap-1.5 ${msg.from === "user" ? "items-end" : "items-start"}`}>
                      {(msg.text.trim() || !msg.actions?.length) && (
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-[14px] leading-snug whitespace-pre-wrap break-words ${
                            msg.from === "user"
                              ? "bg-primary text-white rounded-br-md"
                              : "bg-white text-on-surface rounded-bl-md border border-white"
                          }`}
                        >
                          {msg.text}
                          <p
                            className={`mt-1 text-[10px] ${
                              msg.from === "user"
                                ? "text-white/60"
                                : "text-on-surface-variant/60"
                            }`}
                          >
                            {msg.time}
                          </p>
                        </div>
                      )}
                      {msg.actions?.map((r, i) => (
                        <div
                          key={i}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            r.ok
                              ? "bg-gradient-to-r from-[#88d1e5] to-[#006172] text-white"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {r.icon}
                          </span>
                          {r.label}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {ai.typing && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2 justify-start"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shrink-0 self-end">
                      <span className="material-symbols-outlined text-sm">
                        smart_toy
                      </span>
                    </div>
                    <div className="bg-white border border-white px-4 py-2.5 rounded-2xl rounded-bl-md flex items-center gap-1">
                      {[0, 0.15, 0.3].map((d) => (
                        <motion.span
                          key={d}
                          className="h-1.5 w-1.5 rounded-full bg-primary"
                          animate={{
                            y: [0, -3, 0],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: d,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* suggestions */}
            {ai.messages.length <= 2 && !ai.typing && (
              <div className="px-4 pt-2 pb-1 flex flex-wrap gap-1.5 shrink-0">
                {SUGGESTIONS.slice(0, 3).map((s) => (
                  <button
                    key={s}
                    onClick={() => ai.send(s, profile, executor)}
                    className="text-[11px] rounded-full bg-primary-fixed/40 text-primary border border-primary/20 px-2.5 py-1 hover:bg-primary hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="border-t border-white/40 p-3 flex items-center gap-2 bg-white/70 shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  stt.listening ? "Listening…" : "Ask Pal anything…"
                }
                className="flex-1 bg-white rounded-full px-4 py-2.5 outline-none text-sm border border-white/80 placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/30"
              />
              {stt.supported && (
                <motion.button
                  type="button"
                  onClick={() => (stt.listening ? stt.stop() : stt.start())}
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ scale: 1.05 }}
                  aria-label={stt.listening ? "Stop listening" : "Talk to Pal"}
                  title={stt.listening ? "Stop listening" : "Tap to speak"}
                  className={`relative h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                    stt.listening
                      ? "bg-rose-500 text-white"
                      : "bg-white text-primary border border-white/80"
                  }`}
                >
                  {stt.listening && (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-rose-500"
                      animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
                  <span className="relative material-symbols-outlined text-xl">
                    {stt.listening ? "stop" : "mic"}
                  </span>
                </motion.button>
              )}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.05 }}
                disabled={!input.trim()}
                className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
