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

export interface RecipeMetadata {
	title?: string
	author?: string
	source?: string
	sourceUrl?: string
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
 * Checks if a URL is allowed by the site's robots.txt
 * Returns true if allowed, false if disallowed
 */
async function checkRobotsTxt(url: string): Promise<boolean> {
	try {
		const urlObj = new URL(url)
		const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`

		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for robots.txt

		const response = await fetch(robotsUrl, {
			signal: controller.signal,
			headers: {
				"User-Agent": "PasteRecipe/1.0 (+https://www.pasterecipe.com; recipe formatter bot)",
			},
		})

		clearTimeout(timeoutId)

		// If robots.txt doesn't exist (404), assume allowed
		if (response.status === 404) {
			return true
		}

		if (!response.ok) {
			// On other errors, be conservative and allow
			return true
		}

		const robotsTxt = await response.text()
		return isPathAllowed(robotsTxt, urlObj.pathname, "PasteRecipe")
	} catch (error) {
		// On network errors or timeouts, be conservative and allow
		// (don't want to break functionality if robots.txt is unreachable)
		console.warn("Failed to check robots.txt, allowing access:", error)
		return true
	}
}

/**
 * Parses robots.txt and checks if a path is allowed for our user-agent
 */
function isPathAllowed(robotsTxt: string, path: string, userAgent: string): boolean {
	const lines = robotsTxt.split("\n")
	let relevantSection = false
	let disallowedPaths: string[] = []
	let allowedPaths: string[] = []

	for (const line of lines) {
		const trimmed = line.trim()

		// Skip comments and empty lines
		if (trimmed.startsWith("#") || trimmed === "") {
			continue
		}

		// Check for User-agent directive
		if (trimmed.toLowerCase().startsWith("user-agent:")) {
			const agent = trimmed.substring(11).trim().toLowerCase()
			// Match our bot name or wildcard *
			relevantSection = agent === userAgent.toLowerCase() || agent === "*"
			// Reset paths when entering new section
			if (relevantSection) {
				disallowedPaths = []
				allowedPaths = []
			}
		}

		// Collect Disallow/Allow rules if we're in a relevant section
		if (relevantSection) {
			if (trimmed.toLowerCase().startsWith("disallow:")) {
				const disallowPath = trimmed.substring(9).trim()
				if (disallowPath) {
					disallowedPaths.push(disallowPath)
				}
			} else if (trimmed.toLowerCase().startsWith("allow:")) {
				const allowPath = trimmed.substring(6).trim()
				if (allowPath) {
					allowedPaths.push(allowPath)
				}
			}
		}
	}

	// Check if path matches any disallow rules
	for (const disallowPath of disallowedPaths) {
		if (path.startsWith(disallowPath)) {
			// Check if there's a more specific allow rule
			for (const allowPath of allowedPaths) {
				if (path.startsWith(allowPath) && allowPath.length > disallowPath.length) {
					return true
				}
			}
			return false
		}
	}

	// If no disallow rules matched, path is allowed
	return true
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

	// Check robots.txt before fetching
	const robotsAllowed = await checkRobotsTxt(url)
	if (!robotsAllowed) {
		return {
			html: "",
			error:
				"This site's robots.txt disallows automated access. Please copy and paste the recipe text instead.",
			status: 403,
		}
	}

	try {
		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

		const response = await fetch(url, {
			signal: controller.signal,
			headers: {
				"User-Agent": "PasteRecipe/1.0 (+https://www.pasterecipe.com; recipe formatter bot)",
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

/**
 * Extracts metadata from HTML (author, source, title)
 * Looks for meta tags (og:*, article:*) and JSON-LD schema
 */
export function extractMetadata(html: string, sourceUrl: string): RecipeMetadata {
	const metadata: RecipeMetadata = {
		sourceUrl,
		source: extractSourceFromUrl(sourceUrl),
	}

	// Extract from meta tags
	const titleMatch = html.match(
		/<meta\s+(?:property|name)=["']og:title["']\s+content=["']([^"']+)["']/i,
	)
	if (titleMatch) {
		metadata.title = titleMatch[1]
	} else {
		// Fallback to <title> tag
		const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
		if (titleTagMatch) {
			metadata.title = titleTagMatch[1].trim()
		}
	}

	// Extract author from meta tags
	const ogAuthorMatch = html.match(
		/<meta\s+(?:property|name)=["']og:author["']\s+content=["']([^"']+)["']/i,
	)
	const articleAuthorMatch = html.match(
		/<meta\s+(?:property|name)=["']article:author["']\s+content=["']([^"']+)["']/i,
	)

	if (ogAuthorMatch) {
		metadata.author = ogAuthorMatch[1]
	} else if (articleAuthorMatch) {
		metadata.author = articleAuthorMatch[1]
	}

	// Try to extract from JSON-LD schema if no author found yet
	if (!metadata.author) {
		try {
			const jsonLdMatch = html.match(
				/<script\s+type=["']application\/ld\+json["'][^>]*>([^<]+)<\/script>/i,
			)
			if (jsonLdMatch) {
				const jsonLdData = JSON.parse(jsonLdMatch[1])
				if (jsonLdData.author) {
					if (typeof jsonLdData.author === "string") {
						metadata.author = jsonLdData.author
					} else if (typeof jsonLdData.author === "object" && jsonLdData.author.name) {
						metadata.author = jsonLdData.author.name
					}
				}
			}
		} catch {
			// Ignore JSON-LD parsing errors, metadata.author just stays undefined
		}
	}

	return metadata
}

/**
 * Extracts domain name from a URL to use as source if author not available
 */
function extractSourceFromUrl(url: string): string {
	try {
		const urlObj = new URL(url)
		// Remove www. prefix if present
		return urlObj.hostname.replace(/^www\./, "")
	} catch {
		return url
	}
}

/**
 * Strips HTML tags from content and cleans up whitespace
 */
export function stripHtmlTags(html: string): string {
	// Remove script and style tags entirely (with content)
	let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
	text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

	// Remove all HTML tags
	text = text.replace(/<[^>]*>/g, "")

	// Decode HTML entities
	text = decodeHtmlEntities(text)

	// Clean up whitespace
	// Replace multiple spaces with single space
	text = text.replace(/\s+/g, " ")
	// Replace multiple newlines with double newline
	text = text.replace(/\n\n+/g, "\n\n")

	return text.trim()
}

const HTML_ENTITIES: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
	"&nbsp;": " ",
	"&mdash;": "\u2014",
	"&ndash;": "\u2013",
	"&ldquo;": "\u201C",
	"&rdquo;": "\u201D",
	"&lsquo;": "\u2018",
	"&rsquo;": "\u2019",
}

const HTML_ENTITY_PATTERN = /&(?:amp|lt|gt|quot|nbsp|mdash|ndash|ldquo|rdquo|lsquo|rsquo|#39);/g

/**
 * Decodes common HTML entities
 */
function decodeHtmlEntities(text: string): string {
	return text.replace(HTML_ENTITY_PATTERN, (entity) => HTML_ENTITIES[entity] || entity)
}
