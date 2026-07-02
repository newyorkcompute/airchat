/**
 * Minimal in-memory sliding-window rate limiter, keyed by client IP
 * (plus a bucket name so different routes get independent budgets).
 *
 * Good enough to blunt casual abuse of AI credits without a database.
 * Note: state is per serverless instance, so the effective limit is
 * "per IP per warm instance" — an acceptable trade-off for simplicity.
 */

const hits = new Map<string, number[]>();

export function isRateLimited(
  ip: string,
  {
    bucket = "default",
    windowMs = 60_000,
    max = 10,
  }: { bucket?: string; windowMs?: number; max?: number } = {}
): boolean {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (hits.size > 5_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return false;
}

export function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
