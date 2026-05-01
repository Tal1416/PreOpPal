"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const ITEMS = [
  { to: "/dashboard", icon: "dashboard", label: "Home" },
  { to: "/timeline", icon: "timeline", label: "Timeline" },
  { to: "/me", icon: "account_circle", label: "Me" },
  { to: "/medications", icon: "medication", label: "Meds" },
  { to: "/care", icon: "groups", label: "Care" },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex justify-around items-center px-4 pt-3 pb-6 bg-white/85 backdrop-blur-2xl rounded-t-[32px] shadow-[0_-10px_40px_rgba(42,122,140,0.08)] border-t border-white/40">
      {ITEMS.map((item) => {
        const isActive = pathname === item.to;
        return (
          <Link key={item.to} href={item.to}>
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-colors ${
                isActive ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="bottom-active"
                  className="absolute inset-0 rounded-2xl bg-primary-fixed/40 -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span className="text-[11px] font-medium mt-1">{item.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
