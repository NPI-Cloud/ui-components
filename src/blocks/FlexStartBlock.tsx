'use client'

export interface FlexStartBlockProps {
	flexRatio: string | null
}

export function FlexStartBlock({ flexRatio }: FlexStartBlockProps) {
	const ratio = flexRatio || '1:1'
	const parts = ratio.split(':')
	return (
		<div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-slate-400">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="11"
				height="11"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<line x1="9" y1="3" x2="9" y2="21" />
			</svg>
			<span>Sloupce {parts.length}× · {ratio}</span>
		</div>
	)
}
