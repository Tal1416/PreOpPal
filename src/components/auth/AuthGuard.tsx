"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      const next = encodeURIComponent(pathname || "/me");
      router.replace(`/login?next=${next}`);
    }
  }, [hydrated, isAuthenticated, pathname, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant text-sm font-semibold">
          <span className="material-symbols-outlined animate-spin text-primary">
            progress_activity
          </span>
          Checking your session…
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
