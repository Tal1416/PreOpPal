"use client";

import { motion } from "framer-motion";

/**
 * Next.js re-mounts a `template.tsx` on every navigation, so this is the right
 * place to play an enter animation when the route changes — without the
 * `AnimatePresence mode="wait"` race condition that can leave the next page
 * blank until refresh.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
