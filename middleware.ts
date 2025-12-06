import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { isVercelProduction, validateRateLimitingConfig } from "./app/lib/env"

let validationPromise: Promise<Error | null> | null = null

/**
 * Middleware that validates infrastructure on first request
 * Validates:
 * - Rate limiting configuration (KV credentials in production)
 *
 * Database connection validation is handled by individual API routes instead,
 * since middleware always runs in Vercel's Edge Runtime and Prisma cannot be used there.
 * Each API route with `export const runtime = "nodejs"` can safely use Prisma.
 *
 * In production (Vercel): returns 503 if validation errors occur
 * In development: logs warnings but continues
 *
 * Uses promise-based caching to prevent race conditions in serverless environments
 */
export async function middleware(_request: NextRequest) {
	// Initialize validation promise only once (handles concurrent requests correctly)
	if (!validationPromise) {
		validationPromise = (async () => {
			try {
				// Validate rate limiting config (synchronous, fast)
				// Note: Runs in Edge Runtime, so no async operations on Prisma here
				validateRateLimitingConfig()
				return null
			} catch (error) {
				return error instanceof Error ? error : new Error(String(error))
			}
		})()
	}

	// Wait for validation to complete
	const validationError = await validationPromise

	// In production, return 503 if validation failed
	if (validationError && isVercelProduction()) {
		return NextResponse.json(
			{
				error: "Service unavailable",
				message: validationError.message,
			},
			{ status: 503 },
		)
	}

	return NextResponse.next()
}

// Run middleware on API routes (where database is actually used)
export const config = {
	matcher: ["/api/:path*"],
}
