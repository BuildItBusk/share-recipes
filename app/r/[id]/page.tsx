import { notFound } from "next/navigation"
import { prisma } from "../../lib/db"
import { extractRecipeTextMetadata } from "../../lib/recipe-metadata"
import RecipeSchema from "./RecipeSchema"
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

	const { title, description: rawDescription } = extractRecipeTextMetadata(
		recipe.formattedText,
		"Shared Recipe",
		"A shared recipe formatted and ready to cook!",
	)
	const description = rawDescription.substring(0, 160)
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
