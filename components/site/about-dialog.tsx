"use client";

import { Sparkles } from "lucide-react";
import { XLogo } from "@/components/site/twitter-link";
import { AUTHOR_X_URL, LAUNCH_TWEET_URL } from "@/lib/site-links";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const FEATURES = [
  {
    emoji: "🖼️",
    title: "Visual answers",
    text: "Every reply is a designed scene - cards, comparisons, recipes, guides.",
  },
  {
    emoji: "👆",
    title: "Tap to go deeper",
    text: "Anything on screen can be tapped to become your next question.",
  },
  {
    emoji: "💡",
    title: "Ask anything",
    text: "Compare products, plan a trip, find dinner, explore an idea.",
  },
  {
    emoji: "⌨️",
    title: "Keyboard today, voice soon",
    text: "Type for now - voice input is on the way.",
  },
];

export function AboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 rounded-3xl p-0 sm:max-w-md">
        <div className="flex flex-col items-center gap-3 px-6 pt-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-foreground text-background">
            <Sparkles className="size-6" aria-hidden />
          </span>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Airchat
          </DialogTitle>
          <DialogDescription className="max-w-xs text-balance text-sm leading-relaxed">
            A generative-UI chat app - every answer becomes a rich visual
            scene, not a wall of text.
          </DialogDescription>
        </div>

        <ul className="flex flex-col gap-1 px-4 py-5">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex items-start gap-3 rounded-xl px-2 py-2">
              <span className="mt-px text-lg leading-none" aria-hidden>
                {f.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2 rounded-b-3xl border-t border-border/60 bg-muted/40 px-6 py-4">
          <a
            href={LAUNCH_TWEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <XLogo className="size-3.5" />
            Launch thread
          </a>
          <a
            href={AUTHOR_X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            Siddharth Kulkarni
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
