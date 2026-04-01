import { LRUCache } from "lru-cache";
import { headers } from "next/headers";

export type RateLimitContext = {
  id: string; // IP or user identifier
  limit: number; // Max requests within window
  windowMs: number; // Milliseconds
};

class RateLimiter {
  private cache = new LRUCache<string, number>({
    max: 5000,
    ttl: 60 * 1000, // default 1m
  });

  check(context: RateLimitContext): { success: boolean; current: number } {
    const { id, limit, windowMs } = context;

    // Use a composite key
    const key = `${windowMs}:${limit}:${id}`;

    const current = this.cache.get(key) ?? 0;

    if (current >= limit) {
      return { success: false, current };
    }

    this.cache.set(key, current + 1, { ttl: windowMs });
    return { success: true, current: current + 1 };
  }
}

// Global instance (persists across requests on the same Vercel Serverless Function instance)
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
