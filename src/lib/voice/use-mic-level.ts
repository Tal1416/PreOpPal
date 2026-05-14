"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a smoothed 0..1 audio level from the user's microphone while `active`.
 * Used to make Pal's orb visually react to your voice while you're talking.
 *
 * Browsers vary in noise floor; we apply EMA smoothing + a soft floor so the
 * orb still breathes at zero input instead of flatlining.
 */
export function useMicLevel(active: boolean): number {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const smoothRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    if (!active) return;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        type WindowWithWebkitAudio = Window & {
          webkitAudioContext?: typeof AudioContext;
        };
        const win = window as WindowWithWebkitAudio;
        const Ctx = window.AudioContext || win.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.85;
        src.connect(analyser);

        ctxRef.current = ctx;
        streamRef.current = stream;
        analyserRef.current = analyser;

        const buf = new Uint8Array(analyser.frequencyBinCount);
        const loop = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(buf);
          let sum = 0;
          for (let i = 0; i < buf.length; i++) sum += buf[i];
          const avg = sum / buf.length / 255; // 0..1
          // Emphasize speech band & smooth.
          const target = Math.min(1, avg * 1.8);
          smoothRef.current = smoothRef.current * 0.75 + target * 0.25;
          setLevel(smoothRef.current);
          rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
      } catch {
        // Permission denied or no mic — just stay at 0.
      }
    }

    void start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      analyserRef.current?.disconnect();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close().catch(() => undefined);
      analyserRef.current = null;
      streamRef.current = null;
      ctxRef.current = null;
      setLevel(0);
      smoothRef.current = 0;
    };
  }, [active]);

  return level;
}
