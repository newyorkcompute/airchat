"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Must match the server's normalization: every cache layer between here
// and Brave (session memo, CDN, Next data cache) keys on this string.
const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

// Client-side memo so the same query never refetches within a session
// (the /api/image route and CDN cache across sessions), plus in-flight
// dedupe so two tiles with the same query share one request.
const resolvedUrls = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

function resolveImage(q: string): Promise<string | null> {
  let promise = inflight.get(q);
  if (!promise) {
    promise = fetch(`/api/image?q=${encodeURIComponent(q)}`)
      .then((res) => (res.ok ? res.json() : { url: null }))
      .then((data: { url: string | null }) => {
        resolvedUrls.set(q, data.url);
        inflight.delete(q);
        return data.url;
      })
      .catch(() => {
        inflight.delete(q);
        return null;
      });
    inflight.set(q, promise);
  }
  return promise;
}

/**
 * Visual block for any scene item: renders the emoji instantly, then
 * resolves `query` via /api/image and cross-fades to the photo.
 * If the lookup fails or `query` is absent, the emoji simply stays —
 * images are pure progressive enhancement.
 *
 * Lookups only fire when the block nears the viewport: long scenes
 * (galleries, canvas pages) don't burn image-search quota on tiles the
 * user never scrolls to.
 *
 * The caller owns the container styling (aspect, rounding, text size
 * for the emoji) via className.
 */
export function SceneImage({
  query,
  emoji,
  fallback = "✨",
  className,
}: {
  query?: string;
  emoji?: string;
  fallback?: string;
  className?: string;
}) {
  const key = query ? normalize(query) : undefined;
  const ref = useRef<HTMLDivElement>(null);
  // State only tracks lookups completed by THIS instance; already-cached
  // queries are read directly at render time (covers `query` streaming in
  // after mount and other instances resolving the same query first).
  const [resolved, setResolved] = useState<{
    key: string;
    url: string | null;
  } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const url = key
    ? resolved?.key === key
      ? resolved.url
      : (resolvedUrls.get(key) ?? null)
    : null;

  useEffect(() => {
    if (!key || resolvedUrls.has(key)) return;
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    // `query` streams in token by token ("har" → "harajuku" → …): every
    // partial value re-runs this effect. Wait for the value to settle
    // before looking anything up, or each image costs several searches.
    const settle = setTimeout(() => {
      io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io?.disconnect();
          resolveImage(key).then((u) => {
            if (!cancelled) setResolved({ key, url: u });
          });
        },
        // Start resolving a little ahead of the scroll so the crossfade
        // usually lands before the tile is centered on screen.
        { rootMargin: "600px" }
      );
      io.observe(el);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(settle);
      io?.disconnect();
    };
  }, [key]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <span aria-hidden>{emoji ?? fallback}</span>
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            // A touch of blur during the crossfade masks the emoji→photo
            // swap so it reads as one surface resolving, not two objects.
            "absolute inset-0 size-full object-cover transition-[opacity,filter] duration-300 ease-out",
            loaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
        />
      )}
    </div>
  );
}
