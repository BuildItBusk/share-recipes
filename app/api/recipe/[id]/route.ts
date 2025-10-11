import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/db"

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params

		if (!id) {
			return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 })
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
