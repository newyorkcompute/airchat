"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import type { AirchatUIMessage } from "@/lib/ai/tools";
import { prefetchAssistantMessage, makeUserMessage } from "@/lib/prefetch";
import { SceneRenderer } from "./scene-renderer";
import { SceneActionsContext } from "./scene-context";
import { Composer } from "./composer";
import { SceneSkeleton } from "@/components/blocks/scene-skeleton";
import { Brand } from "@/components/site/brand";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { TwitterLink } from "@/components/site/twitter-link";
import { Sparkles, RotateCcw, ArrowLeft, SquarePen } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const SUGGESTIONS = [
  { emoji: "🍣", label: "Best sushi for date night", prompt: "The best sushi spots for a date night tomorrow" },
  { emoji: "🍪", label: "Bake a recipe", prompt: "Give me an extra-chewy chocolate chip cookie recipe" },
  { emoji: "🚗", label: "Compare EVs", prompt: "I like the Lucid Air. How does it compare to other EVs?" },
  { emoji: "🎬", label: "Find a movie", prompt: "Recommend me an uplifting movie for tonight" },
];

function UserPromptBar({
  message,
  onBack,
}: {
  message: AirchatUIMessage;
  onBack?: () => void;
}) {
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
      <div className="mx-auto flex w-full max-w-2xl items-center gap-1.5 px-6 py-3.5 pr-16 max-lg:pr-36 max-md:pl-12">
        {onBack && (
          <Tooltip>
            <TooltipTrigger
              render={
                <motion.button
                  type="button"
                  aria-label="Back to previous scene"
                  whileTap={{ scale: 0.9 }}
                  onClick={onBack}
                  className="-ml-2 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ArrowLeft className="size-[18px]" aria-hidden />
                </motion.button>
              }
            />
            <TooltipContent side="bottom">Back to previous scene</TooltipContent>
          </Tooltip>
        )}
        <p className="min-w-0 flex-1 truncate text-[15px] font-medium text-foreground">
          {text}
        </p>
      </div>
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
      className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-2xl flex-col items-start gap-4 px-6 py-16"
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
  const { messages, sendMessage, setMessages, status, stop, error, regenerate } =
    useChat<AirchatUIMessage>({
      transport: new DefaultChatTransport({ api: "/api/chat" }),
    });

  const busy = status === "submitted" || status === "streaming";
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrolledKey = useRef<string | null>(null);
  const scrollAnim = useRef<ReturnType<typeof setInterval> | null>(null);

  // Native smooth scrolling (and rAF) silently stalls in throttled or
  // occluded tabs, so we drive the glide with a timer. Re-reading the
  // element position every tick keeps the target accurate while the
  // streaming scene grows above/below it.
  const glideToElement = (el: HTMLElement) => {
    const stopGlide = () => {
      if (scrollAnim.current !== null) clearInterval(scrollAnim.current);
      scrollAnim.current = null;
      window.removeEventListener("wheel", stopGlide);
      window.removeEventListener("touchmove", stopGlide);
    };
    stopGlide();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    const startY = window.scrollY;
    const startTime = performance.now();
    const duration = 700;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    // Let the user take over: any manual scroll input cancels the glide.
    window.addEventListener("wheel", stopGlide, { passive: true });
    window.addEventListener("touchmove", stopGlide, { passive: true });
    scrollAnim.current = setInterval(() => {
      const t = Math.min(1, (performance.now() - startTime) / duration);
      const targetY = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, startY + (targetY - startY) * ease(t));
      if (t >= 1) stopGlide();
    }, 16);
  };

  const glideToTurn = (index: number) => {
    const turnElements =
      containerRef.current?.querySelectorAll<HTMLElement>("[data-turn]");
    const el = turnElements?.[index];
    if (el) glideToElement(el);
  };

  // ---- Speculative next-turn prefetch -------------------------------------
  // Hovering/touching a tappable item starts generating its scene early;
  // if the user actually taps, we inject the (possibly already finished)
  // result instead of starting from zero. Keyed by the conversation head so
  // stale prefetches can never leak into a different context.
  const [injecting, setInjecting] = useState(false);
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  const prefetches = useRef(
    new Map<
      string,
      { promise: Promise<AirchatUIMessage>; controller: AbortController }
    >()
  );
  const MAX_PREFETCHES_PER_SCENE = 3;

  const clearPrefetches = () => {
    for (const { controller } of prefetches.current.values())
      controller.abort();
    prefetches.current.clear();
  };

  const prefetchKey = (text: string) =>
    `${messagesRef.current.at(-1)?.id ?? "root"}:${text}`;

  const prefetch = (text: string) => {
    if (busy || injecting) return;
    const key = prefetchKey(text);
    if (prefetches.current.has(key)) return;
    if (prefetches.current.size >= MAX_PREFETCHES_PER_SCENE) return;
    const controller = new AbortController();
    const promise = prefetchAssistantMessage(
      messagesRef.current,
      text,
      controller.signal
    );
    // Failed speculation just falls back to a normal turn on tap.
    promise.catch(() => prefetches.current.delete(key));
    prefetches.current.set(key, { promise, controller });
  };

  const ask = async (text: string) => {
    if (busy || injecting) return;
    const key = prefetchKey(text);
    const hit = prefetches.current.get(key);
    // Abort speculation for the paths not taken.
    for (const [k, entry] of prefetches.current) {
      if (entry !== hit) {
        entry.controller.abort();
        prefetches.current.delete(k);
      }
    }
    if (!hit) {
      sendMessage({ text });
      return;
    }
    const base = messagesRef.current;
    const userMessage = makeUserMessage(text);
    setInjecting(true);
    setMessages([...base, userMessage]);
    try {
      const assistantMessage = await hit.promise;
      setMessages([...base, userMessage, assistantMessage]);
    } catch {
      setMessages(base);
      sendMessage({ text });
    } finally {
      prefetches.current.delete(key);
      setInjecting(false);
    }
  };

  const startNewChat = () => {
    if (busy) stop();
    clearPrefetches();
    setMessages([]);
    lastScrolledKey.current = null;
    window.scrollTo(0, 0);
  };

  // Glide the viewport so the new scene takes over the screen and the
  // previous turn (with its prompt bar) scrolls fully out of view.
  // Fires twice per turn: once on send, and again when the assistant's
  // scene starts streaming in — the second pass corrects any shortfall
  // from scrolling while the page was still growing.
  const lastUserId = messages.findLast((m) => m.role === "user")?.id;
  const assistantStarted = messages.at(-1)?.role === "assistant";
  const scrollKey = lastUserId
    ? `${lastUserId}:${assistantStarted ? "scene" : "sent"}`
    : null;
  useEffect(() => {
    if (!scrollKey || lastScrolledKey.current === scrollKey) return;
    lastScrolledKey.current = scrollKey;
    // setTimeout instead of rAF: rAF stalls in occluded/background tabs.
    const timer = setTimeout(() => {
      const turnElements =
        containerRef.current?.querySelectorAll<HTMLElement>("[data-turn]");
      const last = turnElements?.[turnElements.length - 1];
      if (last) glideToElement(last);
    }, 30);
    return () => clearTimeout(timer);
  }, [scrollKey]);

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
    <SceneActionsContext.Provider value={{ ask, prefetch }}>
    <div ref={containerRef} className="relative">
      <AnimatePresence>
        {messages.length > 0 && <Brand key="brand" onClick={startNewChat} />}
      </AnimatePresence>

      <div className="fixed right-3 top-2 z-30 flex items-center gap-1">
        <TwitterLink />
        <span aria-hidden className="mx-1 h-4 w-px bg-border/60" />
        <AnimatePresence initial={false}>
          {messages.length > 0 && (
            <Tooltip key="new-chat">
              <TooltipTrigger
                render={
                  <motion.button
                    type="button"
                    aria-label="Start a new chat"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={startNewChat}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <SquarePen className="size-4.5" />
                  </motion.button>
                }
              />
              <TooltipContent side="bottom">New chat</TooltipContent>
            </Tooltip>
          )}
        </AnimatePresence>
        <ThemeToggle />
      </div>

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
            {turn.user && (
              <UserPromptBar
                message={turn.user}
                onBack={i > 0 ? () => glideToTurn(i - 1) : undefined}
              />
            )}
            {isLast && error && !busy ? (
              <ErrorScene onRetry={() => regenerate()} />
            ) : turn.assistant ? (
              <SceneRenderer message={turn.assistant} />
            ) : (
              isLast && (busy || injecting) && <SceneSkeleton />
            )}
          </div>
        );
      })}

      <Composer
        busy={busy || injecting}
        onStop={stop}
        onSend={(text) => {
          // A typed message invalidates any speculation for tap targets.
          clearPrefetches();
          sendMessage({ text });
        }}
      />
    </div>
    </SceneActionsContext.Provider>
    </MotionConfig>
  );
}
