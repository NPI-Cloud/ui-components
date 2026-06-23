'use client'

import { Link } from './ui-primitives'
import { clsx } from 'clsx'
import { forwardRef, Fragment } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Button } from './Button'
import { DownloadButton, type DownloadVariant } from './DownloadButton'
import { Heading } from './Heading'
import { Tag } from './Tag'
import { Text } from './Text'

export const cardAspects = ['16/9', '1/1', '4/3', '3/2', '3/4', 'line'] as const
export type CardAspect = (typeof cardAspects)[number]

export const cardIndicators = ['video', 'podcast', 'gallery'] as const
export type CardIndicator = (typeof cardIndicators)[number]

const aspectClassMap: Record<Exclude<CardAspect, 'line'>, string> = {
	'16/9': 'aspect-[16/9]',
	'1/1': 'aspect-square',
	'4/3': 'aspect-[4/3]',
	'3/2': 'aspect-[3/2]',
	'3/4': 'aspect-[3/4]',
}

const indicatorIconMap: Record<CardIndicator, IconName> = {
	video: 'video',
	podcast: 'podcast',
	gallery: 'galery',
}

// The indicator icon is decorative (aria-hidden), so the media type needs a text equivalent for AT.
const indicatorLabelMap: Record<CardIndicator, string> = {
	video: 'Video',
	podcast: 'Podcast',
	gallery: 'Galerie',
}

export interface CardLink {
	/** Visible label */
	label: string
	/** Optional href — when set the slot renders as an anchor with its own click target */
	href?: string
}

export interface CardCta extends CardLink {
	/** Optional icon rendered before the label (defaults to `stahnout` download icon) */
	iconBefore?: IconName
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Main heading. Required unless `visualOnly` is true. */
	title?: string
	/** Small caps label shown above the title */
	label?: string
	/** Meta info shown below the title, separated by bullets */
	meta?: string[]
	/** Body description text */
	description?: string
	/** Content for the visual area (image, video, etc.) */
	visual?: React.ReactNode
	/** Aspect ratio of the visual area. Use `'line'` for a thin colored bar instead of an image. */
	aspect?: CardAspect
	/** Hide the visual area entirely */
	hideVisual?: boolean
	/** Render a white-circle badge (bottom-right of visual area) with a media-type icon */
	indicator?: CardIndicator
	/** If provided, renders the whole card as a link with hover state */
	href?: string
	/** Drop the light drop-shadow for placement on dark backgrounds */
	inverted?: boolean
	/**
	 * Render only the visual (no text content). Used in 3-or-4-per-row gallery grids
	 * where the title/meta are baked into the artwork (e.g. podcast covers).
	 * `title` is used as the link's accessible label when `href` is set.
	 */
	visualOnly?: boolean
	/** Optional clickable tag rendered after the description (independent click target) */
	tag?: CardLink
	/** Optional tertiary CTA / download rendered at the bottom (independent click target) */
	cta?: CardCta
	/**
	 * Downloadable file rendered in the tertiary-CTA slot. Takes precedence over `cta` —
	 * single variant downloads directly; multiple variants open a format dropdown.
	 */
	download?: { label?: string; variants: DownloadVariant[] }
	/** Additional content rendered after the description (extra tags, custom CTAs, etc.) */
	children?: React.ReactNode
}

// The wrapper carries `@container` so the article (a descendant) can query its own width.
// CSS container queries can't self-reference: an element with `container-type` is queryable only by descendants.
// @md (≥28rem / 448px) → horizontal layout (M) with 32px outer padding + 32px gap (designer note 12:246)
// @4xl (≥56rem / 896px) → wider visual (L), same 32px outer padding + 32px gap (designer note 12:247)
const rootClass =
	'group relative flex w-full flex-col overflow-hidden rounded-npi-s bg-npi-white transition-shadow @md:flex-row @md:gap-npi-8 @md:p-npi-8'
const rootShadowClass = 'shadow-npi-m hover:shadow-npi-m-hover'

// Bumps the title to L-size typography (Bitter Regular 28px / level-4 spec) when the card is at @4xl width.
const titleClass = 'text-npi-blue @4xl:text-[1.75rem] @4xl:font-normal transition-colors'
const titleHoverClass = 'group-hover:text-npi-blue-hover'

