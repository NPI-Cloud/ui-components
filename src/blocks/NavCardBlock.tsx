'use client'

import { Image } from '../components/ui-primitives'
import { NavCard, type NavCardSize } from '../components/NavCard'

export type NavCardBlockSize = 's' | 'm'

export interface NavCardBlockProps {
	title?: string | null
	/** Illustration image URL (rendered to fill the icon box) */
	imageUrl?: string | null
	imageAlt?: string | null
	size?: NavCardBlockSize | null
	href?: string | null
}

const sizeMap: Record<NavCardBlockSize, NavCardSize> = { s: 'S', m: 'M' }

export function NavCardBlock({ title, imageUrl, imageAlt, size, href }: NavCardBlockProps) {
	const icon = imageUrl ? <Image src={imageUrl} alt={imageAlt ?? ''} className="size-full object-contain" /> : null
	return (
		<NavCard
			title={title || 'Rozcestník'}
			icon={icon}
			size={size ? sizeMap[size] : 'M'}
			href={href ?? undefined}
		/>
	)
}
