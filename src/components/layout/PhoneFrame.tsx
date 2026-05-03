"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const BEZEL = 12;

export default function PhoneFrame() {
  const pathname = usePathname();
  const [src] = useState(() => {
    const path = pathname || "/";
    return `${path}?embed=1`;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function fit() {
      const margin = 80;
      const availH = window.innerHeight - margin;
      const availW = window.innerWidth - 32;
      const totalH = PHONE_HEIGHT + BEZEL * 2;
      const totalW = PHONE_WIDTH + BEZEL * 2;
      const s = Math.min(1, availH / totalH, availW / totalW);
      setScale(s);
    }
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-30 flex items-center justify-center overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        {/* Phone body / bezel */}
        <div
          className="relative bg-neutral-900 rounded-[58px] p-[12px]"
          style={{
            width: PHONE_WIDTH + BEZEL * 2,
            height: PHONE_HEIGHT + BEZEL * 2,
            boxShadow:
              "0 60px 120px -20px rgba(0,0,0,0.55), 0 30px 60px -30px rgba(0,97,114,0.35), 0 0 0 1px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.15) inset",
          }}
        >
          {/* Side buttons */}
          <span
            aria-hidden
            className="absolute -left-[3px] top-[110px] h-[34px] w-[3px] rounded-l-md bg-neutral-800"
          />
          <span
            aria-hidden
            className="absolute -left-[3px] top-[170px] h-[64px] w-[3px] rounded-l-md bg-neutral-800"
          />
          <span
            aria-hidden
            className="absolute -left-[3px] top-[250px] h-[64px] w-[3px] rounded-l-md bg-neutral-800"
          />
          <span
            aria-hidden
            className="absolute -right-[3px] top-[200px] h-[100px] w-[3px] rounded-r-md bg-neutral-800"
          />

          {/* Screen */}
          <div
            className="relative overflow-hidden bg-white rounded-[46px]"
            style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT }}
          >
            {/* Dynamic island */}
            <div
              aria-hidden
              className="absolute top-[10px] left-1/2 -translate-x-1/2 z-20 h-[32px] w-[118px] rounded-full bg-black pointer-events-none"
            />

            <iframe
              src={src}
              title="PreOpPal mobile preview"
              className="block h-full w-full border-0 bg-transparent"
              allow="clipboard-write"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
