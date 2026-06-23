'use client'

import { Image } from '../components/ui-primitives'
import { Banner, type BannerIndicator, type BannerTone } from '../components/Banner'

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
	ctaLabel?: string | null
	ctaUrl?: string | null
	secondaryCtaLabel?: string | null
	secondaryCtaUrl?: string | null
}

export function BannerBlock({
	title,
	eyebrow,
	description,
	tone,
	indicator,
	imageUrl,
	imageAlt,
	ctaLabel,
	ctaUrl,
	secondaryCtaLabel,
	secondaryCtaUrl,
}: BannerBlockProps) {
	const visual = imageUrl
		? <Image src={imageUrl} alt={imageAlt ?? ''} fill sizes="(min-width: 768px) 340px, 100vw" className="absolute inset-0 size-full object-cover" />
		: undefined
	const primaryAction = ctaLabel ? { label: ctaLabel, href: ctaUrl ?? undefined } : undefined
	const secondaryAction = secondaryCtaLabel ? { label: secondaryCtaLabel, href: secondaryCtaUrl ?? undefined } : undefined
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
