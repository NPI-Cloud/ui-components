'use client'

// Editor-canvas marker bars for the carousel group — same visual language as the flex and tabs
// markers. Neither produces output on the live website.

import { pluralizeItems } from './pluralize-items'

export function CarouselStartBlock({ perView, itemCount }: { perView: number; itemCount?: number }) {
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
				<rect x="6" y="4" width="12" height="16" rx="2" />
				<path d="M2 7v10" />
				<path d="M22 7v10" />
			</svg>
			<span>Carousel · {perView} na desktopu{itemCount != null ? ` · ${itemCount} ${pluralizeItems(itemCount)}` : ''}</span>
		</div>
	)
}

export function CarouselEndBlock() {
	return (
		<div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-slate-300">
			Konec carouselu
		</div>
	)
}
