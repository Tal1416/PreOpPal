"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, useScroll, useSpring } from "framer-motion";
import Lenis from "@studio-freight/lenis";

import GradientMesh from "@/components/ui/GradientMesh";
import PhoneFrame from "@/components/layout/PhoneFrame";
import ViewModeToggle from "@/components/layout/ViewModeToggle";
import { ProfileProvider } from "@/lib/profile-context";
import { ViewModeProvider, useViewMode } from "@/lib/view-mode-context";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0 0" }}
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-gradient-to-r from-[#88d1e5] via-[#2a7a8c] to-[#006172] pointer-events-none"
    />
  );
}

function ViewModeShell({ children }: { children: React.ReactNode }) {
  const { mode, isEmbed, hydrated } = useViewMode();
  const showPhone = hydrated && !isEmbed && mode === "phone";

  return (
    <>
      <ViewModeToggle />
      {showPhone ? <PhoneFrame /> : children}
    </>
  );
}

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <ProfileProvider>
      <ViewModeProvider>
        <GradientMesh />
        <ScrollProgress />
        <ViewModeShell>{children}</ViewModeShell>
      </ViewModeProvider>
    </ProfileProvider>
  );
}
