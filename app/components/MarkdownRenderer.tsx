import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownRendererProps {
	content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				h1: (props) => (
					<h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white" {...props} />
				),
				h2: (props) => (
					<h2
						className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3 text-white"
						{...props}
					/>
				),
				h3: (props) => (
					<h3
						className="text-base sm:text-lg font-medium mt-3 sm:mt-4 mb-2 text-gray-200"
						{...props}
					/>
				),
				p: (props) => <p className="mb-2 sm:mb-3 text-gray-300 leading-relaxed" {...props} />,
				ul: (props) => (
					<ul
						className="list-disc list-inside space-y-1 mb-3 sm:mb-4 pl-2 sm:pl-0 text-gray-300"
						{...props}
					/>
				),
				ol: (props) => (
					<ol
						className="list-decimal list-inside space-y-1 mb-3 sm:mb-4 pl-2 sm:pl-0 text-gray-300"
						{...props}
					/>
				),
				li: (props) => <li className="ml-4 text-gray-300 leading-relaxed" {...props} />,
				hr: (props) => <hr className="my-3 sm:my-4 border-gray-600" {...props} />,
			}}
		>
			{content}
		</ReactMarkdown>
	)
}
