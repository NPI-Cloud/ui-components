export function ColumnBlock({ label }: { label?: string }) {
	return (
		<div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 border border-blue-300 text-xs text-blue-700 font-semibold">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="12"
				height="12"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<line x1="12" y1="3" x2="12" y2="21" />
			</svg>
			{label ?? 'Další sloupec'}
		</div>
	)
}
