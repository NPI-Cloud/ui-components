import { Card } from '../components/Card.js'

export interface CardBlockProps {
	title?: string | null
	label?: string | null
	description?: string | null
	meta?: string | null
	imageUrl?: string | null
	imageAlt?: string | null
	ctaLabel?: string | null
	ctaUrl?: string | null
}

const parseMeta = (raw: string | null | undefined): string[] | undefined => {
	if (!raw) return undefined
	const items = raw.split('\n').map(s => s.trim()).filter(Boolean)
	return items.length > 0 ? items : undefined
}

export function CardBlock({ title, label, description, meta, imageUrl, imageAlt, ctaLabel, ctaUrl }: CardBlockProps) {
	const visual = imageUrl
		? <img src={imageUrl} alt={imageAlt ?? ''} className="absolute inset-0 size-full object-cover" />
		: undefined
	const cta = ctaLabel ? { label: ctaLabel, href: ctaUrl ?? undefined } : undefined
	return (
		<Card
			title={title || 'Karta'}
			label={label ?? undefined}
			description={description ?? undefined}
			meta={parseMeta(meta)}
			visual={visual}
			hideVisual={!imageUrl}
			cta={cta}
		/>
	)
}
