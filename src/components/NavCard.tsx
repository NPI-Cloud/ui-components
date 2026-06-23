'use client'

import { Link } from './ui-primitives'
import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Heading } from './Heading'

export const navCardSizes = ['S', 'M'] as const
export type NavCardSize = (typeof navCardSizes)[number]

export interface NavCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Title shown next to (S) or below (M) the illustration */
	title: string
	/** Illustration node — rendered in a fixed box (68px for M, 56px for S) */
	icon: React.ReactNode
	/** Layout: `M` stacks the icon above a centered title, `S` puts it left of the title. Defaults to `M`. */
	size?: NavCardSize
	/** When set, the whole card becomes a link */
	href?: string
}

// S = horizontal (icon left, title left, 8px radius), M = vertical (icon top, title centered, 16px radius).
const sizeClasses: Record<NavCardSize, string> = {
	S: 'flex-row items-center gap-npi-6 px-npi-6 py-npi-4 rounded-npi-xs',
	M: 'flex-col items-center gap-npi-4 p-npi-6 rounded-npi-s',
}

// Illustration box — 56px (S) lands on the spacing scale; 68px (M) is the design's fixed icon size, off-scale.
const iconClasses: Record<NavCardSize, string> = {
	S: 'size-npi-14',
	M: 'size-[68px]',
}

const titleClasses: Record<NavCardSize, string> = {
	S: 'flex-1 min-w-0',
	M: 'w-full text-center',
}

export const NavCard = forwardRef<HTMLElement, NavCardProps>(({ title, icon, size = 'M', href, className, ...props }, ref) => {
	const rootClass = twMerge(
		clsx(
			'group flex bg-npi-bg-light',
			href && 'cursor-pointer no-underline outline-none focus-visible:ring-4 focus-visible:ring-npi-blue-light',
			sizeClasses[size],
			className,
		),
	)

	const content = (
		<>
			<div className={clsx('shrink-0', iconClasses[size])}>{icon}</div>
			<Heading level={7} className={clsx('text-npi-blue transition-colors group-hover:text-npi-blue-hover', titleClasses[size])}>
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
