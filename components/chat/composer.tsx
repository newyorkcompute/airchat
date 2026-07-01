"use client";

import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowUp, Square, Plus, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function Composer({
  onSend,
  onStop,
  busy,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  busy: boolean;
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20">
      {/* Scrim so scenes fade out behind the bar */}
      <div className="absolute inset-0 -top-10 bg-gradient-to-t from-background via-background/80 to-transparent" />

      <div className="pointer-events-auto relative mx-auto flex w-full max-w-2xl items-center gap-3 px-4 pb-5 pt-2">
        <button
          type="button"
          disabled
          aria-label="Attachments (coming soon)"
          className="flex size-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-card text-muted-foreground/50 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.15)] ring-1 ring-border/60"
        >
          <Plus className="size-5" />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-1 items-center gap-1 rounded-full bg-card py-1.5 pl-5 pr-1.5 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_20px_-8px_rgba(0,0,0,0.15)] ring-1 ring-border/60 transition-shadow focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.1),0_12px_28px_-8px_rgba(0,0,0,0.22)] focus-within:ring-ring/40"
        >
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
            className="h-9 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          {busy ? (
            <motion.button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileTap={{ scale: 0.9 }}
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background"
            >
              <Square className="size-3.5 fill-background" />
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              aria-label="Send"
              whileTap={{ scale: 0.9 }}
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

        <button
          type="button"
          disabled
          aria-label="Voice input (coming soon)"
          className="flex size-11 shrink-0 cursor-not-allowed items-center justify-center rounded-full bg-foreground text-background/40 shadow-[0_1px_3px_rgba(0,0,0,0.15),0_8px_20px_-8px_rgba(0,0,0,0.3)]"
        >
          <Mic className="size-5" />
        </button>
      </div>
    </div>
  );
}
