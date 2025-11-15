/**
 * Utility functions for fetching and processing HTML from recipe URLs
 */

const FETCH_TIMEOUT_MS = 10000 // 10 seconds
const MAX_HTML_SIZE_BYTES = 1024 * 1024 // 1 MB

export interface FetchUrlResult {
	html: string
	error?: string
	status?: number
}

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

/**
 * Fetches HTML from a given URL with timeout and size limits
 */
export async function fetchUrlContent(url: string): Promise<FetchUrlResult> {
	// Validate URL format
	if (!isValidUrl(url)) {
		return {
			html: "",
			error: "Invalid URL format",
			status: 400,
		}
	}

	try {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
			},
		})

		clearTimeout(timeoutId)

		// Check for blocking/unauthorized responses
		if (response.status === 403) {
			return {
				html: "",
				error: "Site blocked this request (403 Forbidden). Try copying the recipe text instead.",
				status: 503,
			}
		}

		if (response.status === 429) {
			return {
				html: "",
				error: "Site is rate limiting requests. Try again later or copy the recipe text instead.",
				status: 503,
			}
		}

		if (!response.ok) {
			return {
				html: "",
				error: `Failed to fetch URL (HTTP ${response.status})`,
				status: 502,
			}
		}

		// Check content type
		const contentType = response.headers.get("content-type") || ""
		if (!contentType.includes("text/html")) {
			return {
				html: "",
				error: "URL does not point to an HTML page",
				status: 400,
			}
		}

		// Get content length to prevent huge downloads
		const contentLength = response.headers.get("content-length")
		if (contentLength && parseInt(contentLength, 10) > MAX_HTML_SIZE_BYTES) {
			return {
				html: "",
				error: "Page is too large to process",
				status: 413,
			}
		}

		const html = await response.text()

		// Check size after reading
		if (html.length > MAX_HTML_SIZE_BYTES) {
			return {
				html: "",
				error: "Page content exceeds maximum size",
				status: 413,
			}
		}

		return {
			html,
		}
	} catch (error) {
		if (error instanceof Error) {
			if (error.name === "AbortError") {
				return {
					html: "",
					error:
						"Request timed out. The site took too long to respond. Try copying the recipe text instead.",
					status: 504,
				}
			}
			if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
				return {
					html: "",
					error: "Invalid URL or domain not found",
					status: 400,
				}
			}
		}

		console.error("Error fetching URL:", error)
		return {
			html: "",
			error: "Failed to fetch the URL. Please try copying the recipe text instead.",
			status: 502,
		}
	}
}
