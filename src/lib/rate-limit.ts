import { createHmac } from 'node:crypto';
import { supabaseAdmin } from '@/lib/db';

type RateLimitEntry = { count: number; resetAt: number };
const localRequests = new Map<string, RateLimitEntry>();
let warnedAboutSharedLimiter = false;

function checkLocalRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = localRequests.get(key);
  if (!entry || entry.resetAt <= now) {
    localRequests.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}

/** Uses a shared atomic Supabase counter; falls back locally until migration 008 is applied. */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (secret) {
    const keyHash = createHmac('sha256', secret).update(key).digest('hex');
    const { data, error } = await supabaseAdmin.rpc('consume_rate_limit', {
      p_key_hash: keyHash,
      p_limit: limit,
      p_window_seconds: Math.ceil(windowMs / 1000),
    });

    if (!error && typeof data === 'boolean') return data;
    if (!warnedAboutSharedLimiter) {
      console.warn('Shared rate limiter unavailable; using per-instance fallback until migration 008 is applied.', error?.code);
      warnedAboutSharedLimiter = true;
    }
  }

  return checkLocalRateLimit(key, limit, windowMs);
}

export function getClientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
