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
