'use client'

// Editor-canvas marker bars for the tabs group — same visual language as the flex markers
// (FlexStartBlock / FlexEndBlock). Neither produces output on the live website.

export function TabsStartBlock({ tabCount }: { tabCount?: number }) {
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
				<line x1="3" y1="9" x2="21" y2="9" />
				<line x1="10" y1="3" x2="10" y2="9" />
			</svg>
			<span>Záložky{tabCount != null ? ` · ${tabCount}` : ''}</span>
		</div>
	)
}

export function TabsEndBlock() {
	return (
		<div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-slate-300">
			Konec záložek
		</div>
	)
}
