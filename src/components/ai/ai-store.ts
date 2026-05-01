"use client";

import { useEffect, useState } from "react";

export type AIMessage = {
  id: string;
  from: "user" | "ai";
  text: string;
  time: string;
};

export const SUGGESTIONS = [
  "What can I eat the night before?",
  "Should I be worried about anesthesia?",
  "Help me feel calmer right now.",
  "Walk me through my arrival timing.",
];

const SAMPLE_REPLIES: Record<string, string> = {
  "What can I eat the night before?":
    "Light, easily digestible food up to 8 hours before — soups, plain rice, lean protein. Then clear liquids only until midnight, and nothing by mouth after that. Your fasting window will be on your timeline closer to the day.",
  "Should I be worried about anesthesia?":
    "It's completely normal to feel nervous. Modern anesthesia for your procedure is highly controlled — your anesthesiologist will visit you pre-op, walk through your medication history, and monitor you continuously. I can also queue up a paced-breathing session if you'd like.",
  "Help me feel calmer right now.":
    "Let's do a 60-second box breath together. Inhale 4… hold 4… exhale 4… hold 4. Try the orb on your dashboard — I'll stay here while you breathe.",
  "Walk me through my arrival timing.":
    "On surgery morning you'll wake at 5:30, arrive at the hospital by 6:00, check in by 6:15, and meet your care team by 7:30. Your full minute-by-minute plan is on the Arrival Guide.",
};

const FALLBACK_REPLIES = [
  "That's a great question. The short answer is yes — and I've added more detail to your Timeline so it's there when you need it.",
  "Totally understandable. Let me check your plan… everything Dr. Chen ordered is consistent with what you're describing.",
  "I can help with that. Try opening your Timeline — the steps surface in order, so you only see what matters today.",
  "Good instinct to ask. I've flagged it for your care team so they can confirm at your next check-in.",
];

let listeners: Set<() => void> = new Set();
let state = {
  open: false,
  messages: [
    {
      id: "seed",
      from: "ai",
      text: "Hi — I'm Pal, your AI companion. I can answer questions about your procedure, fasting, medications, what to expect, and help you breathe through anxiety. What's on your mind?",
      time: nowTime(),
    },
  ] as AIMessage[],
  typing: false,
};

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function notify() {
  listeners.forEach((l) => l());
}

export function useAI() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return {
    open: state.open,
    messages: state.messages,
    typing: state.typing,
    setOpen: (o: boolean) => {
      state = { ...state, open: o };
      notify();
    },
    toggle: () => {
      state = { ...state, open: !state.open };
      notify();
    },
    send: (text: string) => {
      const t = text.trim();
      if (!t) return;
      const userMsg: AIMessage = {
        id: `u-${Date.now()}`,
        from: "user",
        text: t,
        time: nowTime(),
      };
      state = {
        ...state,
        messages: [...state.messages, userMsg],
        typing: true,
      };
      notify();
      setTimeout(
        () => {
          const reply =
            SAMPLE_REPLIES[t] ??
            FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
          const aiMsg: AIMessage = {
            id: `a-${Date.now()}`,
            from: "ai",
            text: reply,
            time: nowTime(),
          };
          state = {
            ...state,
            messages: [...state.messages, aiMsg],
            typing: false,
          };
          notify();
        },
        900 + Math.random() * 700
      );
    },
  };
}
