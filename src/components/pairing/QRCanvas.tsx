"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

type Props = {
  value: string;
  size?: number;
  /** Foreground color */
  fg?: string;
  /** Background color */
  bg?: string;
};

/**
 * Renders a QR code to a canvas with PreOpPal brand colors. The center is
 * left empty for a logo overlay (rendered by the parent on top).
 */
export default function QRCanvas({
  value,
  size = 240,
  fg = "#003844",
  bg = "#ffffff",
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, value, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: size,
      color: { dark: fg, light: bg },
    }).catch(() => {
      // ignore — canvas just stays blank
    });
  }, [value, size, fg, bg]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      className="rounded-xl"
      style={{ width: size, height: size }}
    />
  );
}
