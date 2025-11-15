"use client"

import { useId, useState } from "react"
import { useRecipe } from "./RecipeContext"

export default function UrlRecipe() {
	const inputId = useId()
	const [recipeUrl, setRecipeUrl] = useState("")
	const {
		setOriginalRecipe,
		setFormattedRecipe,
		setActiveTab,
		isLoading,
		setIsLoading,
		error,
		setError,
	} = useRecipe()

	const handleFormat = async () => {
		if (!recipeUrl.trim()) {
			setError("Please enter a recipe URL")
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const response = await fetch("/api/format-recipe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ recipeUrl: recipeUrl.trim() }),
			})

			const data = await response.json()

			if (!response.ok) {
				// Handle validation errors with detailed issues
				if (data.issues && data.issues.length > 0) {
					const issueMessages = data.issues
						.map((issue: { message: string }) => issue.message)
						.join(", ")
					throw new Error(`${data.error}: ${issueMessages}`)
				}
				throw new Error(data.error || "Failed to format recipe")
			}

			setOriginalRecipe(recipeUrl)
			setFormattedRecipe(data.formattedRecipe)
			setActiveTab("formatted")
			setRecipeUrl("")
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred")
		} finally {
			setIsLoading(false)
		}
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !isLoading && recipeUrl.trim()) {
			handleFormat()
		}
	}

	return (
		<div className="space-y-4">
			<div>
				<label htmlFor={inputId} className="block text-sm font-medium mb-2 text-white">
					Enter recipe URL:
				</label>
				<input
					id={inputId}
					type="url"
					value={recipeUrl}
					onChange={(e) => setRecipeUrl(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="https://example.com/recipe"
					className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
					disabled={isLoading}
				/>
				<p className="text-sm text-gray-400 mt-2">
					Paste the URL of a recipe webpage. We'll extract and format it for you.
				</p>
			</div>

			{error && (
				<div className="text-red-300 text-sm bg-red-900 border border-red-700 p-3 rounded-md">
					{error}
				</div>
			)}

			<button
				type="button"
				onClick={handleFormat}
				disabled={isLoading || !recipeUrl.trim()}
				className="w-full bg-white text-black py-3 px-4 rounded-md hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
			>
				{isLoading && <div className="spinner" />}
				{isLoading ? "Fetching and formatting..." : "Format Recipe from URL"}
			</button>
		</div>
	)
}
