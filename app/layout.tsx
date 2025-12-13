import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "Paste Recipe - AI-Powered Recipe Formatter",
	description:
		"Format and share your recipes with AI. Paste any recipe text and get a beautifully formatted, shareable version instantly.",
	openGraph: {
		title: "Paste Recipe - AI-Powered Recipe Formatter",
		description:
			"Format and share your recipes with AI. Paste any recipe text and get a beautifully formatted, shareable version instantly.",
		url: "https://pasterecipe.com",
		siteName: "Paste Recipe",
		images: [
			{
				url: "/paste_recipe_logo.png",
				width: 1024,
				height: 1024,
				alt: "Paste Recipe Logo",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Paste Recipe - AI-Powered Recipe Formatter",
		description:
			"Format and share your recipes with AI. Paste any recipe text and get a beautifully formatted, shareable version instantly.",
		images: ["/paste_recipe_logo.png"],
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} antialiased`}>
				{children}
				<Analytics />
			</body>
		</html>
	)
}
