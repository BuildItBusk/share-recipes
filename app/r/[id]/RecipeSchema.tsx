import { extractRecipeTextMetadata } from "../../lib/recipe-metadata"

interface Recipe {
	id: string
	formattedText: string
	createdAt: Date
}

interface RecipeSchemaProps {
	recipe: Recipe
}

export default function RecipeSchema({ recipe }: RecipeSchemaProps): React.ReactElement {
	const { title, description } = extractRecipeTextMetadata(recipe.formattedText)

	const schema = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: title,
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
