"use client";

import { useEffect, useState } from "react";
import type { PalProfileContext } from "@/lib/pal-prompt";
import {
  parsePalActions,
  stripPartialActions,
  type PalAction,
  type PalActionResult,
} from "@/lib/pal-actions";

export type AIMessage = {
  id: string;
  from: "user" | "ai";
  text: string;
  time: string;
  actions?: PalActionResult[];
};

export type PalActionExecutor = (action: PalAction) => PalActionResult;

export const SUGGESTIONS = [
  "What can I eat the night before?",
  "Should I be worried about anesthesia?",
  "Help me feel calmer right now.",
  "Walk me through my arrival timing.",
];

const VOICE_KEY = "preoppal-voice-mode";

let listeners: Set<() => void> = new Set();
/** Streaming chunk subscribers. Receive (messageId, deltaText, done). */
let chunkListeners: Set<(messageId: string, delta: string, done: boolean) => void> =
  new Set();
let abortCtrl: AbortController | null = null;

const seedMessage: AIMessage = {
  id: "seed",
  from: "ai",
  text: "Hi — I'm Pal, your AI companion. I can answer questions about your procedure, fasting, medications, what to expect, and help you breathe through anxiety. What's on your mind?",
  time: nowTime(),
};

let state = {
  open: false,
  voiceMode: false,
  voiceOverlay: false,
  messages: [seedMessage] as AIMessage[],
  typing: false,
};

// Once-per-login flag. The auth context calls hydratePalHistory after each
// successful sign-in and clearPalHistory on sign-out so we don't leak a
// previous user's chat into a fresh session.
let historyHydrated = false;

type PalMessageRow = {
  id: string;
  role: "user" | "ai";
  text: string;
  actions: unknown;
  created_at: string;
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return nowTime();
  }
}

export async function hydratePalHistory() {
  if (historyHydrated) return;
  historyHydrated = true;
  try {
    const res = await fetch("/api/chat", { cache: "no-store" });
    if (!res.ok) {
      historyHydrated = false;
      return;
    }
    const json = (await res.json()) as { messages?: PalMessageRow[] };
    const rows = json.messages ?? [];
    if (rows.length === 0) return;
    const restored: AIMessage[] = rows.map((r) => ({
      id: r.id,
      from: r.role,
      text: r.text,
      time: formatTime(r.created_at),
    }));
    state = { ...state, messages: [seedMessage, ...restored] };
    notify();
  } catch {
    historyHydrated = false;
  }
}

export function clearPalHistory() {
  historyHydrated = false;
  state = { ...state, messages: [seedMessage] };
  notify();
}

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

function notifyChunk(messageId: string, delta: string, done: boolean) {
  chunkListeners.forEach((l) => {
    try {
      l(messageId, delta, done);
    } catch {
      // ignore subscriber errors
    }
  });
}

async function streamReply(
  profile: PalProfileContext,
  executor?: PalActionExecutor
) {
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
      body: JSON.stringify({
        messages: history,
        profile,
        voiceMode: state.voiceMode,
      }),
      signal: abortCtrl.signal,
    });

    if (!res.ok || !res.body) {
      const errBody = await res
        .json()
        .catch(() => ({ error: "Pal couldn't reach the model." }));
      const msg =
        errBody.error ??
        "Pal couldn't reach the model right now. Check your connection and try again.";
      patchMessage(placeholderId, { text: msg });
      notifyChunk(placeholderId, msg, true);
      setState({ typing: false });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    let lastVisible = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      const visible = stripPartialActions(acc);
      const delta = visible.slice(lastVisible.length);
      lastVisible = visible;
      patchMessage(placeholderId, { text: visible });
      if (delta) notifyChunk(placeholderId, delta, false);
    }
    // Flush any remaining bytes from the decoder (multi-byte tail).
    acc += decoder.decode();
    const { strippedText, actions } = parsePalActions(acc);
    const finalDelta = strippedText.slice(lastVisible.length);
    const results: PalActionResult[] = executor
      ? actions.map((a) => executor(a))
      : [];
    patchMessage(placeholderId, {
      text: strippedText,
      actions: results.length > 0 ? results : undefined,
    });
    if (finalDelta) notifyChunk(placeholderId, finalDelta, false);
    notifyChunk(placeholderId, "", true);
    setState({ typing: false });
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    const msg =
      "I hit a snag reaching the model. Please try again in a moment — and if this keeps happening, your care team is one tap away on the Care page.";
    patchMessage(placeholderId, { text: msg });
    notifyChunk(placeholderId, msg, true);
    setState({ typing: false });
  }
}

/**
 * Subscribe to streaming chunks of the active AI reply. The callback receives
 * (messageId, deltaText, done). Use this to pipe live text into a TTS engine
 * without re-speaking earlier chunks.
 */
export function subscribeToStream(
  cb: (messageId: string, delta: string, done: boolean) => void,
): () => void {
  chunkListeners.add(cb);
  return () => {
    chunkListeners.delete(cb);
  };
}

export function useAI() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force((n) => n + 1);
    listeners.add(fn);
    // Hydrate voiceMode from localStorage once.
    if (!state.voiceMode) {
      try {
        const stored = localStorage.getItem(VOICE_KEY);
        if (stored === "1") {
          state = { ...state, voiceMode: true };
          notify();
        }
      } catch {
        // ignore
      }
    }
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return {
    open: state.open,
    messages: state.messages,
    typing: state.typing,
    voiceMode: state.voiceMode,
    voiceOverlay: state.voiceOverlay,
    setOpen: (o: boolean) => setState({ open: o }),
    toggle: () => setState({ open: !state.open }),
    setVoiceMode: (on: boolean) => {
      setState({ voiceMode: on, voiceOverlay: on ? state.voiceOverlay : false });
      try {
        localStorage.setItem(VOICE_KEY, on ? "1" : "0");
      } catch {
        // ignore
      }
    },
    setVoiceOverlay: (on: boolean) =>
      setState({ voiceOverlay: on, voiceMode: on ? true : state.voiceMode }),
    send: (
      text: string,
      profile: PalProfileContext,
      executor?: PalActionExecutor
    ) => {
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
      void streamReply(profile, executor);
    },
  };
}
