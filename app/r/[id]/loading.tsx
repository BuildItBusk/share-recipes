export default function Loading() {
	return (
		<div className="min-h-screen bg-black flex items-center justify-center">
			<div className="text-center space-y-4">
				<div className="spinner mx-auto" />
				<p className="text-white text-lg">Loading recipe...</p>
			</div>
		</div>
	)
}
