'use client'

import { Image } from '../components/ui-primitives'
import { CardOffer, type CardOfferAction, type CardOfferDisplay, type CardOfferMetaItem } from '../components/CardOffer'
import { iconRegistryM, type IconName } from '../icons'
import type { ButtonBlockVariant } from './ButtonBlock'

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
	/** Icon before the CTA label (an iconRegistryM key). Unset keeps the CardOffer default ('stahnout'). */
	ctaIcon?: string | null
	/** Icon after the CTA label (an iconRegistryM key). */
	ctaIconAfter?: string | null
	/** Button look of the CTA. Unset keeps the card's small tertiary link. */
	ctaVariant?: ButtonBlockVariant | null
	/** Open the CTA destination in a new browser tab. */
	ctaNewTab?: boolean | null
}

const variantMap: Record<ButtonBlockVariant, NonNullable<CardOfferAction['variant']>> = {
	primary: 'primary',
	secondary: 'secondary',
	tertiary: 'tertiary',
	tertiarySmall: 'tertiary-s',
	icon: 'icon',
}

const DEFAULT_META_ICON: IconName = 'stitek'

const toIconName = (name: string | null | undefined): IconName =>
	name && name in iconRegistryM ? (name as IconName) : DEFAULT_META_ICON

export function CardOfferBlock(
	{ label, title, description, statusTag, display, meta, imageUrl, imageAlt, href, ctaLabel, ctaUrl, ctaIcon, ctaIconAfter, ctaVariant, ctaNewTab }:
		CardOfferBlockProps,
) {
	const metaItems: CardOfferMetaItem[] = (meta ?? []).flatMap(item => {
		const text = item?.text?.trim()
		if (!text) return []
		return [{ icon: toIconName(item.icon), text }]
	})

	const label_ = ctaLabel?.trim()
	// Unset icon stays undefined so CardOffer applies its own default; an unknown key falls back too.
	const ctaIconName = ctaIcon && ctaIcon in iconRegistryM ? (ctaIcon as IconName) : undefined
	const ctaIconAfterName = ctaIconAfter && ctaIconAfter in iconRegistryM ? (ctaIconAfter as IconName) : undefined
	const actions: CardOfferAction[] | undefined = label_
		? [{
			label: label_,
			href: ctaUrl ?? undefined,
			iconBefore: ctaIconName,
			iconAfter: ctaIconAfterName,
			variant: ctaVariant ? variantMap[ctaVariant] : undefined,
			newTab: ctaNewTab ?? false,
		}]
		: undefined

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
