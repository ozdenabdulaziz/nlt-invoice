import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { LRUCache } from "lru-cache";
import { headers } from "next/headers";

// ---------------------------------------------------------------------------
// Rate-limiter that works in production (distributed via Upstash Redis) and
// falls back to an in-memory LRU cache when Redis credentials are missing
// (local development).
// ---------------------------------------------------------------------------

export type RateLimitContext = {
  id: string;
  limit: number;
  windowMs: number;
};

// ---------------------------------------------------------------------------
// Upstash Redis-backed rate limiter (production)
// ---------------------------------------------------------------------------

let redisClient: Redis | null = null;

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redisClient = new Redis({ url, token });
  return redisClient;
}

// Cache of Upstash Ratelimit instances keyed by "limit:windowMs"
const ratelimitInstances = new Map<string, Ratelimit>();

function getUpstashRatelimit(limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  const key = `${limit}:${windowMs}`;
  let instance = ratelimitInstances.get(key);

  if (!instance) {
    // Convert milliseconds to the nearest second window (minimum 1s)
    const windowSec = Math.max(1, Math.round(windowMs / 1000));
    const duration = `${windowSec} s` as Parameters<typeof Ratelimit.slidingWindow>[1];

    instance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, duration),
      prefix: "nlt-rl",
      analytics: false,
    });

    ratelimitInstances.set(key, instance);
  }

  return instance;
}

// ---------------------------------------------------------------------------
// In-memory fallback (development / when Redis is unavailable)
// ---------------------------------------------------------------------------

class InMemoryRateLimiter {
  private cache = new LRUCache<string, number>({
    max: 5000,
    ttl: 60 * 1000,
  });

  check(context: RateLimitContext): { success: boolean; current: number } {
    const { id, limit, windowMs } = context;
    const key = `${windowMs}:${limit}:${id}`;
    const current = this.cache.get(key) ?? 0;

    if (current >= limit) {
      return { success: false, current };
    }

    this.cache.set(key, current + 1, { ttl: windowMs });
    return { success: true, current: current + 1 };
  }
}

const fallbackLimiter = new InMemoryRateLimiter();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

class RateLimiter {
  async check(context: RateLimitContext): Promise<{ success: boolean; current: number }> {
    const upstash = getUpstashRatelimit(context.limit, context.windowMs);

    if (upstash) {
      try {
        const result = await upstash.limit(context.id);
        return {
          success: result.success,
          current: result.limit - result.remaining,
        };
      } catch (err) {
        // If Redis is temporarily unavailable, fall back to in-memory
        console.warn("[rate-limit] Redis unavailable, falling back to in-memory:", err);
      }
    }

    return fallbackLimiter.check(context);
  }
}

// Global singleton
export const globalRateLimiter = new RateLimiter();

export async function getClientIp() {
  try {
    const headerStore = await headers();
    const forwardedFor = headerStore.get("x-forwarded-for");

    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }

    return headerStore.get("x-real-ip") ?? "127.0.0.1";
  } catch {
    return "127.0.0.1";
  }
}
