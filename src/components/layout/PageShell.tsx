"use client";

import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopAppBar from "./TopAppBar";
import BottomNavBar from "./BottomNavBar";
import FAB from "./FAB";
import { useViewMode } from "@/lib/view-mode-context";

type Props = {
  children: ReactNode;
  /** Skip the in-app chrome (sidebar / top app bar / bottom nav). FAB still renders. */
  bare?: boolean;
};

export default function PageShell({ children, bare = false }: Props) {
  const { isEmbed } = useViewMode();
  return (
    <div className="min-h-screen">
      {!bare && (
        <>
          <Sidebar />
          <TopAppBar />
          <BottomNavBar />
        </>
      )}
      <FAB />
      <main
        className={
          bare
            ? "min-h-screen"
            : isEmbed
              ? "min-h-screen pt-[100px] pb-28 px-4"
              : "min-h-screen lg:ml-64 pt-20 pb-32 lg:pb-16 px-5 md:px-8 lg:px-10"
        }
      >
        {children}
      </main>
    </div>
  );
}
