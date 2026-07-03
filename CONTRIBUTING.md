# Contributing to Airchat

Thanks for your interest! This is an early project - small, focused PRs are easiest to review.

## Before you start

1. Read [AGENTS.md](./AGENTS.md) for architecture and conventions.
2. Run locally with your own keys (see [README](./README.md)).
3. Verify changes:

   ```bash
   npx tsc --noEmit
   npx eslint <files you touched>
   ```

## Adding a new scene

A scene is four touchpoints:

1. **Schema** - add a tool in `lib/ai/tools.ts` (Zod `inputSchema`, description for the model).
2. **Routing** - add a rule in `lib/ai/system-prompt.ts` (when the model should pick it).
3. **Component** - create `components/scenes/your-scene.tsx` using blocks from `components/blocks/`. Handle partial/streaming data (`DeepPartial` in `components/scenes/types.ts`).
4. **Renderer** - add a `case` in `components/chat/scene-renderer.tsx`.

Use `ask` on tappable items so users can drill in. Use `imageQuery` + `SceneImage` when a photo helps.

## Animation

Follow the standards in `.agents/skills/` (Emil Kowalski): strong ease-out, exits faster than enters, transform/opacity only. Don't replace the scroll camera in `chat.tsx` with `scrollIntoView`.

## Pull requests

- One logical change per PR when possible.
- No drive-by refactors.
- Don't commit `.env.local`, API keys, or `next-env.d.ts` churn.

## Questions

Open a [GitHub Discussion](https://github.com/newyorkcompute/airchat/discussions) or issue if you're unsure about direction before a large change.
