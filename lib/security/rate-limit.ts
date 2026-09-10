/** Sliding window, bounded memory. Per Node process; see deployment contract in README. */
export function createRateLimiter(
  limit = 30,
  windowMs = 60_000,
  maxKeys = 10_000,
) {
  const entries = new Map<string, number[]>();
  return (key: string, now = Date.now()) => {
    for (const [id, timestamps] of entries)
      if (timestamps[timestamps.length - 1] <= now - windowMs)
        entries.delete(id);
    const recent = (entries.get(key) || []).filter((t) => t > now - windowMs);
    if (recent.length >= limit)
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)),
      };
    if (!entries.has(key) && entries.size >= maxKeys)
      return { allowed: false, retryAfter: 60 };
    recent.push(now);
    entries.set(key, recent);
    return { allowed: true, retryAfter: 0 };
  };
}
