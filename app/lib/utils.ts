import { prisma } from "./db"

const URL_SAFE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"

export function generateRecipeId(): string {
	let result = ""
	for (let i = 0; i < 8; i++) {
		result += URL_SAFE_CHARS.charAt(Math.floor(Math.random() * URL_SAFE_CHARS.length))
	}
	return result
}

export async function generateUniqueRecipeId(
	rawText: string,
	formattedText: string,
): Promise<string> {
	const maxAttempts = 10

	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const id = generateRecipeId()

		// Check if this ID already exists
		const existingRecipe = await prisma.recipe.findUnique({
			where: { id },
		})

		if (!existingRecipe) {
			return id
		}

		// If ID exists, check if it's the exact same recipe (to avoid duplicates)
		if (existingRecipe.rawText === rawText && existingRecipe.formattedText === formattedText) {
			return existingRecipe.id
		}
	}

	throw new Error("Failed to generate unique recipe ID after maximum attempts")
}

export function createShareUrl(recipeId: string): string {
	return `/r/${recipeId}`
}
