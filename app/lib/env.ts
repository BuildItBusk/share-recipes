import { z } from "zod"

/**
 * Environment variable validation schema
 * This ensures all required environment variables are present at startup
 */
const envSchema = z.object({
	OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),
	DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
	KV_REST_API_URL: z.string().url("KV_REST_API_URL must be a valid URL"),
	KV_REST_API_TOKEN: z.string().min(1, "KV_REST_API_TOKEN is required"),
	NODE_ENV: z.enum(["development", "production", "test"]).optional(),
})

/**
 * Validated environment variables
 * This will throw an error at module load time if validation fails
 */
export const env = envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>
