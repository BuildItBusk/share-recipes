import { notFound } from "next/navigation"
import { prisma } from "../../lib/db"
import SharedRecipePage from "./SharedRecipePage"
import RecipeSchema from "./RecipeSchema"

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

	return (
		<>
			<RecipeSchema recipe={recipe} />
			<SharedRecipePage recipe={recipe} />
		</>
	)
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

	// Extract first paragraph for description
	const lines = recipe.formattedText.split("\n").filter((line) => line.trim())
	const description =
		lines
			.find((line) => !line.startsWith("#") && line.length > 20)
			?.substring(0, 160) || "A shared recipe formatted and ready to cook!"

	const url = `https://www.pasterecipe.com/r/${id}`

	return {
		title: `${title} | Paste Recipe`,
		description,
		openGraph: {
			title,
			description,
			url,
			type: "article",
			siteName: "Paste Recipe",
		},
		twitter: {
			card: "summary",
			title,
			description,
		},
	}
}
