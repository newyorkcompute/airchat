/**
 * Model slug resolution for the Vercel AI Gateway.
 *
 * Plain "provider/model" strings route through the gateway automatically.
 * Default is a fast, free-tier-accessible model with strong tool calling.
 * Override with AIRCHAT_MODEL in .env.local.
 */
export const MODEL_ID = process.env.AIRCHAT_MODEL ?? "openai/gpt-5.4-mini";

/** Fallback models the gateway may use if the primary is unavailable. */
export const FALLBACK_MODELS = ["google/gemini-2.5-flash"];
