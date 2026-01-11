/**
 * Utility functions for extracting metadata from formatted recipe text
 */

export interface RecipeTextMetadata {
	title: string
	description: string
}

/**
 * Extracts title and description from formatted recipe markdown text
 * Title is extracted from the first H1 heading
 * Description is the first non-heading line with sufficient length
 */
export function extractRecipeTextMetadata(
	formattedText: string,
	defaultTitle = "Shared Recipe",
	defaultDescription = "A delicious recipe",
): RecipeTextMetadata {
	// Extract title from first H1 heading
	const titleMatch = formattedText.match(/^#\s+(.+)$/m)
	const title = titleMatch ? titleMatch[1] : defaultTitle

	// Extract description (first non-heading line with sufficient length)
	const lines = formattedText.split("\n").filter((line) => line.trim())
	const description =
		lines.find((line) => !line.startsWith("#") && line.length > 20) || defaultDescription

	return { title, description }
}
