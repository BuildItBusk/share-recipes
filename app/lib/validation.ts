import { z } from "zod"

/**
 * Shared validation schemas used across the application
 */

export const RecipeIdSchema = z
	.string()
	.length(8, "Recipe ID must be exactly 8 characters")
	.regex(/^[a-zA-Z0-9]+$/, "Recipe ID must contain only alphanumeric characters")

export type RecipeId = z.infer<typeof RecipeIdSchema>
