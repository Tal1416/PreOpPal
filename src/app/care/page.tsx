"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import GlassCard from "@/components/ui/GlassCard";
import ScrollReveal, {
  StaggerGroup,
  StaggerItem,
} from "@/components/ui/ScrollReveal";
import { careTeam, chatSeed, ChatMessage } from "@/data/content";
import { streamCareReply } from "@/lib/care-chat";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";
import CareMobile from "@/components/mobile/CareMobile";

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CareSupportPage() {
  return (
    <Suspense fallback={null}>
      <CareSupport />
    </Suspense>
  );
}

function CareSupport() {
  const { profile } = useProfile();
  const { isEmbed } = useViewMode();
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chat");

  const team = careTeam.map((m, i) =>
    i === 0 && profile.surgeon?.trim()
      ? { ...m, name: profile.surgeon.trim() }
      : m
  );
  const partner = team.find((m) => m.id === chatId) ?? team[2];
  const partnerFirstName = partner.name.split(",")[0].split(" ").slice(0, 2).join(" ");
  const personalizedSeed: ChatMessage[] = [
    {
      id: "1",
      from: "nurse",
      text: `Hi ${profile.firstName?.trim() || "there"} — I'm ${partnerFirstName}, your ${partner.role.toLowerCase()}. How are you feeling about your ${profile.procedure?.trim() || "procedure"}?`,
      time: "9:02 AM",
    },
    ...chatSeed.slice(1),
  ];
  const [messages, setMessages] = useState<ChatMessage[]>(personalizedSeed);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(personalizedSeed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partner.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  if (isEmbed) {
    return (
      <PageShell>
        <CareMobile />
      </PageShell>
    );
  }

  async function send() {
    if (!input.trim() || typing) return;
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      from: "user",
      text: input.trim(),
      time: nowTime(),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setTyping(true);

    const replyId = `n-${Date.now()}`;
    let started = false;

    await streamCareReply({
      history,
      profile,
      member: { name: partner.name, role: partner.role },
      onText: (text) => {
        if (!started) {
          started = true;
          setTyping(false);
          setMessages((m) => [
            ...m,
            { id: replyId, from: "nurse", text, time: nowTime() },
          ]);
        } else {
          setMessages((m) =>
            m.map((msg) => (msg.id === replyId ? { ...msg, text } : msg)),
          );
        }
      },
    });
    setTyping(false);
  }

  return (
    <PageShell>
      <div className="max-w-7xl mx-auto space-y-10">
        <ScrollReveal>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-3">
            Care Support Hub
          </p>
          <h1 className="text-balance text-4xl md:text-6xl font-extrabold tracking-tight text-on-surface">
            Your team.{" "}
            <span className="gradient-text-static">One tap away.</span>
          </h1>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CHAT */}
          <ScrollReveal className="lg:col-span-7" delay={0.05}>
            <GlassCard
              className="border-l-4 border-primary p-0 flex flex-col h-[640px]"
              tilt={false}
            >
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/40">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={partner.avatar}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                    />
                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse-teal" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">
                      {partner.name}
                    </h3>
                    <p className="text-xs text-primary font-medium">
                      Online · responds in minutes
                    </p>
                  </div>
                </div>
                <button className="rounded-full p-2 hover:bg-white/40 transition-colors">
                  <span className="material-symbols-outlined text-primary">
                    videocam
                  </span>
                </button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 28,
                      }}
                      className={`flex gap-3 ${
                        msg.from === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.from === "nurse" && (
                        <img
                          src={partner.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-white shrink-0 self-end"
                        />
                      )}
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-3xl shadow-[0_4px_12px_-4px_rgba(42,122,140,0.18)] ${
                          msg.from === "user"
                            ? "bg-primary text-white"
                            : "bg-white text-on-surface border border-white/80"
                        }`}
                      >
                        <p className="text-[15px] leading-snug whitespace-pre-wrap break-words">
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-3 justify-start"
                    >
                      <img
                        src={partner.avatar}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-white shrink-0 self-end"
                      />
                      <div className="bg-white border border-white/80 px-4 py-3 rounded-3xl flex items-center gap-1 shadow-[0_4px_12px_-4px_rgba(42,122,140,0.18)]">
                        {[0, 0.15, 0.3].map((d) => (
                          <motion.span
                            key={d}
                            className="h-2 w-2 rounded-full bg-primary"
                            animate={{
                              y: [0, -4, 0],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 1.0,
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

              <div className="border-t border-white/40 p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                  className="flex items-center gap-2 rounded-full bg-white/80 border border-white/80 px-4 py-2 shadow-glass"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-on-surface-variant/60"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.92 }}
                    whileHover={{ scale: 1.05 }}
                    className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-xl">
                      send
                    </span>
                  </motion.button>
                </form>
              </div>
            </GlassCard>
          </ScrollReveal>

          {/* SPECIALISTS */}
          <ScrollReveal className="lg:col-span-5" delay={0.15}>
            <div className="space-y-4">
              <h2 className="text-headline-sm font-semibold text-primary">
                Specialists
              </h2>
              <StaggerGroup className="space-y-3">
                {team.map((m) => (
                  <StaggerItem key={m.id}>
                    <GlassCard className="p-4 flex items-center gap-4" tilt={false}>
                      <div className="relative shrink-0">
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
                        />
                        {m.online && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 ring-2 ring-white animate-pulse-teal" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-on-surface truncate">
                          {m.name}
                        </h4>
                        <p className="text-xs text-secondary font-medium">
                          {m.role}
                        </p>
                      </div>
                      <Link
                        href={`/care?chat=${m.id}`}
                        scroll={false}
                        aria-label={`Chat with ${m.name}`}
                        className={`rounded-full p-2 transition-colors ${
                          partner.id === m.id
                            ? "bg-primary text-white"
                            : "hover:bg-white/60 text-primary"
                        }`}
                      >
                        <span className="material-symbols-outlined">chat</span>
                      </Link>
                    </GlassCard>
                  </StaggerItem>
                ))}
              </StaggerGroup>

              <GlassCard
                className="p-6 mt-6 bg-gradient-to-br from-[#006172] to-[#2a7a8c] text-white border-0"
                tilt={false}
              >
                <span className="material-symbols-outlined text-3xl mb-3">
                  smart_toy
                </span>
                <h3 className="text-xl font-extrabold mb-2">
                  PreOpPal AI Companion
                </h3>
                <p className="text-sm text-white/80 leading-relaxed">
                  24/7 — answers about fasting, meds, and what to expect on
                  surgery day. Always learning, always with you.
                </p>
                <button className="mt-4 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-colors">
                  Open chat
                </button>
              </GlassCard>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </PageShell>
  );
}
