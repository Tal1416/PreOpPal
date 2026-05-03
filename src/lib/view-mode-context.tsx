"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ViewMode = "web" | "phone";

type Ctx = {
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  toggle: () => void;
  isEmbed: boolean;
  hydrated: boolean;
};

const ViewModeContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "preoppal-view-mode";

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("web");
  const [isEmbed, setIsEmbed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inIframe =
      typeof window !== "undefined" && window.self !== window.top;
    const embed = params.get("embed") === "1" || inIframe;
    setIsEmbed(embed);
    if (!embed) {
      const queryView = params.get("view");
      if (queryView === "phone" || queryView === "web") {
        setModeState(queryView);
        try {
          localStorage.setItem(STORAGE_KEY, queryView);
        } catch {}
      } else {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === "phone" || stored === "web") {
          setModeState(stored);
        }
      }
    }
    setHydrated(true);
  }, []);

  const setMode = useCallback((m: ViewMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev) => {
      const next: ViewMode = prev === "web" ? "phone" : "web";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return (
    <ViewModeContext.Provider
      value={{ mode, setMode, toggle, isEmbed, hydrated }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used inside ViewModeProvider");
  return ctx;
}
