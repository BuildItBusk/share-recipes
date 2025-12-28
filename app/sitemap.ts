import type { MetadataRoute } from "next"
import { prisma } from "./lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = "https://www.pasterecipe.com"

	// Get all recipes
	const recipes = await prisma.recipe.findMany({
		select: {
			id: true,
			createdAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})

	// Create sitemap entries for recipes
	const recipeEntries = recipes.map((recipe) => ({
		url: `${baseUrl}/r/${recipe.id}`,
		lastModified: recipe.createdAt,
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}))

	return [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		...recipeEntries,
	]
}
