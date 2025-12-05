import { type NextRequest, NextResponse } from "next/server"
import { formatRecipeRatelimit, getClientIp } from "../../lib/ratelimit"
import { formatRecipe } from "./formatting"
import { extractMetadata, fetchUrlContent, type RecipeMetadata, stripHtmlTags } from "./url-utils"
import { FormatRecipeSchema, validateIsRecipe } from "./validation"

export async function POST(request: NextRequest) {
	try {
		// Rate limiting check with fallback on error
		const ip = getClientIp(request)
		let rateLimitResult: { success: boolean; limit: number; remaining: number; reset: number }

		try {
			rateLimitResult = await formatRecipeRatelimit.limit(ip)
		} catch (rateLimitError) {
			// If rate limiting fails (e.g., Redis connection error), log and continue without rate limiting
			console.warn("⚠️  Rate limiting check failed, allowing request:", rateLimitError)
			rateLimitResult = { success: true, limit: 0, remaining: 0, reset: Date.now() }
		}

		if (!rateLimitResult.success) {
			return NextResponse.json(
				{
					error: "Too many requests. Please try again later.",
					limit: rateLimitResult.limit,
					remaining: rateLimitResult.remaining,
					reset: new Date(rateLimitResult.reset).toISOString(),
				},
				{
					status: 429,
					headers: {
						"X-RateLimit-Limit": rateLimitResult.limit.toString(),
						"X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
						"X-RateLimit-Reset": rateLimitResult.reset.toString(),
					},
				},
			)
		}

		// Validate input with Zod
		const body = await request.json()
		const result = FormatRecipeSchema.safeParse(body)

		if (!result.success) {
			return NextResponse.json(
				{
					error: "Validation failed",
					issues: result.error.issues.map((issue) => ({
						path: issue.path.join("."),
						message: issue.message,
					})),
				},
				{ status: 400 },
			)
		}

		const { recipe, recipeUrl } = result.data

		// Step 0: If URL is provided, fetch and extract content
		let recipeContent: string
		let metadata: RecipeMetadata = {}

		if (recipeUrl) {
			const fetchResult = await fetchUrlContent(recipeUrl)

			if (fetchResult.error) {
				return NextResponse.json(
					{ error: fetchResult.error },
					{ status: fetchResult.status || 500 },
				)
			}

			// Extract metadata before stripping HTML
			metadata = extractMetadata(fetchResult.html, recipeUrl)

			// Strip HTML tags and clean content
			recipeContent = stripHtmlTags(fetchResult.html)
		} else {
			// At this point, schema validation ensures recipe is provided
			recipeContent = recipe as string
		}

		// Step 1: Validate that the input is actually a recipe
		const validation = await validateIsRecipe(recipeContent)

		if (!validation.isRecipe) {
			return NextResponse.json(
				{
					error:
						"This doesn't look like a recipe. Please paste recipe text with ingredients and instructions.",
					reason: validation.reason,
				},
				{ status: 400 },
			)
		}

		// Step 2: Format the recipe with metadata
		const formattedRecipe = await formatRecipe(recipeContent, metadata)

		return NextResponse.json({ formattedRecipe })
	} catch (error) {
		console.error("Error formatting recipe:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
