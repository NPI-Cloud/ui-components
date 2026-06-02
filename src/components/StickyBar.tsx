'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { InvertedContext } from '../utils/inverted-context'

export const stickyBarTones = ['light', 'inverted'] as const
export type StickyBarTone = (typeof stickyBarTones)[number]

export const stickyBarPositions = ['bottom', 'top'] as const
export type StickyBarPosition = (typeof stickyBarPositions)[number]

export interface StickyBarProps extends HTMLAttributes<HTMLElement> {
	/** Visual tone — `light` (subtle gray background, blue text) or `inverted` (blue background, white text). Defaults to `light`. */
	tone?: StickyBarTone
	/** Edge to pin against — `bottom` (default) or `top`. The bar uses `position: sticky`, so the parent must be a scroll container. */
	position?: StickyBarPosition
	/** Bar content — consumers compose `Heading`, `Text`, `Button`, etc. inside the bar. The default inner layout is a single horizontal row centered at `max-w-npi-layout` with `gap-npi-6`. */
	children: ReactNode
}

// Bar background spans the full viewport width and sticks to one edge of the scroll parent.
// The 84px height matches the Figma frame (not on the npi spacing scale, so it lands in `h-[84px]`),
// but only from `@npi-tablet` up where the bar is a single row. Below that the content stacks, so the
// height is driven by `py-npi-6` instead and the bar grows to fit. Responsive switches use container
// queries to match the rest of the library (Heading, Banner).
const rootClass = 'sticky z-40 flex w-full items-center justify-center bg-npi-bg-light px-npi-6 py-npi-6 @npi-tablet:px-npi-12 @npi-tablet:py-0 @npi-tablet:h-[84px]'

const toneClass: Record<StickyBarTone, string> = {
	light: 'bg-npi-bg-light text-npi-text-primary',
	inverted: 'bg-npi-blue text-npi-white',
}

const positionClass: Record<StickyBarPosition, string> = {
	bottom: 'bottom-0',
	top: 'top-0',
}

// Inner layout is centered at the NPI 1064px layout width to match the website's content column.
// On narrow widths the children stack so a full-width primary button (Button is `w-full` on mobile)
// lands at the bottom and never clips; from `@npi-tablet` up it collapses to the single centered row.
const innerClass = 'flex w-full max-w-npi-layout flex-col items-stretch gap-npi-4 @npi-tablet:flex-row @npi-tablet:items-center @npi-tablet:justify-center @npi-tablet:gap-npi-6'

export const StickyBar = forwardRef<HTMLElement, StickyBarProps>(({
	tone = 'light',
	position = 'bottom',
	className,
	children,
	...props
}, ref) => {
	return (
		<aside
			ref={ref}
			className={twMerge(clsx(rootClass, toneClass[tone], positionClass[position], className))}
			{...props}
		>
			{/* `tone` is the single source of truth: an inverted bar tells the Heading/Text/Button inside
			    it to render on a dark background, so callers don't thread `inverted` onto every child. */}
			<InvertedContext.Provider value={tone === 'inverted'}>
				<div className={innerClass}>
					{children}
				</div>
			</InvertedContext.Provider>
		</aside>
	)
})
StickyBar.displayName = 'StickyBar'
