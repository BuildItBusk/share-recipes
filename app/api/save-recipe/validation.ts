import { z } from "zod"

export const SaveRecipeSchema = z.object({
	rawText: z
		.string()
		.min(1, "Raw text is required")
		.max(200000, "Raw text exceeds maximum length of 200,000 characters"),
	formattedText: z
		.string()
		.min(1, "Formatted text is required")
		.max(300000, "Formatted text exceeds maximum length of 300,000 characters"),
})

export type SaveRecipeInput = z.infer<typeof SaveRecipeSchema>
