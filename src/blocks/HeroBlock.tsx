'use client'

import { clsx } from 'clsx'
import { Heading } from '../components/Heading'
import { Text } from '../components/Text'

export const heroSizes = ['homepage11', 'homepage75', 'subpage21', 'subpage11'] as const
export type HeroSize = (typeof heroSizes)[number]

export interface HeroBlockProps {
	/** Main heading (H1) */
	heading?: string | null
	/** Description/perex paragraph under the heading */
	subtitle?: string | null
	/** Primary CTA label */
	ctaLabel?: string | null
	/** Primary CTA URL */
	ctaUrl?: string | null
	/** Optional secondary CTA label */
	secondaryCtaLabel?: string | null
	/** Optional secondary CTA URL */
	secondaryCtaUrl?: string | null
	/** Image relation as it comes from Contember (manyHasOne Image) */
	image?: { url?: string | null } | null
	imageAlt?: string | null
	/** Layout variant — controls content/visual width split and visual aspect ratio. Schema enum values. */
	heroSize?: HeroSize | null
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

export function HeroBlock({
	heading,
	subtitle,
	ctaLabel,
	ctaUrl,
	secondaryCtaLabel,
	secondaryCtaUrl,
	image,
	imageAlt,
	heroSize,
}: HeroBlockProps) {
	const hasCta = ctaLabel || secondaryCtaLabel
	const config = sizeConfig[heroSize ?? 'homepage11']
	const imageUrl = image?.url

	return (
		<section className={clsx('grid grid-cols-1 items-center gap-npi-8 @npi-tablet:gap-npi-10', config.gridCols)}>
			<div className="flex flex-col items-start gap-npi-6">
				{heading && <Heading level={1}>{heading}</Heading>}
				{subtitle && <Text variant="l">{subtitle}</Text>}
				{hasCta && (
					<div className="flex w-full flex-col gap-npi-4 @npi-tablet:w-auto @npi-tablet:flex-row">
						{ctaLabel && (
							<a href={ctaUrl ?? '#'} className={primaryCtaClass}>
								{ctaLabel}
							</a>
						)}
						{secondaryCtaLabel && (
							<a href={secondaryCtaUrl ?? '#'} className={secondaryCtaClass}>
								{secondaryCtaLabel}
							</a>
						)}
					</div>
				)}
			</div>
			<div className={clsx('relative w-full overflow-hidden', config.visualAspect)}>
				{imageUrl
					? (
						<img
							src={imageUrl}
							alt={imageAlt ?? ''}
							className="absolute inset-0 h-full w-full object-contain"
						/>
					)
					: (
						<div className="absolute inset-0 flex items-center justify-center bg-npi-blue-lighter">
							<Text variant="l" className="text-npi-text-primary">Visual</Text>
						</div>
					)}
			</div>
		</section>
	)
}
