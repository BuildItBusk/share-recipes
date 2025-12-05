import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "../../lib/db"
import { getClientIp, saveRecipeRatelimit } from "../../lib/ratelimit"
import { createShareUrl, generateUniqueRecipeId } from "../../lib/utils"
import { SaveRecipeSchema } from "./validation"

export async function POST(request: NextRequest) {
	try {
		// Rate limiting check with fallback on error
		const ip = getClientIp(request)
		let rateLimitResult: { success: boolean; limit: number; remaining: number; reset: number }

		try {
			rateLimitResult = await saveRecipeRatelimit.limit(ip)
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
		const result = SaveRecipeSchema.safeParse(body)

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

		const { rawText, formattedText } = result.data

		// Generate unique ID (handles collision detection and duplicate recipes)
		const recipeId = await generateUniqueRecipeId(rawText, formattedText)

		// Check if this exact recipe already exists (returned by generateUniqueRecipeId)
		const existingRecipe = await prisma.recipe.findUnique({
			where: { id: recipeId },
		})

		if (existingRecipe) {
			// Recipe already exists, return existing ID
			return NextResponse.json({
				id: recipeId,
				shareUrl: createShareUrl(recipeId),
				existing: true,
			})
		}

		// Save new recipe to database
		const recipe = await prisma.recipe.create({
			data: {
				id: recipeId,
				rawText,
				formattedText,
			},
		})

		return NextResponse.json({
			id: recipe.id,
			shareUrl: createShareUrl(recipe.id),
			existing: false,
		})
	} catch (error) {
		console.error("Error saving recipe:", error)
		return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 })
	}
}
