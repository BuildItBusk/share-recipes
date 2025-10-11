import { notFound } from "next/navigation"
import { prisma } from "../../lib/db"
import SharedRecipePage from "./SharedRecipePage"

interface PageProps {
	params: Promise<{ id: string }>
}

async function getRecipe(id: string) {
	try {
		const recipe = await prisma.recipe.findUnique({
			where: { id },
		})
		return recipe
	} catch (error) {
		console.error("Error fetching recipe:", error)
		return null
	}
}

export default async function RecipePage({ params }: PageProps) {
	const { id } = await params
	const recipe = await getRecipe(id)

	if (!recipe) {
		notFound()
	}

	return <SharedRecipePage recipe={recipe} />
}

export async function generateMetadata({ params }: PageProps) {
	const { id } = await params
	const recipe = await getRecipe(id)

	if (!recipe) {
		return {
			title: "Recipe Not Found",
		}
	}

	// Extract title from formatted text (look for first heading)
	const titleMatch = recipe.formattedText.match(/^#\s*(.+)$/m)
	const title = titleMatch ? titleMatch[1] : "Shared Recipe"

	return {
		title: `${title} | Share Recipes`,
		description: "A shared recipe formatted and ready to cook!",
	}
}
