import { readFileSync } from "node:fs"
import { join } from "node:path"
import OpenAI from "openai"
import { env } from "../../lib/env"

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

export async function formatRecipe(recipe: string): Promise<string> {
	const systemPrompt = getSystemPrompt()
	const fullPrompt = `${systemPrompt}\n\n${recipe}`

	const result = await openai.responses.create({
		model: "gpt-5-nano",
		input: fullPrompt,
		reasoning: { effort: "minimal" },
		text: { verbosity: "low" },
	})

	const formattedRecipe = result.output_text

	if (!formattedRecipe) {
		throw new Error("Failed to format recipe")
	}

	return formattedRecipe
}
