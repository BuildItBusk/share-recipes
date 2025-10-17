import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Create Redis client from environment variables
// These will be auto-injected by Vercel when you create a KV database
const redis = Redis.fromEnv()

// Rate limiters for different endpoints
export const formatRecipeRatelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(30, "1 h"),
	analytics: true,
	prefix: "@ratelimit/format-recipe",
})

export const saveRecipeRatelimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(20, "1 h"),
	analytics: true,
	prefix: "@ratelimit/save-recipe",
})

// Helper to get client IP from request
export function getClientIp(request: Request): string {
	// Check Vercel's forwarded IP headers first
	const forwardedFor = request.headers.get("x-forwarded-for")
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim()
	}

	const realIp = request.headers.get("x-real-ip")
	if (realIp) {
		return realIp
	}

	// Fallback (shouldn't happen on Vercel)
	return "unknown"
}
