/**
 * Utility for handling API error responses consistently across the client
 */

interface ApiValidationIssue {
	path?: string
	message: string
}

interface ApiErrorResponse {
	error?: string
	issues?: ApiValidationIssue[]
}

/**
 * Extracts a user-friendly error message from an API response
 * Handles both simple error messages and detailed validation issues
 */
export function parseApiError(data: ApiErrorResponse, defaultMessage: string): string {
	if (data.issues && data.issues.length > 0) {
		const issueMessages = data.issues.map((issue) => issue.message).join(", ")
		return `${data.error}: ${issueMessages}`
	}
	return data.error || defaultMessage
}
