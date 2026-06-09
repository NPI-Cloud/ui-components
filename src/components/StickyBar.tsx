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
	/**
	 * Contextual content — consumers compose `Heading`, `Text`, `StatusIndicator`, etc. (e.g. product
	 * title and price). Shown inline on desktop; **hidden below `@npi-tablet`** so the bar collapses to
	 * just the `action` on mobile and doesn't eat the viewport.
	 */
	children?: ReactNode
	/**
	 * Persistent primary action (typically a `Button`). Always rendered — on mobile it is the *only*
	 * visible element (full-width); on desktop it sits at the end of the row next to `children`.
	 */
	action?: ReactNode
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
// From `@npi-tablet` up it is a single centered row; below that only the `action` shows (the context
// `children` are hidden), so the mobile bar is just a full-width button and stays compact.
const innerClass = 'flex w-full max-w-npi-layout items-center gap-npi-4 @npi-tablet:gap-npi-6'

// Context column (title, price, status, …): hidden on mobile, an inline row that grows on desktop.
const contextClass = 'hidden min-w-0 flex-1 items-center gap-npi-6 @npi-tablet:flex'

// Action (CTA): full-width on mobile where it is the sole element, intrinsic width on desktop.
// `flex flex-col` (default `items-stretch`) stretches the child button to the bar width on mobile.
const actionClass = 'flex w-full flex-col @npi-tablet:w-auto'

export const StickyBar = forwardRef<HTMLElement, StickyBarProps>(({
	tone = 'light',
	position = 'bottom',
	className,
	children,
	action,
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
					{children != null && <div className={contextClass}>{children}</div>}
					{action != null && <div className={actionClass}>{action}</div>}
				</div>
			</InvertedContext.Provider>
		</aside>
	)
})
StickyBar.displayName = 'StickyBar'
