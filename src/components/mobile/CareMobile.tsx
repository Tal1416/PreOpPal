"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { careTeam, chatSeed, ChatMessage } from "@/data/content";
import { streamCareReply } from "@/lib/care-chat";
import { useProfile } from "@/lib/profile-context";
import { useAuth } from "@/lib/auth-context";

type CareMessageRow = {
  id: string;
  role: "user" | "nurse";
  text: string;
  created_at: string;
};

function rowTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

const QUICK_REPLIES = [
  "Am I fasting right?",
  "What if I'm anxious?",
  "Stop my meds?",
];

export default function CareMobile() {
  const { profile } = useProfile();
  const { isAuthenticated, hydrated: authHydrated } = useAuth();
  const team = careTeam.map((m, i) =>
    i === 0 && profile.surgeon?.trim()
      ? { ...m, name: profile.surgeon.trim() }
      : m
  );
  // The first seeded greeting is always shown — it gives the chat warmth even
  // for brand-new accounts. Persisted history (from /api/care-chat) follows it.
  const seedGreeting: ChatMessage = {
    id: "1",
    from: "nurse",
    text: `Hi ${profile.firstName?.trim() || "there"} — I'm Nurse Amelia. I'll be your point of contact this week. How are you feeling about your ${profile.procedure?.trim() || "procedure"}?`,
    time: "9:02 AM",
  };
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    seedGreeting,
    ...chatSeed.slice(1),
  ]);
  const [historyHydrated, setHistoryHydrated] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hydrate persisted care-chat history once the user is authenticated.
  useEffect(() => {
    if (!authHydrated || historyHydrated) return;
    if (!isAuthenticated) {
      setHistoryHydrated(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/care-chat", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { messages?: CareMessageRow[] };
        const rows = json.messages ?? [];
        if (!cancelled && rows.length > 0) {
          const restored: ChatMessage[] = rows.map((r) => ({
            id: r.id,
            from: r.role,
            text: r.text,
            time: rowTime(r.created_at),
          }));
          setMessages([seedGreeting, ...restored]);
        }
      } catch {
        // ignore — keep the seed greeting
      } finally {
        if (!cancelled) setHistoryHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // We deliberately only hydrate once per mount; seedGreeting is stable
    // enough since the dependencies that change it (firstName, procedure)
    // are part of profile and don't need to invalidate persisted history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authHydrated, isAuthenticated]);

  useEffect(() => {
    if (!chatOpen) return;
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, typing, chatOpen]);

  async function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || typing) return;
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      from: "user",
      text: value,
      time: nowTime(),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setTyping(true);

    const replyId = `n-${Date.now()}`;
    let started = false;
    const coordinator = team[2];

    await streamCareReply({
      history,
      profile,
      member: { name: coordinator.name, role: coordinator.role },
      onText: (txt) => {
        if (!started) {
          started = true;
          setTyping(false);
          setMessages((m) => [
            ...m,
            { id: replyId, from: "nurse", text: txt, time: nowTime() },
          ]);
        } else {
          setMessages((m) =>
            m.map((msg) => (msg.id === replyId ? { ...msg, text: txt } : msg)),
          );
        }
      },
    });
    setTyping(false);
  }

  return (
    <div className="space-y-5">
      {/* HERO */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-[28px] overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(135deg, #006172 0%, #2a7a8c 50%, #0a6879 100%)",
        }}
      >
        <motion.span
          aria-hidden
          className="absolute -top-16 -right-12 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(176,236,254,0.4), transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
        <div className="relative px-5 pt-5 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/70">
            Care support
          </p>
          <h1 className="mt-1 text-[22px] leading-tight font-extrabold tracking-tight">
            Your team —{" "}
            <span className="text-[#acedff]">one tap away.</span>
          </h1>
          <p className="mt-1.5 text-[12px] text-white/80 leading-snug">
            Surgeon, nurse, anesthesia. No phone trees.
          </p>
        </div>
      </motion.section>

      {/* PRIMARY CONTACT — Nurse Amelia */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06 }}
        className="glass-card rounded-3xl overflow-hidden"
      >
        <div className="px-4 py-4 flex items-center gap-3 border-b border-white/40">
          <div className="relative shrink-0">
            <img
              src={team[2].avatar}
              alt={team[2].name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white animate-pulse-teal" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Your nurse
            </p>
            <h3 className="text-base font-extrabold text-on-surface truncate">
              {team[2].name}
            </h3>
            <p className="text-[11px] text-primary font-medium">
              Online · responds in minutes
            </p>
          </div>
          <button
            aria-label="Video call"
            className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">
              videocam
            </span>
          </button>
        </div>
        <div className="px-4 pt-3 pb-4 flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => {
                setChatOpen(true);
                setTimeout(() => send(q), 200);
              }}
              className="text-[11px] rounded-full bg-primary-fixed/40 text-primary border border-primary/20 px-2.5 py-1 active:scale-95 transition-transform"
            >
              {q}
            </button>
          ))}
        </div>
        <button
          onClick={() => setChatOpen(true)}
          className="w-full px-4 py-3 flex items-center justify-between border-t border-white/40 bg-white/40 active:bg-white/60 transition-colors"
        >
          <span className="text-[13px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">
              chat
            </span>
            Open chat
          </span>
          <span className="material-symbols-outlined text-on-surface-variant/60 text-[18px]">
            chevron_right
          </span>
        </button>
      </motion.section>

      {/* SPECIALISTS */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
      >
        <h2 className="text-base font-extrabold text-on-surface mb-2.5 px-1">
          Specialists
        </h2>
        <div className="space-y-2.5">
          {team.map((m) => (
            <div
              key={m.id}
              className="glass-card rounded-2xl p-3 flex items-center gap-3"
            >
              <div className="relative shrink-0">
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                />
                {m.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-bold text-on-surface truncate">
                  {m.name}
                </h4>
                <p className="text-[11px] text-secondary truncate">{m.role}</p>
              </div>
              <button
                aria-label={`Message ${m.name}`}
                className="h-9 w-9 rounded-full bg-white/70 active:bg-primary active:text-white text-primary flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  chat
                </span>
              </button>
            </div>
          ))}
        </div>
      </motion.section>

      {/* AI CARD */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="relative rounded-3xl overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #006172 0%, #2a7a8c 100%)",
        }}
      >
        <motion.span
          aria-hidden
          className="absolute -bottom-16 -left-12 h-56 w-56 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(136,209,229,0.35), transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 14, repeat: Infinity }}
        />
        <div className="relative px-5 py-5">
          <div className="flex items-start gap-3">
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-[#acedff] to-white flex items-center justify-center shadow"
            >
              <span className="material-symbols-outlined text-primary">
                smart_toy
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 ring-2 ring-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
                AI Companion · 24/7
              </p>
              <h3 className="text-lg font-extrabold mt-0.5">Pal</h3>
              <p className="text-[12px] text-white/80 leading-snug mt-1">
                Fasting, meds, anesthesia — quiet answers, anytime.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* CHAT SHEET */}
      <AnimatePresence>
        {chatOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setChatOpen(false)}
            />
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal="true"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-50 h-[88%] glass-card-strong rounded-t-[32px] flex flex-col overflow-hidden shadow-glass-lg"
            >
              <div
                className="shrink-0 px-5 py-4 flex items-center gap-3 border-b border-white/40"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,97,114,0.95), rgba(42,122,140,0.95))",
                }}
              >
                <div className="relative shrink-0">
                  <img
                    src={team[2].avatar}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/40"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-white truncate">
                    {team[2].name}
                  </p>
                  <p className="text-[10px] text-white/70 font-medium">
                    Online · responds in minutes
                  </p>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  aria-label="Close chat"
                  className="p-1.5 rounded-full hover:bg-white/20 text-white"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div
                ref={scrollRef}
                data-lenis-prevent
                className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 bg-white/40"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
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
                        msg.from === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {msg.from === "nurse" && (
                        <img
                          src={team[2].avatar}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover ring-1 ring-white shrink-0 self-end"
                        />
                      )}
                      <div
                        className={`max-w-[78%] px-3.5 py-2 rounded-2xl shadow-[0_3px_10px_-3px_rgba(42,122,140,0.18)] ${
                          msg.from === "user"
                            ? "bg-primary text-white"
                            : "bg-white text-on-surface border border-white/80"
                        }`}
                      >
                        <p className="text-[14px] leading-snug whitespace-pre-wrap break-words">
                          {msg.text}
                        </p>
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
                    </motion.div>
                  ))}
                  {typing && (
                    <motion.div
                      key="typing"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2 justify-start"
                    >
                      <img
                        src={team[2].avatar}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover ring-1 ring-white shrink-0 self-end"
                      />
                      <div className="bg-white border border-white/80 px-4 py-2.5 rounded-2xl flex items-center gap-1 shadow-[0_3px_10px_-3px_rgba(42,122,140,0.18)]">
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

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="shrink-0 border-t border-white/40 p-3 flex items-center gap-2 bg-white/70"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 bg-white rounded-full px-4 py-2.5 outline-none text-sm border border-white/80 placeholder:text-on-surface-variant/60 focus:ring-2 focus:ring-primary/30"
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.92 }}
                  disabled={!input.trim()}
                  className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">
                    send
                  </span>
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
