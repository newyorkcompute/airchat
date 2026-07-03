import { isRateLimited, clientIp } from "@/lib/rate-limit";

/**
 * Resolves a short query ("Lucid Air sedan", "Paddington 2 movie poster")
 * to one image URL via the Brave Image Search API. Scenes call this after
 * they render, so images are progressive enhancement — the emoji
 * placeholder stays if this fails.
 *
 * Cached: in-flight dedupe (this instance), memory (with TTL), Next data
 * cache on the Brave fetch, CDN (s-maxage), and the browser.
 */

type CacheEntry = { url: string | null; until: number };

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string | null>>();
const MAX_QUERY_LENGTH = 100;
const SUCCESS_TTL_MS = 60 * 60 * 24 * 30 * 1000; // 30 days
const FAILURE_TTL_MS = 15 * 60 * 1000; // 15 minutes — transient Brave errors

type BraveImageResult = {
  thumbnail?: { src?: string };
  properties?: { url?: string };
};

function getCached(q: string): string | null | undefined {
  const hit = cache.get(q);
  if (!hit) return undefined;
  if (Date.now() > hit.until) {
    cache.delete(q);
    return undefined;
  }
  return hit.url;
}

function setCached(q: string, url: string | null, ttlMs: number) {
  cache.set(q, { url, until: Date.now() + ttlMs });
  if (cache.size > 2_000) {
    cache.delete(cache.keys().next().value as string);
  }
}

async function fetchFromBrave(q: string, apiKey: string): Promise<string | null> {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/images/search?q=${encodeURIComponent(q)}&count=1&safesearch=strict`,
    {
      headers: {
        "X-Subscription-Token": apiKey,
        Accept: "application/json",
      },
      // Next's persistent data cache: survives cold starts and is shared
      // across serverless instances, unlike the in-memory map above.
      next: { revalidate: 60 * 60 * 24 * 30 },
    }
  );
  if (!res.ok) throw new Error(`Brave responded ${res.status}`);
  const data: { results?: BraveImageResult[] } = await res.json();
  return (
    data.results
      ?.map((r) => r.thumbnail?.src ?? r.properties?.url)
      .find(Boolean) ?? null
  );
}

function resolveImage(q: string, apiKey: string): Promise<string | null> {
  const hit = getCached(q);
  if (hit !== undefined) return Promise.resolve(hit);

  let promise = inflight.get(q);
  if (!promise) {
    promise = fetchFromBrave(q, apiKey)
      .then((url) => {
        setCached(q, url, SUCCESS_TTL_MS);
        return url;
      })
      .catch(() => {
        setCached(q, null, FAILURE_TTL_MS);
        return null;
      })
      .finally(() => {
        inflight.delete(q);
      });
    inflight.set(q, promise);
  }
  return promise;
}

export async function GET(request: Request) {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Image search not configured" }, { status: 503 });
  }

  // Normalize aggressively — every cache layer keys on this string.
  const q = new URL(request.url).searchParams
    .get("q")
    ?.trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, MAX_QUERY_LENGTH);
  if (!q) {
    return Response.json({ error: "Missing q" }, { status: 400 });
  }

  if (isRateLimited(clientIp(request), { bucket: "image", max: 60 })) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = await resolveImage(q, apiKey);

  return Response.json(
    { url },
    {
      headers: {
        "Cache-Control":
          "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=2592000",
      },
    }
  );
}
