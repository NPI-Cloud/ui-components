'use client'

import { Image } from '../components/ui-primitives'
import { CardOffer, type CardOfferDisplay, type CardOfferMetaItem } from '../components/CardOffer'
import { iconRegistryM, type IconName } from '../icons'

export type CardOfferBlockDisplay = CardOfferDisplay

// One metadata row — `icon` is an iconRegistryM key stored as a plain string (mirrors the schema's
// JSON shape), `text` the label beside it. Unknown / missing icons fall back to a neutral tag glyph.
export interface CardOfferBlockMetaItem {
	icon?: string | null
	text?: string | null
}

export interface CardOfferBlockProps {
	label?: string | null
	title?: string | null
	description?: string | null
	statusTag?: string | null
	display?: CardOfferBlockDisplay | null
	meta?: CardOfferBlockMetaItem[] | null
	imageUrl?: string | null
	imageAlt?: string | null
	href?: string | null
	ctaLabel?: string | null
	ctaUrl?: string | null
}

const DEFAULT_META_ICON: IconName = 'stitek'

const toIconName = (name: string | null | undefined): IconName =>
	name && name in iconRegistryM ? (name as IconName) : DEFAULT_META_ICON

export function CardOfferBlock(
	{ label, title, description, statusTag, display, meta, imageUrl, imageAlt, href, ctaLabel, ctaUrl }: CardOfferBlockProps,
) {
	const metaItems: CardOfferMetaItem[] = (meta ?? []).flatMap(item => {
		const text = item?.text?.trim()
		if (!text) return []
		return [{ icon: toIconName(item.icon), text }]
	})

	const label_ = ctaLabel?.trim()
	const actions = label_ ? [{ label: label_, href: ctaUrl ?? undefined }] : undefined

	// Cover only renders @md up (CardOffer hides it on narrow cards, where the navy rule shows instead).
	const visual = imageUrl
		? <Image src={imageUrl} alt={imageAlt ?? ''} width={220} height={150} className="h-[120px] w-[180px] rounded-npi-s object-cover @4xl:h-[150px] @4xl:w-[220px]" />
		: undefined

	return (
		<CardOffer
			label={label ?? undefined}
			title={title || 'Název nabídky'}
			description={description ?? undefined}
			statusTag={statusTag ?? undefined}
			meta={metaItems.length > 0 ? metaItems : undefined}
			actions={actions}
			visual={visual}
			href={href ?? undefined}
			display={display ?? undefined}
		/>
	)
}
