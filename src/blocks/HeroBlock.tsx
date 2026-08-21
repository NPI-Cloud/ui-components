'use client'

import { Image, Link } from '../components/ui-primitives'
import { clsx } from 'clsx'
import { pushCtaClick } from '../components/cta-tracking'
import { Heading } from '../components/Heading'
import { Text } from '../components/Text'
import { Icon } from '../icons'
import { type BlockCta, toIconName } from './BlockCta'

export const heroSizes = ['homepage11', 'homepage75', 'subpage21', 'subpage11'] as const
export type HeroSize = (typeof heroSizes)[number]

export interface HeroBlockProps {
	/** Main heading (H1) */
	heading?: string | null
	/** Description/perex paragraph under the heading */
	subtitle?: string | null
	/** Authored calls to action. Each renders only when it carries both a label and a destination. */
	primaryCta?: BlockCta | null
	secondaryCta?: BlockCta | null
	/** Image relation as it comes from Contember (manyHasOne Image) */
	image?: { url?: string | null } | null
	imageAlt?: string | null
	/** Layout variant — controls content/visual width split and visual aspect ratio. Schema enum values. */
	heroSize?: HeroSize | null
	/** When true, omit the visual column entirely (text-only intro). Content keeps the width dictated by `heroSize`. */
	hideVisual?: boolean | null
	/** Eager-load the visual as the LCP image (skip lazy-loading). Set when the hero is above the fold. */
	priority?: boolean
}

const baseCta =
	'inline-flex items-center justify-center rounded-npi-xxs px-npi-8 py-npi-3 min-w-npi-40 w-full @npi-tablet:w-auto font-npi-sans font-bold text-[1rem] leading-[1.6] transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-0 focus-visible:outline-[#ACCDFF]'
const primaryCtaClass = `${baseCta} bg-npi-blue text-npi-white hover:bg-npi-blue-hover`
const secondaryCtaClass = `${baseCta} bg-transparent border border-npi-blue text-npi-blue hover:border-npi-blue-hover hover:text-npi-blue-hover`

const sizeConfig: Record<HeroSize, { gridCols: string; visualAspect: string }> = {
	// 50/50 split, 4:3 visual — homepage default
	homepage11: { gridCols: '@npi-tablet:grid-cols-2', visualAspect: 'aspect-[4/3]' },
	// ~59/41 split, 4:3 visual — wider content for homepage with longer copy
	homepage75: { gridCols: '@npi-tablet:grid-cols-[59fr_41fr]', visualAspect: 'aspect-[4/3]' },
	// ~68/32 split, 4:3 visual — content-heavy subpage hero
	subpage21: { gridCols: '@npi-tablet:grid-cols-[68fr_32fr]', visualAspect: 'aspect-[4/3]' },
	// 50/50 split, 16:9 visual — compact subpage hero
	subpage11: { gridCols: '@npi-tablet:grid-cols-2', visualAspect: 'aspect-[16/9]' },
}

// The hero draws its CTAs in its own two looks; anything else the author picked falls back to the
// look of the slot the CTA sits in.
const ctaClass = (cta: BlockCta, slot: 'primary' | 'secondary'): string =>
	(cta.variant === 'primary' || cta.variant === 'secondary' ? cta.variant : slot) === 'primary' ? primaryCtaClass : secondaryCtaClass

// A CTA label with no URL would render a dead link, so a CTA only counts when it has both.
const HeroCta = ({ cta, slot }: { cta: BlockCta | null | undefined; slot: 'primary' | 'secondary' }) => {
	const label = cta?.label?.trim()
	if (!cta || !label || !cta.url) return null
	const iconBefore = toIconName(cta.iconBefore)
	const iconAfter = toIconName(cta.iconAfter)
	return (
		<Link
			href={cta.url}
			target={cta.newTab ? '_blank' : undefined}
			rel={cta.newTab ? 'noopener noreferrer' : undefined}
			onClick={() => pushCtaClick(cta.tracking)}
			className={clsx(ctaClass(cta, slot), 'gap-npi-2')}
		>
			{iconBefore && <Icon name={iconBefore} className="size-6 shrink-0" />}
			{label}
			{iconAfter && <Icon name={iconAfter} className="size-6 shrink-0" />}
		</Link>
	)
}

export function HeroBlock({
	heading,
	subtitle,
	primaryCta,
	secondaryCta,
	image,
	imageAlt,
	heroSize,
	hideVisual,
	priority,
}: HeroBlockProps) {
	const hasCta = Boolean((primaryCta?.label && primaryCta.url) || (secondaryCta?.label && secondaryCta.url))
	const config = sizeConfig[heroSize ?? 'homepage11']
	const imageUrl = image?.url
	// Without a visual the text would otherwise keep the (often 50/50) split dictated by `heroSize`,
	// leaving it cramped. A hero with no visual is always laid out 2:1 (text fills two thirds) so the
	// copy gets a wider, more readable column.
	const gridCols = hideVisual ? '@npi-tablet:grid-cols-[2fr_1fr]' : config.gridCols

	return (
		<section className={clsx('grid grid-cols-1 items-center gap-npi-8 @npi-tablet:gap-npi-10', gridCols)}>
			<div className="flex flex-col items-start gap-npi-6">
				{heading && <Heading level={1}>{heading}</Heading>}
				{subtitle && <Text variant="l">{subtitle}</Text>}
				{hasCta && (
					<div className="flex w-full flex-col gap-npi-4 @npi-tablet:w-auto @npi-tablet:flex-row">
						<HeroCta cta={primaryCta} slot="primary" />
						<HeroCta cta={secondaryCta} slot="secondary" />
					</div>
				)}
			</div>
			{!hideVisual && (
				<div className={clsx('relative w-full overflow-hidden', config.visualAspect)}>
					{imageUrl
						? (
							<Image
								src={imageUrl}
								alt={imageAlt ?? ''}
								fill
								sizes="(min-width: 768px) 50vw, 100vw"
								priority={priority}
								className="absolute inset-0 h-full w-full object-contain"
							/>
						)
						: (
							<div className="absolute inset-0 flex items-center justify-center bg-npi-blue-lighter">
								<Text variant="l" className="text-npi-text-primary">Visual</Text>
							</div>
						)}
				</div>
			)}
		</section>
	)
}
