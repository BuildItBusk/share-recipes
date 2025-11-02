import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "../../lib/db"
import { getClientIp, saveRecipeRatelimit } from "../../lib/ratelimit"
import { createShareUrl, generateUniqueRecipeId } from "../../lib/utils"
import { SaveRecipeSchema } from "./validation"

export async function POST(request: NextRequest) {
	try {
		// Rate limiting check
		const ip = getClientIp(request)
		const { success, limit, remaining, reset } = await saveRecipeRatelimit.limit(ip)

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
