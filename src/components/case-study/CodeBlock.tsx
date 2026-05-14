"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  language?: string;
  filename?: string;
  children: string;
};

/**
 * Minimal code card — no syntax highlighter, just brand-colored monospace
 * with a copy button. Looks more honest than over-tokenized rainbows.
 */
export default function CodeBlock({ language = "tsx", filename, children }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/10"
      style={{
        background:
          "linear-gradient(140deg, #0a232b 0%, #061b22 60%, #03131a 100%)",
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.45)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          {filename && (
            <span className="ml-3 text-[11px] font-mono text-white/55">
              {filename}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#88d1e5]/60">
            {language}
          </span>
          <button
            onClick={copy}
            aria-label="Copy code"
            className="text-white/60 hover:text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <motion.span
              key={copied ? "ok" : "copy"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="material-symbols-outlined text-[14px]"
            >
              {copied ? "check" : "content_copy"}
            </motion.span>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="px-4 py-4 text-[12.5px] leading-relaxed text-[#cde6ee] overflow-x-auto font-mono">
        <code>{children}</code>
      </pre>
    </div>
  );
}
