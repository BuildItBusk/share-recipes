"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import MarkdownRenderer from "@/app/components/MarkdownRenderer"
import { formatRecipeForObsidian } from "@/app/lib/markdown-export"

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
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const shareUrl = `${typeof window !== "undefined" ? window.location.href : ""}`

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false)
			}
		}

		if (isDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside)
			return () => {
				document.removeEventListener("mousedown", handleClickOutside)
			}
		}
	}, [isDropdownOpen])

	const copyUrlToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl)
			setCopySuccess(true)
			setIsDropdownOpen(false)
			setTimeout(() => setCopySuccess(false), 2000)
		} catch (error) {
			console.error("Failed to copy URL to clipboard:", error)
			alert("Failed to copy URL to clipboard")
		}
	}

	const copyMarkdownToClipboard = async () => {
		try {
			const markdown = formatRecipeForObsidian(
				recipe.formattedText,
				recipe.id,
				recipe.createdAt,
				shareUrl,
			)
			await navigator.clipboard.writeText(markdown)
			setCopySuccess(true)
			setIsDropdownOpen(false)
			setTimeout(() => setCopySuccess(false), 2000)
		} catch (error) {
			console.error("Failed to copy markdown to clipboard:", error)
			alert("Failed to copy markdown to clipboard")
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
							alt="Paste Recipe logo"
							width={40}
							height={40}
							className="sm:w-12 sm:h-12"
							priority
						/>
						<h1 className="text-xl sm:text-2xl font-medium text-white">Paste Recipe</h1>
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
						<div className="relative" ref={dropdownRef}>
							<button
								type="button"
								onClick={() => setIsDropdownOpen(!isDropdownOpen)}
								className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-md transition-colors flex items-center gap-2"
								title={copySuccess ? "Copied!" : "Share This Recipe"}
							>
								{copySuccess ? (
									<>
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
										<span className="text-sm font-medium text-green-400">Copied!</span>
									</>
								) : (
									<>
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
										<span className="text-sm font-medium">Share</span>
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											role="img"
											aria-label="Dropdown"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</>
								)}
							</button>
							{isDropdownOpen && !copySuccess && (
								<div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
									<div className="py-1">
										<button
											type="button"
											onClick={copyUrlToClipboard}
											className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center gap-2"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												role="img"
												aria-label="Link"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
												/>
											</svg>
											Copy Share Link
										</button>
										<button
											type="button"
											onClick={copyMarkdownToClipboard}
											className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 flex items-center gap-2"
										>
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
												role="img"
												aria-label="Markdown"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
											Copy as Markdown
										</button>
									</div>
								</div>
							)}
						</div>
					</div>

					<div className="bg-gray-900 border border-gray-600 rounded-md p-4 sm:p-6">
						<MarkdownRenderer content={recipe.formattedText} />
					</div>
				</div>
			</div>
		</div>
	)
}
