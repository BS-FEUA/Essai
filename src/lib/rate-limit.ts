type RateLimitEntry = { count: number; resetAt: number };

const requests = new Map<string, RateLimitEntry>();

/**
 * Process-local protection for public endpoints. Use a shared store (for
 * example Upstash) when deploying more than one application instance.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = requests.get(key);
  if (!entry || entry.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
