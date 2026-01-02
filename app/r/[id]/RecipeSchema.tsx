interface Recipe {
	id: string
	formattedText: string
	createdAt: Date
}

export default function RecipeSchema({ recipe }: { recipe: Recipe }) {
	// Extract title
	const titleMatch = recipe.formattedText.match(/^#\s*(.+)$/m)
	const name = titleMatch ? titleMatch[1] : "Shared Recipe"

	// Extract description (first non-heading line)
	const lines = recipe.formattedText.split("\n").filter((line) => line.trim())
	const description =
		lines.find((line) => !line.startsWith("#") && line.length > 20) ||
		"A delicious recipe"

	const schema = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: name,
		description,
		datePublished: recipe.createdAt.toISOString(),
		author: {
			"@type": "Organization",
			name: "Paste Recipe",
		},
		publisher: {
			"@type": "Organization",
			name: "Paste Recipe",
		},
	}

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
		/>
	)
}
