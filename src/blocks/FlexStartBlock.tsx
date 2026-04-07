export interface FlexStartBlockProps {
	flexRatio: string | null
}

export function FlexStartBlock({ flexRatio }: FlexStartBlockProps) {
	const ratio = flexRatio || '1:1'
	const parts = ratio.split(':')
	return (
		<div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 border-dashed rounded-t-md text-xs text-blue-600 font-medium">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<line x1="9" y1="3" x2="9" y2="21" />
			</svg>
			Sloupce {parts.length}× ({ratio})
		</div>
	)
}
