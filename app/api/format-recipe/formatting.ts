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
 * Builds an attribution section from metadata if available
 */
function buildAttributionSection(metadata?: RecipeMetadata): string {
	if (!metadata || (!metadata.author && !metadata.source)) {
		return ""
	}

	let attribution = "\n\n---\n\n**Source Information**\n"

	if (metadata.author) {
		attribution += `- Author: ${metadata.author}\n`
	}

	if (metadata.source) {
		const source = metadata.source
		const sourceUrl = metadata.sourceUrl ? ` [${source}](${metadata.sourceUrl})` : source
		attribution += `- Source: ${sourceUrl}\n`
	}

	return attribution
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
		reasoning: { effort: "minimal" },
		text: { verbosity: "low" },
	})

	let formattedRecipe = result.output_text

	if (!formattedRecipe) {
		throw new Error("Failed to format recipe")
	}

	// Add attribution section if metadata is available
	const attribution = buildAttributionSection(metadata)
	formattedRecipe += attribution

	return formattedRecipe
}
