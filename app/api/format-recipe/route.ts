import { type NextRequest, NextResponse } from "next/server"
import { formatRecipeRatelimit, getClientIp } from "../../lib/ratelimit"
import { formatRecipe } from "./formatting"
import { extractMetadata, fetchUrlContent, type RecipeMetadata, stripHtmlTags } from "./url-utils"
import { FormatRecipeSchema, validateIsRecipe } from "./validation"

export async function POST(request: NextRequest) {
	try {
		// Rate limiting check
		const ip = getClientIp(request)
		const { success, limit, remaining, reset } = await formatRecipeRatelimit.limit(ip)

		if (!success) {
			return NextResponse.json(
				{
					error: "Too many requests. Please try again later.",
					limit,
					remaining,
					reset: new Date(reset).toISOString(),
				},
				{
					status: 429,
					headers: {
						"X-RateLimit-Limit": limit.toString(),
						"X-RateLimit-Remaining": remaining.toString(),
						"X-RateLimit-Reset": reset.toString(),
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

		// Step 2: Format the recipe
		const formattedRecipe = await formatRecipe(recipeContent)

		return NextResponse.json({ formattedRecipe, metadata })
	} catch (error) {
		console.error("Error formatting recipe:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
