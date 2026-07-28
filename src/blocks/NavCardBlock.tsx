'use client'

import { Image } from '../components/ui-primitives'
import { NavCard, type NavCardBackground, type NavCardSize } from '../components/NavCard'

export type NavCardBlockSize = 'xs' | 's' | 'm'
export type NavCardBlockBackground = 'light' | 'white'

export interface NavCardBlockProps {
	title?: string | null
	/** Illustration image URL (rendered to fill the icon box). Unused by the `xs` size. */
	imageUrl?: string | null
	imageAlt?: string | null
	size?: NavCardBlockSize | null
	background?: NavCardBlockBackground | null
	href?: string | null
}

const sizeMap: Record<NavCardBlockSize, NavCardSize> = { xs: 'XS', s: 'S', m: 'M' }
const backgroundMap: Record<NavCardBlockBackground, NavCardBackground> = { light: 'light', white: 'white' }

export function NavCardBlock({ title, imageUrl, imageAlt, size, background, href }: NavCardBlockProps) {
	const icon = imageUrl ? <Image src={imageUrl} alt={imageAlt ?? ''} width={68} height={68} className="size-full object-contain" /> : null
	return (
		<NavCard
			title={title || 'Rozcestník'}
			icon={icon}
			size={size ? sizeMap[size] : 'M'}
			background={background ? backgroundMap[background] : 'light'}
			href={href ?? undefined}
		/>
	)
}
