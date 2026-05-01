"use client";

import { useEffect, useState } from "react";
import type { PalProfileContext } from "@/lib/pal-prompt";

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

let listeners: Set<() => void> = new Set();
let abortCtrl: AbortController | null = null;

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

function setState(patch: Partial<typeof state>) {
  state = { ...state, ...patch };
  notify();
}

function patchMessage(id: string, patch: Partial<AIMessage>) {
  state = {
    ...state,
    messages: state.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  };
  notify();
}

async function streamReply(profile: PalProfileContext) {
  // Build the messages payload from non-seed history.
  const history = state.messages
    .filter((m) => m.id !== "seed")
    .map((m) => ({
      role: m.from === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

  const placeholderId = `a-${Date.now()}`;
  state = {
    ...state,
    typing: true,
    messages: [
      ...state.messages,
      { id: placeholderId, from: "ai", text: "", time: nowTime() },
    ],
  };
  notify();

  abortCtrl?.abort();
  abortCtrl = new AbortController();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history, profile }),
      signal: abortCtrl.signal,
    });

    if (!res.ok || !res.body) {
      const errBody = await res
        .json()
        .catch(() => ({ error: "Pal couldn't reach the model." }));
      patchMessage(placeholderId, {
        text:
          errBody.error ??
          "Pal couldn't reach the model right now. Check your connection and try again.",
      });
      setState({ typing: false });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      patchMessage(placeholderId, { text: acc });
    }
    // Flush any remaining bytes from the decoder (multi-byte tail).
    acc += decoder.decode();
    patchMessage(placeholderId, { text: acc });
    setState({ typing: false });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    patchMessage(placeholderId, {
      text:
        "I hit a snag reaching the model. Please try again in a moment — and if this keeps happening, your care team is one tap away on the Care page.",
    });
    setState({ typing: false });
  }
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
    setOpen: (o: boolean) => setState({ open: o }),
    toggle: () => setState({ open: !state.open }),
    send: (text: string, profile: PalProfileContext) => {
      const t = text.trim();
      if (!t) return;
      const userMsg: AIMessage = {
        id: `u-${Date.now()}`,
        from: "user",
        text: t,
        time: nowTime(),
      };
      state = { ...state, messages: [...state.messages, userMsg] };
      notify();
      void streamReply(profile);
    },
  };
}
