"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Strong ease-out for enter/exit motion (mirrors --ease-out-strong in
 * globals.css). Built-in "easeOut" is too weak to feel intentional.
 */
export const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * Full-bleed scene container. Each assistant turn renders one of these:
 * it fills (at least) the viewport and rises into place.
 *
 * Animates the full `transform` string (not x/y/scale shorthands) so
 * Motion can hand it to WAAPI - scenes enter while the response is
 * still streaming, so the main thread is busy.
 */
export function SceneShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      // Opacity only - a transform on this wrapper would break
      // `position: sticky` for any descendant that needs it.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className={cn(
        "relative flex min-h-[calc(100dvh-1rem)] w-full flex-col pb-36",
        className
      )}
    >
      {children}
    </motion.section>
  );
}

/** Model's conversational one-liner, displayed large at the top of a scene. */
export function SceneIntro({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <motion.p
      initial={{ opacity: 0, transform: "translateY(12px)" }}
      animate={{ opacity: 1, transform: "translateY(0px)" }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
      className="mx-auto w-full max-w-2xl px-6 pt-10 pb-2 text-left text-2xl font-semibold leading-snug tracking-tight text-foreground"
    >
      {text}
    </motion.p>
  );
}

/** Full-width band inside a scene; alternate `tone` for visual rhythm. */
export function SceneBand({
  children,
  tone = "plain",
  className,
}: {
  children: React.ReactNode;
  tone?: "plain" | "muted";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full py-10",
        tone === "muted" && "bg-muted/60",
        className
      )}
    >
      <div className="mx-auto w-full max-w-2xl px-6">{children}</div>
    </div>
  );
}

/** Staggered reveal for lists of blocks inside a scene. */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shorthand `y` (not a full transform string) so it composes with the
// hover/tap scale gestures on interactive rows.
export const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

export function StaggerItem({
  children,
  className,
  onClick,
  role,
  onPointerEnter,
  onPointerLeave,
  onTouchStart,
  onFocus,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onTouchStart?: () => void;
  onFocus?: () => void;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      onClick={onClick}
      role={role}
      // Motion sets an inline `transform` on this element, which overrides
      // any CSS hover/active scale - so interactive rows get their
      // feedback through gestures instead. Motion's hover gesture already
      // ignores touch-emulated hover.
      whileHover={onClick ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={
        onClick ? { duration: 0.15, ease: EASE_OUT } : undefined
      }
      tabIndex={onClick ? 0 : undefined}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onTouchStart={onTouchStart}
      onFocus={onFocus}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
