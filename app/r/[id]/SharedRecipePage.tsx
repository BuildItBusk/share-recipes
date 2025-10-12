"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import MarkdownRenderer from "@/app/components/MarkdownRenderer"

interface Recipe {
	id: string
	rawText: string
	formattedText: string
	createdAt: Date
}

interface SharedRecipePageProps {
	recipe: Recipe
}

export default function SharedRecipePage({ recipe }: SharedRecipePageProps) {
	const [copySuccess, setCopySuccess] = useState(false)

	const shareUrl = `${typeof window !== "undefined" ? window.location.href : ""}`

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl)
			setCopySuccess(true)
			setTimeout(() => setCopySuccess(false), 2000)
		} catch (error) {
			console.error("Failed to copy to clipboard:", error)
			alert("Failed to copy to clipboard")
		}
	}

	return (
		<div className="min-h-screen bg-black py-4 sm:py-8">
			<div className="container mx-auto px-4 max-w-4xl">
				<header className="mb-6 sm:mb-8">
					<Link
						href="/"
						className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
					>
						<Image
							src="/paste_recipe_logo.png"
							alt="Share Recipes logo"
							width={40}
							height={40}
							className="sm:w-12 sm:h-12"
							priority
						/>
						<h1 className="text-xl sm:text-2xl font-medium text-white">Share Recipes</h1>
					</Link>
				</header>

				<div className="space-y-4">
					<div className="flex justify-between items-start gap-4">
						<div>
							<h2 className="text-xl font-semibold text-white">Shared Recipe</h2>
							<p className="text-sm text-gray-400 mt-1">
								Shared on {new Date(recipe.createdAt).toLocaleDateString()}
							</p>
						</div>
						<button
							type="button"
							onClick={copyToClipboard}
							className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md transition-colors flex items-center justify-center min-w-[40px]"
							title={copySuccess ? "Copied!" : "Share This Recipe"}
						>
							{copySuccess ? (
								<svg
									className="w-5 h-5 text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									role="img"
									aria-label="Copied"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							) : (
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									role="img"
									aria-label="Share"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
									/>
								</svg>
							)}
						</button>
					</div>

					<div className="bg-gray-900 border border-gray-600 rounded-md p-4 sm:p-6">
						<MarkdownRenderer content={recipe.formattedText} />
					</div>
				</div>
			</div>
		</div>
	)
}
