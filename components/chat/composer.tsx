"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowUp, Square, Plus, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/blocks/scene-shell";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function Composer({
  onSend,
  onStop,
  busy,
  centered = false,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
  /** Landing state: float the bar mid-screen; it glides down when the
   *  conversation starts. */
  centered?: boolean;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    onSend(trimmed);
    setText("");
    inputRef.current?.focus();
  };

  return (
    // The same fixed element serves both states: raised to mid-screen on
    // the landing page, docked at the bottom in conversation. Animating
    // one transform makes the first send read as the bar gliding down.
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-20 transition-transform duration-500 ease-out-strong motion-reduce:transition-none",
        centered && "-translate-y-[calc(52dvh-3rem)]"
      )}
    >
      {/* Scrim so scenes fade out behind the bar */}
      <div
        className={cn(
          "absolute inset-0 -top-10 bg-gradient-to-t from-background/70 via-background/35 to-transparent transition-opacity duration-300",
          centered && "opacity-0"
        )}
      />

      {/* One unified pill: + on the left, input, then mic + primary
          action on the right - everything lives inside the bar. Slightly
          narrower while centered on the landing; grows as it docks. */}
      <div
        className={cn(
          "pointer-events-auto relative mx-auto w-full px-4 pb-5 pt-2 transition-[max-width] duration-500 ease-out-strong motion-reduce:transition-none",
          centered ? "max-w-xl" : "max-w-2xl"
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="glass flex items-center gap-1 rounded-full py-2 pl-2 pr-2 transition-shadow focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.08),0_12px_28px_-8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.55)] focus-within:ring-1 focus-within:ring-ring/30 dark:focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_12px_28px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]"
        >
          <Tooltip>
            <TooltipTrigger
              render={
                // aria-disabled (not disabled) so hover events still fire
                // for the tooltip; the button has no click handler anyway.
                <button
                  type="button"
                  aria-disabled="true"
                  aria-label="Attachments (coming soon)"
                  className="flex size-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-foreground/5 dark:hover:bg-white/10"
                >
                  <Plus className="size-5" />
                </button>
              }
            />
            <TooltipContent side="top">
              Attachments - coming soon
            </TooltipContent>
          </Tooltip>

          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask anything…"
            autoFocus
            maxLength={2000}
            className="h-9 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />

          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-disabled="true"
                  aria-label="Voice input (coming soon)"
                  className="flex size-9 shrink-0 cursor-not-allowed items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-foreground/5 dark:hover:bg-white/10"
                >
                  <Mic className="size-5" />
                </button>
              }
            />
            <TooltipContent side="top">Voice - coming soon</TooltipContent>
          </Tooltip>

          {busy ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <motion.button
                    type="button"
                    onClick={onStop}
                    aria-label="Stop generating"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2, ease: EASE_OUT }}
                    whileTap={{ scale: 0.95 }}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                  >
                    <Square className="size-3.5 fill-background" />
                  </motion.button>
                }
              />
              <TooltipContent side="top">Stop</TooltipContent>
            </Tooltip>
          ) : (
            <motion.button
              type="submit"
              aria-label="Send"
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
              disabled={!text.trim()}
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-200",
                text.trim()
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground/50"
              )}
            >
              <ArrowUp className="size-4.5" strokeWidth={2.5} />
            </motion.button>
          )}
        </form>
      </div>
    </div>
  );
}
