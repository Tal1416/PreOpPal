"use client";

/**
 * Shimmer skeleton placeholder.
 *
 * Use this while waiting for profile / medications / checklist data to hydrate
 * from Supabase. Stops the dreaded "Alex" flash where the seed profile is
 * visible for ~200ms before the real fetch lands.
 *
 * The shimmer animation is defined in tailwind.config.ts (`animate-shimmer`).
 */
export function Skeleton({
  className = "",
  rounded = "rounded-xl",
}: {
  className?: string;
  /** Override the default border radius — pass any Tailwind rounded-* class. */
  rounded?: string;
}) {
  return (
    <span
      aria-hidden
      className={`block ${rounded} bg-[linear-gradient(110deg,rgba(255,255,255,0.55)_8%,rgba(136,209,229,0.25)_18%,rgba(255,255,255,0.55)_33%)] bg-[length:200%_100%] animate-shimmer ${className}`}
    />
  );
}

/** Single-line text skeleton. `widthClass` controls the bar width (default w-32). */
export function SkeletonText({
  widthClass = "w-32",
  heightClass = "h-4",
  className = "",
}: {
  widthClass?: string;
  heightClass?: string;
  className?: string;
}) {
  return (
    <Skeleton
      rounded="rounded-md"
      className={`${heightClass} ${widthClass} ${className}`}
    />
  );
}

/** Circular skeleton (avatar). */
export function SkeletonAvatar({
  sizeClass = "h-10 w-10",
}: {
  sizeClass?: string;
}) {
  return <Skeleton rounded="rounded-full" className={sizeClass} />;
}
