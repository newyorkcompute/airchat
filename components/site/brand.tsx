"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function Brand({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <motion.button
            type="button"
            aria-label="airchat — start a new chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            className="fixed left-3 top-2 z-30 flex h-9 items-center gap-2"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background">
              <Sparkles className="size-4" aria-hidden />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight text-foreground lg:block">
              airchat
            </span>
          </motion.button>
        }
      />
      <TooltipContent side="bottom">New chat</TooltipContent>
    </Tooltip>
  );
}
