"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useProfile } from "@/lib/profile-context";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/me", icon: "account_circle", label: "My Profile" },
  { to: "/timeline", icon: "event_upcoming", label: "Timeline" },
  { to: "/medications", icon: "medication", label: "Medications" },
  { to: "/bag", icon: "work", label: "Hospital Bag" },
  { to: "/care", icon: "groups", label: "Care Support" },
  { to: "/arrival", icon: "local_hospital", label: "Arrival Guide" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile } = useProfile();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-white/40 bg-white/60 backdrop-blur-xl shadow-[4px_0_24px_rgba(42,122,140,0.06)]">
      <Link href="/" className="block p-8">
        <h1 className="text-2xl font-black tracking-tighter gradient-text-static">
          PreOpPal
        </h1>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant/60 mt-1">
          Clinical Sanctuary
        </p>
      </Link>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.to;
          return (
            <Link key={item.to} href={item.to}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`relative flex items-center gap-3 px-5 py-3.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary-fixed/40 text-primary"
                    : "text-on-surface-variant hover:bg-white/50 hover:text-primary"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#acedff] to-[#88d1e5]/50 -z-10"
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
                <span className="font-semibold text-sm">{item.label}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 border-t border-white/40">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/40 mb-3">
          <img
            src={profile.avatar}
            alt={profile.firstName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
          />
          <div className="min-w-0">
            <p className="text-xs font-bold text-on-surface truncate">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-[10px] text-primary font-medium">
              ID {profile.patientId} · {profile.procedure}
            </p>
          </div>
        </div>
        <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-sm hover:shadow-glow-teal transition-all">
          Contact Care Team
        </button>
      </div>
    </aside>
  );
}
