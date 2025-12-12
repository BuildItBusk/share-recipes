/**
 * Formats a recipe for export to Obsidian or other markdown note-taking apps
 */
export function formatRecipeForObsidian(
	formattedText: string,
	recipeId: string,
	createdAt: Date,
	shareUrl: string,
): string {
	// Extract title from first H1 heading
	const titleMatch = formattedText.match(/^#\s+(.+)$/m)
	const title = titleMatch ? titleMatch[1] : "Unknown"

	const dateStr = createdAt.toISOString().split("T")[0]

	const frontmatter = `---
title: ${title}
created: ${dateStr}
source: ${shareUrl}
---

`

	return frontmatter + formattedText
}
