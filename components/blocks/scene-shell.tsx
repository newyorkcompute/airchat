"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Full-bleed scene container. Each assistant turn renders one of these:
 * it fills (at least) the viewport and animates in with a spring rise.
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
      initial={{ opacity: 0, y: 48, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 170, damping: 26, mass: 0.9 }}
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
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
        show: { transition: { staggerChildren: 0.07 } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
};

export function StaggerItem({
  children,
  className,
  onClick,
  role,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  role?: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      onClick={onClick}
      role={role}
      tabIndex={onClick ? 0 : undefined}
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
