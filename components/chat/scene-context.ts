"use client";

import { createContext, useContext } from "react";

/**
 * Lets any element inside a scene start a new turn, e.g. tapping a movie
 * tile asks the AI about that movie and generates a new screen.
 */
export const SceneActionsContext = createContext<{
  ask: (text: string) => void;
}>({ ask: () => {} });

export function useSceneActions() {
  return useContext(SceneActionsContext);
}
