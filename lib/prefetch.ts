"use client";

import { readUIMessageStream, uiMessageChunkSchema, type UIMessageChunk } from "ai";
import { parseJsonEventStream } from "@ai-sdk/provider-utils";
import type { AirchatUIMessage } from "@/lib/ai/tools";

/**
 * Speculative next-turn prefetch. When the user shows intent on a tappable
 * item (hover/touch-start), we fire the chat request early and buffer the
 * finished assistant message. If they follow through with the tap, the
 * scene is injected instantly (or with whatever head start we got).
 */

function generateClientId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function makeUserMessage(text: string): AirchatUIMessage {
  return {
    id: generateClientId(),
    role: "user",
    parts: [{ type: "text", text }],
  };
}

/** POST the hypothetical next turn and resolve to the final assistant message. */
export async function prefetchAssistantMessage(
  messages: AirchatUIMessage[],
  text: string,
  signal: AbortSignal
): Promise<AirchatUIMessage> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages: [...messages, makeUserMessage(text)] }),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`Prefetch failed: ${response.status}`);
  }

  const chunkStream = parseJsonEventStream({
    stream: response.body,
    schema: uiMessageChunkSchema,
  }).pipeThrough(
    new TransformStream<
      { success: boolean; value?: unknown },
      UIMessageChunk
    >({
      transform(result, controller) {
        if (result.success) controller.enqueue(result.value as UIMessageChunk);
      },
    })
  );

  let finalMessage: AirchatUIMessage | undefined;
  for await (const message of readUIMessageStream<AirchatUIMessage>({
    stream: chunkStream,
  })) {
    finalMessage = message;
  }
  if (!finalMessage) throw new Error("Prefetch produced no message");
  // The stream may not carry a message id; useChat needs unique keys.
  if (!finalMessage.id) finalMessage.id = generateClientId();
  return finalMessage;
}
