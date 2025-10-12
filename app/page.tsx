import Image from "next/image"
import { RecipeProvider } from "./components/RecipeContext"
import RecipeTabs from "./components/RecipeTabs"

export default function Home() {
	return (
		<RecipeProvider>
			<div className="min-h-screen bg-black py-8">
				<div className="container mx-auto px-4">
					<header className="mb-8">
						<div className="flex items-center gap-2 max-w-4xl mx-auto">
							<Image
								src="/paste_recipe_logo.png"
								alt="Paste Recipe logo"
								width={48}
								height={48}
								priority
							/>
							<h1 className="text-2xl font-medium text-white">Paste Recipe</h1>
						</div>
					</header>
					<RecipeTabs />
				</div>
			</div>
		</RecipeProvider>
	)
}
