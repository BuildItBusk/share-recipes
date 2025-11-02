import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/db"
import { RecipeIdSchema } from "../../../lib/validation"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params

		// Validate recipe ID format
		const result = RecipeIdSchema.safeParse(id)

		if (!result.success) {
			return NextResponse.json(
				{
					error: "Invalid recipe ID format",
					issues: result.error.issues.map((issue) => ({
						message: issue.message,
					})),
				},
				{ status: 400 },
			)
		}

		const recipe = await prisma.recipe.findUnique({
			where: { id },
		})

		if (!recipe) {
			return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
		}

		return NextResponse.json(recipe)
	} catch (error) {
		console.error("Error fetching recipe:", error)
		return NextResponse.json({ error: "Internal server error" }, { status: 500 })
	}
}
