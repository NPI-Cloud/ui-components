'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

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
// The 84px height matches the Figma frame; not on the npi spacing scale, so the value lands in `h-[84px]`.
const rootClass = 'sticky z-40 flex w-full items-center justify-center bg-npi-bg-light px-npi-6 md:px-npi-12 h-[84px]'

const toneClass: Record<StickyBarTone, string> = {
	light: 'bg-npi-bg-light text-npi-text-primary',
	inverted: 'bg-npi-blue text-npi-white',
}

const positionClass: Record<StickyBarPosition, string> = {
	bottom: 'bottom-0',
	top: 'top-0',
}

// Inner row is centered at the NPI 1064px layout width to match the website's content column.
const innerClass = 'flex w-full max-w-npi-layout items-center justify-center gap-npi-6'

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
			<div className={innerClass}>
				{children}
			</div>
		</aside>
	)
})
StickyBar.displayName = 'StickyBar'
