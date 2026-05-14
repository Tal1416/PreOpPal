"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Thin wrapper around webkitSpeechRecognition / SpeechRecognition.
 *
 * Notes for the demo:
 * - Browser support is uneven. Safari iOS 14.5+ works; Chrome desktop & Android work.
 *   Firefox returns false on `supported`.
 * - We use single-utterance mode (continuous=false) and rely on `onend`
 *   to fire the auto-submit. Continuous mode is laggy and unreliable on iOS.
 */

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
  resultIndex: number;
};

type SpeechRecognitionErrorEventLike = { error: string };

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

function getCtor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  type W = Window & {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  const w = window as W;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export type SpeechRecognitionHook = {
  supported: boolean;
  listening: boolean;
  transcript: string;
  interim: string;
  error: string | null;
  start: () => void;
  stop: () => void;
  reset: () => void;
};

type Options = {
  lang?: string;
  /**
   * Called when the recognizer ends with a final transcript.
   * Useful for auto-submitting in voice mode.
   */
  onFinal?: (text: string) => void;
};

export function useSpeechRecognition({
  lang = "en-US",
  onFinal,
}: Options = {}): SpeechRecognitionHook {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalRef = useRef<string>("");
  const onFinalRef = useRef<typeof onFinal>(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    const Ctor = getCtor();
    setSupported(!!Ctor);
    if (!Ctor) return;

    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      finalRef.current = "";
      setTranscript("");
      setInterim("");
      setError(null);
      setListening(true);
    };
    rec.onresult = (e) => {
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0]?.transcript ?? "";
        if (r.isFinal) {
          finalRef.current += text;
        } else {
          interimText += text;
        }
      }
      setTranscript(finalRef.current);
      setInterim(interimText);
    };
    rec.onerror = (e) => {
      setError(e.error || "speech-error");
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      const finalText = finalRef.current.trim();
      if (finalText && onFinalRef.current) onFinalRef.current(finalText);
    };

    recRef.current = rec;
    return () => {
      rec.onstart = rec.onresult = rec.onerror = rec.onend = null;
      try {
        rec.abort();
      } catch {
        // ignore
      }
      recRef.current = null;
    };
  }, [lang]);

  const start = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.start();
    } catch {
      // already started — ignore
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try {
      rec.stop();
    } catch {
      // ignore
    }
  }, []);

  const reset = useCallback(() => {
    finalRef.current = "";
    setTranscript("");
    setInterim("");
    setError(null);
  }, []);

  return {
    supported,
    listening,
    transcript,
    interim,
    error,
    start,
    stop,
    reset,
  };
}
