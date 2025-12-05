import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { isRateLimitingAvailable } from "./env"

// No-op rate limiter for when KV credentials are not available
// Always allows requests (never rate limits)
const noOpRatelimit = {
	limit: async () => ({
		success: true,
		limit: 0,
		remaining: 0,
		reset: Date.now(),
		pending: Promise.resolve(),
	}),
}

// Create real rate limiters only if KV credentials are available
let formatRecipeRatelimit: Ratelimit | typeof noOpRatelimit
let saveRecipeRatelimit: Ratelimit | typeof noOpRatelimit

if (isRateLimitingAvailable()) {
	try {
		// Create Redis client from environment variables
		// These will be auto-injected by Vercel when you create a KV database
		const redis = Redis.fromEnv()

		formatRecipeRatelimit = new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(30, "1 h"),
			analytics: true,
			prefix: "@ratelimit/format-recipe",
		})

		saveRecipeRatelimit = new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(20, "1 h"),
			analytics: true,
			prefix: "@ratelimit/save-recipe",
		})
	} catch (error) {
		// If Redis initialization fails, fall back to no-op limiter
		console.warn("⚠️  Failed to initialize Redis rate limiting, falling back to no-op:", error)
		formatRecipeRatelimit = noOpRatelimit
		saveRecipeRatelimit = noOpRatelimit
	}
} else {
	// Fallback to no-op limiters in development without KV credentials
	formatRecipeRatelimit = noOpRatelimit
	saveRecipeRatelimit = noOpRatelimit
}

export { formatRecipeRatelimit, saveRecipeRatelimit }

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
