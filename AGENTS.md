<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# airchat

Generative-UI chat: every assistant turn is a tool call that renders a full-screen "scene" (Monogram-style), not text. Next.js App Router + AI SDK v6 via Vercel AI Gateway, Tailwind v4 + shadcn/ui, Motion (`motion/react`), Geist.

## Architecture

- `lib/ai/tools.ts` — Zod schemas for every scene tool; `lib/ai/system-prompt.ts` — routing rules. Add a scene = schema + prompt rule + component + case in `components/chat/scene-renderer.tsx`.
- `components/scenes/*` — one component per tool; `components/blocks/*` — shared building blocks (SceneShell, Tappable, SceneImage, …); `components/ui/*` — shadcn primitives.
- Scene inputs stream in **partially** (DeepPartial): every field may be `undefined` at any moment — components must render gracefully from incomplete data.
- Tappable items carry model-authored `ask` (follow-up prompt) and `imageQuery` (resolved via `/api/image`, Brave Search) fields.
- API routes are rate-limited per IP (`lib/rate-limit.ts`).

## Conventions

- Animations follow the standards in `.agents/skills/` (Emil Kowalski): strong ease-out (`EASE_OUT` from scene-shell / `ease-out-strong`), exits faster than enters, subtle press scales, transform/opacity only.
- Scroll between turns is a custom rAF "camera" glide in `components/chat/chat.tsx` — don't replace it with `scrollIntoView`.

## Workflow

- Dev server: `npm run dev -- --port 3210` (check if already running first).
- Verify with `npx tsc --noEmit` and `npx eslint <touched files>`.
- Env in `.env.local`: `AI_GATEWAY_API_KEY`, `BRAVE_SEARCH_API_KEY`.
- Deploys: push to `main` → Vercel auto-deploys useairchat.vercel.app. Don't commit `next-env.d.ts` churn.

# Subagent model preference

When launching subagents/background agents for work in this repo, use the `composer-2.5` model unless the user asks for a different one.
