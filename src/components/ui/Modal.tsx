"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="relative z-10 w-full max-w-2xl rounded-3xl glass-card-strong shadow-glass-lg overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                {icon && (
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#88d1e5] to-[#006172] text-white flex items-center justify-center shadow-md shrink-0">
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                )}
                <div className="flex-1">
                  <h2
                    id="modal-title"
                    className="text-2xl font-extrabold text-on-surface"
                  >
                    {title}
                  </h2>
                  {description && (
                    <p className="text-sm text-on-surface-variant mt-1">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="h-9 w-9 rounded-xl bg-white/60 hover:bg-white text-on-surface-variant flex items-center justify-center transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>
              <div className="mt-6">{children}</div>
            </div>
            {footer && (
              <div className="border-t border-white/60 bg-white/40 px-6 md:px-8 py-4 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
