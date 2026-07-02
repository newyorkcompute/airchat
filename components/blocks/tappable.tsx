"use client";

import { useSceneActions } from "@/components/chat/scene-context";
import { cn } from "@/lib/utils";

/**
 * The design system's one drill-down primitive. Wrap any block in a scene
 * with <Tappable ask={item.ask}> and tapping it sends that follow-up prompt
 * as the next turn. The `ask` string is authored by the model (see the
 * shared `ask` field in lib/ai/tools.ts), so scenes never invent
 * per-domain prompt strings.
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
  if (!ask) return <div className={className}>{children}</div>;
  return (
    <button
      type="button"
      onClick={() => actions.ask(ask)}
      className={cn("group cursor-pointer text-left", className)}
    >
      {children}
    </button>
  );
}
