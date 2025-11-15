import { z } from "zod"

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present at startup
 * Note: KV (Redis) is optional for local development but required for production
 * Note: DATABASE_URL is optional at build time (when parsing during API route compilation)
 */
const envSchema = z.object({
	OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
	DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL").optional(),
	KV_REST_API_URL: z.string().url("KV_REST_API_URL must be a valid URL").optional(),
	KV_REST_API_TOKEN: z.string().min(1, "KV_REST_API_TOKEN is required").optional(),
	NODE_ENV: z.enum(["development", "production", "test"]).optional(),
})

/**
 * Validated environment variables
 * This will throw an error at module load time if validation fails
 */
export const env = envSchema.parse(process.env)

/**
 * Check if running in actual Vercel production environment
 * Distinguishes between local builds with NODE_ENV=production and actual Vercel deployments
 */
export function isVercelProduction(): boolean {
	return process.env.VERCEL_ENV === "production" && process.env.VERCEL === "1"
}

/**
 * Validate that rate limiting is properly configured
 * In production (Vercel): throws error if KV credentials are missing
 * In development: logs warning but continues
 */
export function validateRateLimitingConfig(): void {
	const hasCredentials = !!(env.KV_REST_API_URL && env.KV_REST_API_TOKEN)

	if (!hasCredentials && isVercelProduction()) {
		throw new Error(
			"Rate limiting is required in production but KV credentials are missing.\n" +
				"To fix:\n" +
				"1. Go to Vercel Dashboard → Storage → Create KV Database\n" +
				"2. Connect it to your project (environment variables auto-injected)\n" +
				"Or set KV_REST_API_URL and KV_REST_API_TOKEN manually in Vercel environment variables.",
		)
	}

	if (!hasCredentials && process.env.NODE_ENV === "development") {
		console.warn("⚠️  Rate limiting disabled: KV credentials not found (development mode)")
	}
}

/**
 * Check if rate limiting is available
 * Returns true only if both KV credentials are provided
 */
export function isRateLimitingAvailable(): boolean {
	return !!(env.KV_REST_API_URL && env.KV_REST_API_TOKEN)
}

export type Env = z.infer<typeof envSchema>
