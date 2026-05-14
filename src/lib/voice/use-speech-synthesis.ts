"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Sentence-buffered TTS. Pass incrementally streamed text via `enqueue` and the
 * hook will speak complete sentences as they arrive, without chopping mid-word.
 *
 * Strategy:
 * - Buffer text. Split on /[.!?…]\s+/ for complete sentences; queue each.
 * - `flush()` speaks whatever's left when the stream ends.
 * - `cancel()` stops mid-utterance and clears the queue.
 *
 * Voice picking: prefer en-US, prefer non-novelty voices, prefer "Samantha"
 * (iOS) or "Google US English" (Android/Chrome). Fallback to default voice.
 */

const PREFERRED_NAMES = [
  "Samantha",
  "Google US English",
  "Microsoft Aria Online",
  "Microsoft Jenny Online",
  "Karen",
  "Moira",
];

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  for (const name of PREFERRED_NAMES) {
    const v = voices.find((x) => x.name === name);
    if (v) return v;
  }
  return (
    voices.find((v) => v.lang === "en-US" && v.localService) ||
    voices.find((v) => v.lang.startsWith("en")) ||
    voices[0]
  );
}

export type SpeechSynthesisHook = {
  supported: boolean;
  speaking: boolean;
  voice: SpeechSynthesisVoice | null;
  /** Append streamed text. Will speak complete sentences as they appear. */
  enqueue: (chunk: string) => void;
  /** Speak everything that's still buffered (call when stream ends). */
  flush: () => void;
  /** Stop immediately and clear the queue. */
  cancel: () => void;
  /** Speak a one-shot string (cancels current queue). */
  say: (text: string) => void;
};

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  const bufferRef = useRef<string>("");
  const queueRef = useRef<string[]>([]);
  const playingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);

    const loadVoices = () => {
      const list = window.speechSynthesis.getVoices();
      const picked = pickVoice(list);
      if (picked) setVoice(picked);
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    };
  }, []);

  const speakNext = useCallback(() => {
    if (playingRef.current) return;
    const next = queueRef.current.shift();
    if (!next || !next.trim()) {
      playingRef.current = false;
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(next);
    if (voice) utter.voice = voice;
    utter.rate = 1.02;
    utter.pitch = 1.0;
    utter.volume = 1.0;
    utter.onstart = () => {
      playingRef.current = true;
      setSpeaking(true);
    };
    utter.onend = () => {
      playingRef.current = false;
      if (queueRef.current.length > 0) {
        speakNext();
      } else {
        setSpeaking(false);
      }
    };
    utter.onerror = () => {
      playingRef.current = false;
      setSpeaking(false);
    };
    try {
      window.speechSynthesis.speak(utter);
    } catch {
      playingRef.current = false;
      setSpeaking(false);
    }
  }, [voice]);

  const enqueue = useCallback(
    (chunk: string) => {
      if (!chunk) return;
      bufferRef.current += chunk;
      // Drain complete sentences from the buffer.
      const SENTENCE = /([^.!?…]+[.!?…]+)(\s+|$)/g;
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
    },
    [speakNext],
  );

  const flush = useCallback(() => {
    const tail = bufferRef.current.trim();
    bufferRef.current = "";
    if (tail) queueRef.current.push(tail);
    if (queueRef.current.length && !playingRef.current) speakNext();
  }, [speakNext]);

  const cancel = useCallback(() => {
    bufferRef.current = "";
    queueRef.current = [];
    playingRef.current = false;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
    setSpeaking(false);
  }, []);

  const say = useCallback(
    (text: string) => {
      cancel();
      enqueue(text);
      flush();
    },
    [cancel, enqueue, flush],
  );

  return { supported, speaking, voice, enqueue, flush, cancel, say };
}
