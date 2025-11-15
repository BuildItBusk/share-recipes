"use client"

import FormattedRecipe from "./FormattedRecipe"
import PasteRecipe from "./PasteRecipe"
import { useRecipe } from "./RecipeContext"
import UrlRecipe from "./UrlRecipe"

export default function RecipeTabs() {
	const { activeTab, setActiveTab } = useRecipe()

	const tabs = [
		{ id: "paste", label: "Paste Recipe" },
		{ id: "url", label: "Recipe URL" },
		{ id: "formatted", label: "Formatted Recipe" },
	]

	return (
		<div className="w-full max-w-4xl mx-auto">
			<div className="border-b border-gray-600 mb-6">
				<nav className="-mb-px flex space-x-8">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							type="button"
							onClick={() => setActiveTab(tab.id as "paste" | "url" | "formatted")}
							className={`py-2 px-1 border-b-2 font-medium text-sm ${
								activeTab === tab.id
									? "border-white text-white"
									: "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-400"
							} transition-colors`}
						>
							{tab.label}
						</button>
					))}
				</nav>
			</div>

			<div className="min-h-96">
				{activeTab === "paste" && <PasteRecipe />}
				{activeTab === "url" && <UrlRecipe />}
				{activeTab === "formatted" && <FormattedRecipe />}
			</div>
		</div>
	)
}
