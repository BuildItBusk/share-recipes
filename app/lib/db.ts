import { PrismaClient } from "@prisma/client"
import { isVercelProduction } from "./env"

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ["query"],
	})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

/**
 * Validate that the database is accessible
 * Called on startup to fail fast if the database is unreachable
 * In production (Vercel): throws error to prevent deployment
 * In development: logs warning but continues (allows offline development)
 */
export async function validateDatabaseConnection(): Promise<void> {
	try {
		// Try to connect to the database with a 5-second timeout
		const connectionPromise = prisma.$connect()
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error("Database connection timeout after 5 seconds")), 5000),
		)

		await Promise.race([connectionPromise, timeoutPromise])

		// Connection successful, immediately disconnect to avoid keeping a connection open
		await prisma.$disconnect()
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		const message = `Database connection failed: ${errorMessage}`

		if (isVercelProduction()) {
			throw new Error(
				`${message}\n` +
					"Database is required in production.\n" +
					"Ensure DATABASE_URL is set correctly in Vercel environment variables.",
			)
		} else {
			// In development, just warn - database might be started later
			console.warn(`⚠️  ${message} (development mode - continuing without database)`)
		}
	}
}
