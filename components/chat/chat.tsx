"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import type { AirchatUIMessage } from "@/lib/ai/tools";
import { SceneRenderer } from "./scene-renderer";
import { SceneActionsContext } from "./scene-context";
import { Composer } from "./composer";
import { SceneSkeleton } from "@/components/blocks/scene-skeleton";
import { Sparkles, RotateCcw } from "lucide-react";

const SUGGESTIONS = [
  { emoji: "🍣", label: "Best sushi for date night", prompt: "The best sushi spots for a date night tomorrow" },
  { emoji: "🍪", label: "Bake a recipe", prompt: "Give me an extra-chewy chocolate chip cookie recipe" },
  { emoji: "🚗", label: "Compare EVs", prompt: "I like the Lucid Air. How does it compare to other EVs?" },
  { emoji: "🎬", label: "Find a movie", prompt: "Recommend me an uplifting movie for tonight" },
];

function UserPromptBar({ message }: { message: AirchatUIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  if (!text) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-20 w-full border-b border-border/50 bg-background/85 backdrop-blur-md"
    >
      <p className="mx-auto w-full max-w-2xl truncate px-6 py-3.5 pr-16 text-[15px] font-medium text-foreground">
        {text}
      </p>
    </motion.div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 pb-40 text-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
          <Sparkles className="size-7" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          airchat
        </h1>
        <p className="max-w-xs text-balance text-muted-foreground">
          AI with a visual interface. Ask anything — the answer is a whole new
          screen.
        </p>
      </div>
      <div className="flex max-w-md flex-wrap items-center justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <motion.button
            key={s.label}
            whileTap={{ scale: 0.96 }}
            onClick={() => onPick(s.prompt)}
            className="flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_-8px_rgba(0,0,0,0.12)] ring-1 ring-border/60 transition-shadow hover:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_10px_24px_-8px_rgba(0,0,0,0.18)]"
          >
            <span aria-hidden>{s.emoji}</span>
            {s.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function ErrorScene({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex w-full max-w-2xl flex-col items-start gap-4 px-6 py-16"
    >
      <span className="text-4xl" aria-hidden>
        🪫
      </span>
      <p className="text-xl font-semibold leading-snug text-foreground">
        That one didn&apos;t make it through.
      </p>
      <p className="text-sm text-muted-foreground">
        The AI service may be rate-limited or briefly unavailable. Give it a
        moment and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform active:scale-95"
      >
        <RotateCcw className="size-4" aria-hidden />
        Try again
      </button>
    </motion.div>
  );
}

export function Chat() {
  const { messages, sendMessage, status, stop, error, regenerate } =
    useChat<AirchatUIMessage>({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

  const busy = status === "submitted" || status === "streaming";
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolledId = useRef<string | null>(null);

  // When a new user turn starts, glide the viewport so the new scene takes over.
  const lastUserId = messages.findLast((m) => m.role === "user")?.id;
  useEffect(() => {
    if (!lastUserId || lastScrolledId.current === lastUserId) return;
    lastScrolledId.current = lastUserId;
    requestAnimationFrame(() => {
      const turnElements =
        containerRef.current?.querySelectorAll("[data-turn]");
      turnElements?.[turnElements.length - 1]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [lastUserId]);

  const turns: { user?: AirchatUIMessage; assistant?: AirchatUIMessage }[] =
    [];
  for (const message of messages) {
    if (message.role === "user") {
      turns.push({ user: message });
    } else {
      const current = turns.at(-1);
      if (current && !current.assistant) current.assistant = message;
      else turns.push({ assistant: message });
    }
  }

  return (
    <MotionConfig reducedMotion="user">
    <SceneActionsContext.Provider
      value={{
        ask: (text) => {
          if (!busy) sendMessage({ text });
        },
      }}
    >
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {messages.length === 0 && (
          <EmptyState onPick={(prompt) => sendMessage({ text: prompt })} />
        )}
      </AnimatePresence>

      {turns.map((turn, i) => {
        const isLast = i === turns.length - 1;
        return (
          <div
            key={turn.user?.id ?? turn.assistant?.id ?? i}
            data-turn
            className="border-b border-border/40 last:border-b-0"
          >
            {turn.user && <UserPromptBar message={turn.user} />}
            {isLast && error && !busy ? (
              <ErrorScene onRetry={() => regenerate()} />
            ) : turn.assistant ? (
              <SceneRenderer message={turn.assistant} />
            ) : (
              isLast && busy && (
                <div className="min-h-[calc(100dvh-8rem)]">
                  <SceneSkeleton />
                </div>
              )
            )}
          </div>
        );
      })}

      <Composer
        busy={busy}
        onStop={stop}
        onSend={(text) => sendMessage({ text })}
      />
    </div>
    </SceneActionsContext.Provider>
    </MotionConfig>
  );
}
