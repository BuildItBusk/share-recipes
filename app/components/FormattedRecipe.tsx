"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import MarkdownRenderer from "./MarkdownRenderer"
import { useRecipe } from "./RecipeContext"

export default function FormattedRecipe() {
	const { originalRecipe, formattedRecipe, setActiveTab } = useRecipe()
	const [isSaving, setIsSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	const handleSaveAndShare = async () => {
		if (!originalRecipe || !formattedRecipe) return

		setIsSaving(true)
		setError(null)
		try {
			const response = await fetch("/api/save-recipe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					rawText: originalRecipe,
					formattedText: formattedRecipe,
				}),
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || "Failed to save recipe")
			}

			// Validate shareUrl before navigation
			if (!data.shareUrl || typeof data.shareUrl !== "string") {
				throw new Error("Invalid share URL received from server")
			}

			// Redirect to the shared recipe page
			router.push(data.shareUrl)
		} catch (error) {
			console.error("Error saving recipe:", error)
			setError(error instanceof Error ? error.message : "Failed to save recipe. Please try again.")
		} finally {
			setIsSaving(false)
		}
	}

	if (!formattedRecipe) {
		return (
			<div className="text-center py-12">
				<div className="space-y-4">
					<div className="text-gray-400 text-lg">No recipe formatted yet</div>
					<div className="text-gray-500 text-sm">
						Go to the Paste Recipe tab to format a recipe first.
					</div>
					<button
						type="button"
						onClick={() => setActiveTab("paste")}
						className="bg-white text-black py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
					>
						Go to Paste Recipe
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
				<h2 className="text-xl font-semibold text-white">Formatted Recipe</h2>
				<button
					type="button"
					onClick={handleSaveAndShare}
					disabled={isSaving}
					className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
				>
					{isSaving ? "Saving..." : "Save & Share"}
				</button>
			</div>

			{error && (
				<div className="bg-red-900 border border-red-700 p-3 rounded-md text-red-300">{error}</div>
			)}

			<div className="bg-gray-900 border border-gray-600 rounded-md p-6">
				<MarkdownRenderer content={formattedRecipe} />
			</div>
		</div>
	)
}
