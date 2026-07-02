"use client";

import { useRef } from "react";
import { useSceneActions } from "@/components/chat/scene-context";
import { cn } from "@/lib/utils";

/** Hover dwell before we treat pointer presence as tap intent. */
const INTENT_DWELL_MS = 120;

/**
 * Intent handlers for a tappable element: after a short hover dwell (or
 * immediately on touch/keyboard focus) we speculatively prefetch the next
 * turn so the actual tap feels fast.
 */
export function useAskIntent(ask?: string) {
  const { prefetch } = useSceneActions();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  if (!ask) return {};
  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => prefetch(ask), INTENT_DWELL_MS);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return {
    onPointerEnter: start,
    onPointerLeave: cancel,
    onTouchStart: () => prefetch(ask),
    onFocus: () => prefetch(ask),
  };
}

/**
 * The design system's one drill-down primitive. Wrap any block in a scene
 * with <Tappable ask={item.ask}> and tapping it sends that follow-up prompt
 * as the next turn. The `ask` string is authored by the model (see the
 * shared `ask` field in lib/ai/tools.ts), so scenes never invent
 * per-domain prompt strings. Hover/touch intent triggers a speculative
 * prefetch of the answer.
 *
 * Renders a plain <div> while `ask` is still streaming in, so layouts are
 * stable during streaming.
 */
export function Tappable({
  ask,
  className,
  children,
}: {
  ask?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const actions = useSceneActions();
  const intent = useAskIntent(ask);
  if (!ask) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      onClick={() => actions.ask(ask)}
      {...intent}
      className={cn("group cursor-pointer text-left", className)}
    >
      {children}
    </button>
  );
}
