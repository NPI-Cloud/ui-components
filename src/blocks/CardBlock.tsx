import { Card, type CardAspect, type CardIndicator } from '../components/Card.js'

// Persisted as enum keys in the schema (slashes aren't valid PG enum identifiers); map back to component values.
// `none` hides the visual area entirely instead of mapping to a Card aspect.
// `visualOnly` is a separate render mode (square cover-grid card, no text) — handled via `visualOnly` prop on Card.
export const cardBlockAspects = ['none', 'aspect169', 'aspect11', 'aspect43', 'aspect32', 'aspect34', 'line', 'visualOnly'] as const
export type CardBlockAspect = typeof cardBlockAspects[number]

const aspectMap: Record<Exclude<CardBlockAspect, 'none' | 'visualOnly'>, CardAspect> = {
	aspect169: '16/9',
	aspect11: '1/1',
	aspect43: '4/3',
	aspect32: '3/2',
	aspect34: '3/4',
	line: 'line',
}

export interface CardBlockProps {
	title?: string | null
	label?: string | null
	description?: string | null
	metaDate?: string | null
	metaText?: string | null
	imageUrl?: string | null
	imageAlt?: string | null
	aspect?: CardBlockAspect | null
	indicator?: CardIndicator | null
	tagLabel?: string | null
	tagUrl?: string | null
	href?: string | null
	ctaLabel?: string | null
	ctaUrl?: string | null
}

// ISO date (YYYY-MM-DD) → cs locale "23. 5. 2026". Falls back to raw input on invalid date.
const formatDate = (iso: string | null | undefined): string | undefined => {
	if (!iso) return undefined
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return iso
	return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })
}

const buildMeta = (date: string | null | undefined, text: string | null | undefined): string[] | undefined => {
	const items = [formatDate(date), text?.trim() || undefined].filter((v): v is string => Boolean(v))
	return items.length > 0 ? items : undefined
}

export function CardBlock(
	{ title, label, description, metaDate, metaText, imageUrl, imageAlt, aspect, indicator, tagLabel, tagUrl, href, ctaLabel, ctaUrl }: CardBlockProps,
) {
	const visual = imageUrl
		? <img src={imageUrl} alt={imageAlt ?? ''} className="absolute inset-0 size-full object-cover" />
		: undefined

	if (aspect === 'visualOnly') {
		return (
			<Card
				title={title ?? undefined}
				visualOnly
				visual={visual}
				indicator={indicator ?? undefined}
				href={href ?? undefined}
			/>
		)
	}

	const resolvedAspect = aspect && aspect !== 'none' ? aspectMap[aspect] : undefined
	// Explicit 'none' wins; otherwise show the visual area whenever the user has opted into one via aspect/indicator/image.
	// (Indicator on an aspected-but-imageless card renders a dark blue placeholder so the badge stays visible.)
	const hasVisualIntent = aspect !== 'none' && Boolean(resolvedAspect || indicator || imageUrl)
	const cta = ctaLabel ? { label: ctaLabel, href: ctaUrl ?? undefined } : undefined
	const tag = tagLabel ? { label: tagLabel, href: tagUrl ?? undefined } : undefined
	return (
		<Card
			title={title || 'Karta'}
			label={label ?? undefined}
			description={description ?? undefined}
			meta={buildMeta(metaDate, metaText)}
			visual={visual}
			hideVisual={!hasVisualIntent}
			aspect={resolvedAspect}
			indicator={indicator ?? undefined}
			tag={tag}
			href={href ?? undefined}
			cta={cta}
		/>
	)
}