export const Card = forwardRef<HTMLElement, CardProps>(({
	title,
	label,
	meta,
	description,
	visual,
	aspect,
	hideVisual = false,
	indicator,
	href,
	inverted = false,
	visualOnly = false,
	tag,
	cta,
	download,
	children,
	className,
	...props
}, ref) => {
	// Visual-only cards default to square (Figma "karty jen s vizuálem" / 12:184) since text is baked
	// into the artwork; standard cards default to 16:9.
	const resolvedAspect: CardAspect = aspect ?? (visualOnly ? '1/1' : '16/9')

	if (visualOnly) {
		const visualAspect: Exclude<CardAspect, 'line'> = resolvedAspect === 'line' ? '1/1' : resolvedAspect
		return (
			<article
				ref={ref}
				className={twMerge(
					clsx(
						// Capped at 1/3 of the layout (npi-layout = 1064px → ~354px) so the card sits naturally in a 3-per-row grid.
						'group relative block w-full max-w-[calc(var(--container-npi-layout)/3)] overflow-hidden rounded-npi-s bg-npi-white transition-shadow',
						!inverted && rootShadowClass,
						href && 'cursor-pointer',
						className,
					),
				)}
				{...props}
			>
				<div className={clsx('relative flex items-end justify-end bg-npi-blue-dark p-npi-2', aspectClassMap[visualAspect])}>
					{visual}
					{indicator && (
						<span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-npi-white p-npi-1 text-npi-blue">
							<Icon name={indicatorIconMap[indicator]} className="size-6" />
							<span className="sr-only">{indicatorLabelMap[indicator]}</span>
						</span>
					)}
					{href && (
						<Link
							href={href}
							aria-label={title}
							className="absolute inset-0 outline-none focus-visible:ring-4 focus-visible:ring-npi-blue-light"
						/>
					)}
				</div>
			</article>
		)
	}

	return (
		<div className="@container w-full">
			<article
				ref={ref}
				className={twMerge(
					clsx(
						rootClass,
						!inverted && rootShadowClass,
						href && 'cursor-pointer',
						className,
					),
				)}
				{...props}
			>
				{!hideVisual && (
					resolvedAspect === 'line'
						? <div aria-hidden className="h-npi-1 w-full shrink-0 bg-npi-blue-dark @md:h-auto @md:w-npi-1 @md:self-stretch" />
						: (
							<div
								className={clsx(
									'relative flex items-end justify-end bg-npi-blue-dark p-npi-2',
									// Narrow (S): full-width with caller-provided aspect, no inner radius (clipped by overflow-hidden)
									'w-full',
									aspectClassMap[resolvedAspect],
									// @md (M): 200px-wide visual on the left, 4px inner radius (designer note 12:246 — "volitelný poměr" = aspect kept configurable)
									'@md:w-npi-50 @md:shrink-0 @md:rounded-npi-xxs',
									// @4xl (L): wider 400px visual with bigger indicator inset (designer note 12:247 — also "volitelný poměr")
									'@4xl:w-[400px] @4xl:p-npi-4',
								)}
							>
								{visual}
								{indicator && (
									<span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-npi-white p-npi-1 text-npi-blue">
										<Icon name={indicatorIconMap[indicator]} className="size-6" />
									</span>
								)}
							</div>
						)
				)}
				<div className="flex w-full min-w-0 flex-col items-start gap-npi-4 px-npi-6 pt-npi-6 pb-npi-8 @md:flex-1 @md:p-0">
					{label && <Text variant="label">{label}</Text>}
					<Heading level={5} className={clsx(titleClass, href && titleHoverClass)}>
						{href
							? (
								<Link
									href={href}
									className='text-inherit no-underline outline-none focus-visible:ring-4 focus-visible:ring-npi-blue-light rounded-npi-xxs before:absolute before:inset-0 before:content-[""]'
								>
									{title}
								</Link>
							)
							: title}
					</Heading>
					{meta && meta.length > 0 && (
						// Inline with bullet separators when there's room. In the cramped horizontal band
						// (@md puts a 200px visual beside a still-narrow card) the row stacks vertically with
						// no dangling separator, then re-inlines once the text column is wide enough again (@2xl).
						<div className="flex w-full min-w-0 flex-row items-center gap-x-2.5 gap-y-1 @md:flex-col @md:items-start @2xl:flex-row @2xl:items-center">
							{meta.map((item, i) => (
								<Fragment key={i}>
									{i > 0 && <span aria-hidden className="block size-1.5 shrink-0 rounded-full bg-npi-gray-300 @md:hidden @2xl:block" />}
									<Text variant="l" secondary className="whitespace-nowrap @md:whitespace-normal @2xl:whitespace-nowrap">
										{item}
									</Text>
								</Fragment>
							))}
						</div>
					)}
					{description && <Text variant="l">{description}</Text>}
					{tag && (
						<div className="relative z-10">
							<Tag size="S" label={tag.label} href={tag.href} />
						</div>
					)}
					{download && download.variants.length > 0
						? (
							<div className="relative z-10">
								<DownloadButton label={download.label ?? cta?.label ?? 'Stáhnout'} variants={download.variants} />
							</div>
						)
						: cta && (
							<div className="relative z-10">
								<Button
									variant="tertiary"
									label={cta.label}
									iconBefore={cta.iconBefore ?? 'stahnout'}
									href={cta.href}
								/>
							</div>
						)}
					{children}
				</div>
			</article>
		</div>
	)
})
Card.displayName = 'Card'
