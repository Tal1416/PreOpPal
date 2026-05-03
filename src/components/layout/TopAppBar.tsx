"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/lib/profile-context";
import { useViewMode } from "@/lib/view-mode-context";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/me": "My Profile",
  "/timeline": "Preparation Timeline",
  "/medications": "Medication Plan",
  "/bag": "Hospital Bag",
  "/care": "Care Support",
  "/arrival": "Arrival Guide",
};

export default function TopAppBar() {
  const pathname = usePathname();
  const title = TITLES[pathname];
  const { profile } = useProfile();
  const { isEmbed } = useViewMode();
  const mobileTitle = title ?? "PreOpPal";

  return (
    <header
      className={`fixed top-0 left-0 lg:left-64 right-0 z-30 flex items-center justify-between px-4 lg:px-8 bg-white/80 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_32px_0_rgba(42,122,140,0.04)] ${
        isEmbed
          ? "h-[88px] pt-[44px] pb-2"
          : "h-16"
      }`}
    >
      {isEmbed ? (
        <div className="flex w-full items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white">
              <img
                src={profile.avatar}
                alt={profile.firstName}
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
          <span className="text-[15px] font-extrabold tracking-tight text-on-surface truncate">
            {mobileTitle}
          </span>
          <button
            aria-label="Notifications"
            className="relative p-2 rounded-full hover:bg-white/40 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-primary text-[22px]">
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error animate-pulse-error" />
          </button>
        </div>
      ) : (
        <>
          <Link href="/" className="flex items-center gap-3 lg:hidden">
            <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white">
              <img
                src={profile.avatar}
                alt={profile.firstName}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-lg font-extrabold tracking-tighter gradient-text-static">
              PreOpPal
            </span>
          </Link>

      <div className="hidden lg:flex items-center gap-2 text-sm">
        {title ? (
          <>
            <span className="font-bold text-primary">{title}</span>
            <span className="text-on-surface-variant/40 mx-2">/</span>
            <span className="text-on-surface-variant">{profile.procedure}</span>
          </>
        ) : (
          <span className="font-bold text-primary">Welcome back</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-white/40 transition-colors active:scale-95">
          <span className="material-symbols-outlined text-primary">
            notifications
          </span>
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error animate-pulse-error" />
        </button>
        <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/60">
          <div className="text-right">
            <p className="text-xs font-bold leading-none">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-[10px] text-primary font-medium mt-0.5">
              T-{profile.daysToSurgery} days
            </p>
          </div>
          <img
            src={profile.avatar}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
          />
        </div>
      </div>
        </>
      )}
    </header>
  );
}
