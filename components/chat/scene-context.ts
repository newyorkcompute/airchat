"use client";

import { createContext, useContext } from "react";

/**
 * Lets any element inside a scene start a new turn, e.g. tapping a movie
 * tile asks the AI about that movie and generates a new screen.
 *
 * `prefetch` is the speculative sibling of `ask`: call it on hover/touch
 * intent and the next turn starts generating in the background, so the
 * actual tap resolves faster (instantly, if the user hovered long enough).
 */
export const SceneActionsContext = createContext<{
  ask: (text: string) => void;
  prefetch: (text: string) => void;
}>({ ask: () => {}, prefetch: () => {} });

export function useSceneActions() {
  return useContext(SceneActionsContext);
}
