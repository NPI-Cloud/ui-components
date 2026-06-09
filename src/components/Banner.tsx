'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Text } from './Text'

export const bannerTones = ['light', 'white', 'dark'] as const
export type BannerTone = (typeof bannerTones)[number]

export const bannerIndicators = ['video', 'podcast', 'gallery'] as const
export type BannerIndicator = (typeof bannerIndicators)[number]

export interface BannerAction {
	/** Visible label */
	label: string
	/** Navigation target — renders the CTA as `<a>` */
	href?: string
	/** Click handler — required when `href` is absent */
	onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export interface BannerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Background tone */
	tone?: BannerTone
	/** Small caps label above the title */
	label?: string
	/** Main heading */
	title: string
	/** Body description */
	description?: string
	/** Visual content (image, illustration). Placed into the visual box */
	visual?: React.ReactNode
	/** Hide the visual box entirely */
	hideVisual?: boolean
	/** Media-type indicator badge pinned to bottom-right of the visual */
	indicator?: BannerIndicator
	/** Primary CTA */
	primaryAction?: BannerAction
	/** Secondary CTA */
	secondaryAction?: BannerAction
	/** Renders the whole banner as a link. Ignored when any action is set */
	href?: string
}

const indicatorIconMap: Record<BannerIndicator, IconName> = {
	video: 'video',
	podcast: 'podcast',
	gallery: 'galery',
}

const toneRootClass: Record<BannerTone, string> = {
	light: 'bg-npi-bg-light',
	white: 'bg-npi-white',
	dark: 'bg-npi-blue-dark',
}

// Container-query driven layout. Breakpoints match the three Figma sizes:
//  - base (< @md / 448px): "S" — vertical stack, compact padding, h5 title
//  - @md (≥ 448px):        "M" — horizontal, mid padding, h5 title
//  - @4xl (≥ 896px):       "L" — horizontal, large padding/radius, h3 title
// `@container` lives on the wrapper, not the root, because CSS container queries can't self-reference.
const rootClass = 'flex w-full flex-col overflow-hidden gap-npi-8 px-npi-6 pt-npi-10 pb-npi-6 rounded-npi-m '
	+ '@md:flex-row @md:items-center @md:gap-npi-8 @md:p-npi-12 '
	+ '@4xl:gap-npi-14 @4xl:px-npi-16 @4xl:py-npi-12 @4xl:rounded-npi-l'

const visualClass = 'relative flex items-end justify-end overflow-hidden rounded-npi-xxs bg-npi-blue-lighter p-npi-2 '
	+ 'w-full aspect-[4/3] '
	+ '@md:w-npi-30 @md:h-[180px] @md:aspect-auto @md:shrink-0 '
	+ '@4xl:w-[340px] @4xl:h-[255px]'

const actionsClass = 'flex w-full flex-col gap-npi-4 [&>*]:w-full '
	+ '@md:w-auto @md:flex-row @md:flex-wrap @md:gap-npi-3 @md:[&>*]:w-auto'

// Banner heading scales with container width: H5 at narrow/mid, H3 at wide.
const titleClass = 'font-npi-serif font-medium text-[1.5rem] leading-[1.2] @4xl:text-[2rem] @4xl:font-normal'

const actionBaseClass =
	'inline-flex items-center justify-center gap-npi-2 rounded-npi-xxs px-npi-8 py-npi-3 min-w-npi-40 font-npi-sans font-bold text-[1rem] leading-[1.6] transition-colors no-underline focus-visible:outline-[3px] focus-visible:outline-offset-0 focus-visible:outline-[#ACCDFF] cursor-pointer'

const actionVariantClass = {
	primary: {
		default: 'bg-npi-blue text-npi-white hover:bg-npi-blue-hover active:bg-npi-blue-hover',
		inverted: 'bg-npi-white text-npi-blue hover:text-npi-blue-dark active:text-npi-blue-dark',
	},
	secondary: {
		default: 'bg-transparent border border-npi-blue text-npi-blue hover:border-npi-blue-hover hover:text-npi-blue-hover',
		inverted: 'bg-transparent border border-npi-white text-npi-white hover:border-npi-blue-light hover:text-npi-blue-light',
	},
} as const

function BannerActionButton({
	action,
	variant,
	inverted,
}: {
	action: BannerAction
	variant: 'primary' | 'secondary'
	inverted: boolean
}) {
	const className = twMerge(actionBaseClass, actionVariantClass[variant][inverted ? 'inverted' : 'default'])
	if (action.href) {
		return (
			<a href={action.href} onClick={action.onClick} className={className}>
				{action.label}
			</a>
		)
	}
	return (
		<button type="button" onClick={action.onClick} className={className}>
			{action.label}
		</button>
	)
}

export const Banner = forwardRef<HTMLElement, BannerProps>(({
	tone = 'light',
	label,
	title,
	description,
	visual,
	hideVisual = false,
	indicator,
	primaryAction,
	secondaryAction,
	href,
	className,
	...props
}, ref) => {
	const inverted = tone === 'dark'
	const hasActions = !!(primaryAction || secondaryAction)
	const asLink = !!href && !hasActions
	const Root = asLink ? 'a' : 'article'

	return (
		<div className="@container w-full">
			<Root
				ref={ref as React.Ref<HTMLElement & HTMLAnchorElement>}
				className={twMerge(
					clsx(
						rootClass,
						toneRootClass[tone],
						asLink && 'cursor-pointer no-underline transition-shadow hover:shadow-npi-m',
						className,
					),
				)}
				{...(asLink ? { href } : {})}
				{...props}
			>
				<div className="flex min-w-0 flex-1 flex-col gap-npi-6">
					<div className="flex flex-col gap-npi-4">
						{label && (
							<Text variant="label" inverted={inverted}>
								{label}
							</Text>
						)}
						<h3 className={clsx(titleClass, inverted ? 'text-white' : 'text-npi-text-primary')}>
							{title}
						</h3>
						{description && (
							<Text variant="l" inverted={inverted}>
								{description}
							</Text>
						)}
					</div>
					{hasActions && (
						<div className={actionsClass}>
							{primaryAction && <BannerActionButton action={primaryAction} variant="primary" inverted={inverted} />}
							{secondaryAction && <BannerActionButton action={secondaryAction} variant="secondary" inverted={inverted} />}
						</div>
					)}
				</div>
				{!hideVisual && (
					<div className={visualClass}>
						{visual}
						{indicator && (
							<span className="absolute bottom-npi-2 right-npi-2 flex size-10 shrink-0 items-center justify-center rounded-full bg-npi-white p-npi-1 text-npi-blue">
								<Icon name={indicatorIconMap[indicator]} className="size-6" />
							</span>
						)}
					</div>
				)}
			</Root>
		</div>
	)
})
Banner.displayName = 'Banner'
