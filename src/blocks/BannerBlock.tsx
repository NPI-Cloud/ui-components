'use client'

import { Image } from '../components/ui-primitives'
import { Banner, type BannerAction, type BannerActionVariant, type BannerIndicator, type BannerTone } from '../components/Banner'
import { type BlockCta, toIconName } from './BlockCta'

export type BannerBlockTone = BannerTone
export type BannerBlockIndicator = BannerIndicator

export interface BannerBlockProps {
	title?: string | null
	eyebrow?: string | null
	description?: string | null
	tone?: BannerBlockTone | null
	indicator?: BannerBlockIndicator | null
	imageUrl?: string | null
	imageAlt?: string | null
	/** Authored call to action. Rendered only when it carries a label. */
	primaryCta?: BlockCta | null
	secondaryCta?: BlockCta | null
}

// The banner draws its CTAs in its own two looks; anything else the author picked falls back to the
// look of the slot the CTA sits in.
const toBannerVariant = (variant: BlockCta['variant']): BannerActionVariant | undefined =>
	variant === 'primary' || variant === 'secondary' ? variant : undefined

const toBannerAction = (cta: BlockCta | null | undefined): BannerAction | undefined => {
	const label = cta?.label?.trim()
	if (!label) return undefined
	return {
		label,
		href: cta?.url ?? undefined,
		variant: toBannerVariant(cta?.variant),
		iconBefore: toIconName(cta?.iconBefore),
		iconAfter: toIconName(cta?.iconAfter),
		newTab: cta?.newTab ?? false,
	}
}

export function BannerBlock({
	title,
	eyebrow,
	description,
	tone,
	indicator,
	imageUrl,
	imageAlt,
	primaryCta,
	secondaryCta,
}: BannerBlockProps) {
	const visual = imageUrl
		? <Image src={imageUrl} alt={imageAlt ?? ''} fill sizes="(min-width: 768px) 340px, 100vw" className="absolute inset-0 size-full object-cover" />
		: undefined
	const primaryAction = toBannerAction(primaryCta)
	const secondaryAction = toBannerAction(secondaryCta)
	return (
		<Banner
			tone={tone ?? 'light'}
			label={eyebrow ?? undefined}
			title={title || 'Nadpis banneru'}
			description={description ?? undefined}
			visual={visual}
			hideVisual={!imageUrl}
			indicator={indicator ?? undefined}
			primaryAction={primaryAction}
			secondaryAction={secondaryAction}
		/>
	)
}
