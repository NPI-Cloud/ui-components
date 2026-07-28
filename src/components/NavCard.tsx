'use client'

import { Link } from './ui-primitives'
import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import { Heading } from './Heading'
import { Text } from './Text'

export const navCardSizes = ['XS', 'S', 'M'] as const
export type NavCardSize = (typeof navCardSizes)[number]

export const navCardBackgrounds = ['light', 'white'] as const
export type NavCardBackground = (typeof navCardBackgrounds)[number]

export interface NavCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Title shown next to (S) or below (M) the illustration, or alone on the row (XS) */
	title: string
	/** Illustration node — rendered in a fixed box (68px for M, 56px for S). Unused by `XS`, which carries a trailing arrow instead. */
	icon?: React.ReactNode
	/** Layout: `M` stacks the icon above a centered title, `S` puts it left of the title, `XS` is an icon-less row with a trailing arrow. Defaults to `M`. */
	size?: NavCardSize
	/** Surface: `light` is the flat light-gray card, `white` lifts it off the page with a drop shadow. Defaults to `light`. */
	background?: NavCardBackground
	/** When set, the whole card becomes a link */
	href?: string
}

// XS = icon-less row with a trailing arrow (8px radius), S = horizontal (icon left, title left, 8px radius),
// M = vertical (icon top, title centered, 16px radius). XS is asymmetric: 24px before the title, 16px after the arrow.
const sizeClasses: Record<NavCardSize, string> = {
	XS: 'flex-row items-center gap-npi-4 pl-npi-6 pr-npi-4 py-npi-4 rounded-npi-xs',
	S: 'flex-row items-center gap-npi-6 px-npi-6 py-npi-4 rounded-npi-xs',
	M: 'flex-col items-center gap-npi-4 p-npi-6 rounded-npi-s',
}

// Illustration box — 56px (S) lands on the spacing scale; 68px (M) is the design's fixed icon size, off-scale.
const iconClasses: Record<Exclude<NavCardSize, 'XS'>, string> = {
	S: 'size-npi-14',
	M: 'size-[68px]',
}

const backgroundClasses: Record<NavCardBackground, string> = {
	light: 'bg-npi-bg-light',
	white: 'bg-npi-white shadow-npi-sm',
}

const titleClasses: Record<NavCardSize, string> = {
	XS: 'flex-1 min-w-0 [word-break:break-word]',
	S: 'flex-1 min-w-0',
	M: 'w-full text-center',
}

export const NavCard = forwardRef<HTMLElement, NavCardProps>(({ title, icon, size = 'M', background = 'light', href, className, ...props }, ref) => {
	const rootClass = twMerge(
		clsx(
			'group flex',
			backgroundClasses[background],
			href && 'cursor-pointer no-underline outline-none focus-visible:ring-4 focus-visible:ring-npi-blue-light',
			sizeClasses[size],
			className,
		),
	)

	const hoverableBlue = 'text-npi-blue transition-colors group-hover:text-npi-blue-hover'

	// XS runs on a sans bold 16px title (S/M use the serif `Heading`), with a fixed 24px line box —
	// the row's 56px height depends on it, so it overrides Text `l`'s 1.6 leading.
	const content = size === 'XS'
		? (
			<>
				<Text variant="l" weight="bold" className={clsx('leading-[1.5]', hoverableBlue, titleClasses[size])}>
					{title}
				</Text>
				<Icon name="arrowVpravo" className={clsx('size-npi-6 shrink-0', hoverableBlue)} />
			</>
		)
		: (
			<>
				<div className={clsx('shrink-0', iconClasses[size])}>{icon}</div>
				<Heading level={7} className={clsx(hoverableBlue, titleClasses[size])}>
					{title}
				</Heading>
			</>
		)

	if (href) {
		return (
			<Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={rootClass} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
				{content}
			</Link>
		)
	}

	return (
		<div ref={ref as React.Ref<HTMLDivElement>} className={rootClass} {...props}>
			{content}
		</div>
	)
})
NavCard.displayName = 'NavCard'
