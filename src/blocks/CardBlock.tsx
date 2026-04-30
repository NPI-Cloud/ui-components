import { Card } from '../components/Card.js'

export interface CardBlockProps {
	title?: string | null
	label?: string | null
	description?: string | null
	imageUrl?: string | null
	imageAlt?: string | null
	ctaLabel?: string | null
	ctaUrl?: string | null
}

export function CardBlock({ title, label, description, imageUrl, imageAlt, ctaLabel, ctaUrl }: CardBlockProps) {
	const visual = imageUrl
		? <img src={imageUrl} alt={imageAlt ?? ''} className="absolute inset-0 size-full object-cover" />
		: undefined
	const cta = ctaLabel ? { label: ctaLabel, href: ctaUrl ?? undefined } : undefined
	return (
		<Card
			title={title || 'Karta'}
			label={label ?? undefined}
			description={description ?? undefined}
			visual={visual}
			hideVisual={!imageUrl}
			cta={cta}
		/>
	)
}
