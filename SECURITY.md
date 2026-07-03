# Security

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Email or DM [@siddharthkul](https://x.com/siddharthkul) with:

- A description of the issue
- Steps to reproduce
- Impact assessment (if known)

We'll acknowledge within a few days and work on a fix. Please allow reasonable time before public disclosure.

## Hosted demo

The public deployment at [useairchat.vercel.app](https://useairchat.vercel.app) is a **demo**, not a production API:

- Per-IP rate limiting on `/api/chat` and `/api/image` (in-memory, per serverless instance).
- API keys are server-side only - never exposed to the browser.
- No authentication; do not send secrets or PII through the demo.

For production use, self-host with your own keys and add auth + stricter limits.

## Self-hosting

- Keep `AI_GATEWAY_API_KEY` and `BRAVE_SEARCH_API_KEY` in environment variables only.
- Rotate keys if you suspect exposure.
- Review `lib/rate-limit.ts` - defaults are minimal; tune `max` and `windowMs` for your traffic.
