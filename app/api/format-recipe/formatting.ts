import { readFileSync } from "node:fs"
import { join } from "node:path"
import OpenAI from "openai"
import { env } from "../../lib/env"
import type { RecipeMetadata } from "./url-utils"

const openai = new OpenAI({
	apiKey: env.OPENAI_API_KEY,
})

// Cache system prompt at module load time (performance optimization)
let cachedSystemPrompt: string | null = null

function getSystemPrompt(): string {
	if (cachedSystemPrompt) {
		return cachedSystemPrompt
	}

	try {
		const promptPath = join(process.cwd(), "specs", "system-message.txt")
		cachedSystemPrompt = readFileSync(promptPath, "utf-8")
		return cachedSystemPrompt
	} catch (error) {
		console.error("Error reading system prompt file:", error)
		throw new Error("Failed to load system prompt")
	}
}

/**
 * Injects source attribution into formatted recipe, placing it after the author line
 */
function injectSourceAttribution(recipe: string, metadata?: RecipeMetadata): string {
	if (!metadata || (!metadata.author && !metadata.source)) {
		return recipe
	}

	// Find the author line (starts with ###)
	const authorLineMatch = recipe.match(/^(###[^\n]*)/m)
	if (!authorLineMatch) {
		return recipe
	}

	let sourceAttribution = ""
	if (metadata.source) {
		const source = metadata.source
		const sourceUrl = metadata.sourceUrl ? `[${source}](${metadata.sourceUrl})` : source
		sourceAttribution = `*From ${sourceUrl}*\n`
	}

	// Insert after the author line
	const insertPoint = authorLineMatch.index! + authorLineMatch[0].length
	return recipe.slice(0, insertPoint) + "\n" + sourceAttribution + recipe.slice(insertPoint)
}

export async function formatRecipe(recipe: string, metadata?: RecipeMetadata): Promise<string> {
	const systemPrompt = getSystemPrompt()

	// Build metadata context for the AI
	let metadataContext = ""
	if (metadata && (metadata.author || metadata.source)) {
		metadataContext = `\n\n[This recipe was fetched from ${metadata.source || "an external source"}`
		if (metadata.author) {
			metadataContext += ` by ${metadata.author}`
		}
		metadataContext +=
			". Please preserve and clearly display the source attribution in your formatted output.]"
	}

	const fullPrompt = `${systemPrompt}${metadataContext}\n\n${recipe}`

	const result = await openai.responses.create({
		model: "gpt-5-nano",
		input: fullPrompt,
		reasoning: { effort: "low" },
		text: { verbosity: "low" },
	})

	let formattedRecipe = result.output_text

	if (!formattedRecipe) {
		throw new Error("Failed to format recipe")
	}

	// Inject source attribution after author line if metadata is available
	formattedRecipe = injectSourceAttribution(formattedRecipe, metadata)

	return formattedRecipe
}
