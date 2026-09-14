'use client'

import { Children, type ReactNode } from 'react'
import { Carousel } from '../components/Carousel'

export const carouselBlockPerViewOptions = [1, 2, 3, 4] as const
export type CarouselBlockPerView = (typeof carouselBlockPerViewOptions)[number]

export interface CarouselBlockProps {
	/** Items side by side on desktop (1–4). Tablet shows at most 2, mobile always 1. Falls back to 1. */
	perView?: number | null
	/** Accessible name of the carousel region. */
	label?: string
	/** One child per carousel item, in order. */
	children: ReactNode
	className?: string
}

// Slide widths per desktop count — literal strings so the Tailwind scanner keeps them. A width
// subtracts the gaps sharing its row (`gap-npi-6` between slides, see `Carousel`'s `gapClassName`).
const slideClassByPerView: Record<CarouselBlockPerView, string> = {
	1: 'w-full',
	2: 'npi-tablet:w-[calc((100%_-_var(--spacing-npi-6))/2)]',
	3: 'npi-tablet:w-[calc((100%_-_var(--spacing-npi-6))/2)] npi-desktop:w-[calc((100%_-_2*var(--spacing-npi-6))/3)]',
	4: 'npi-tablet:w-[calc((100%_-_var(--spacing-npi-6))/2)] npi-desktop:w-[calc((100%_-_3*var(--spacing-npi-6))/4)]',
}

const normalizePerView = (raw: number | null | undefined): CarouselBlockPerView =>
	(carouselBlockPerViewOptions as readonly number[]).includes(raw ?? 0) ? (raw as CarouselBlockPerView) : 1

// Carousel group renderer shared by the public sites and the admin's read-only section view: every
// child is one item, paged by as many items as are in view. One item per view keeps the wide gap of the full-width
// carousel. Several use the 24px gap: `Carousel` keeps a 24px shadow gutter beside the layout width,
// so a narrower gap would show the next item's leading edge in it.
export function CarouselBlock({ perView, label = 'Posuvný obsah', children, className }: CarouselBlockProps) {
	const count = normalizePerView(perView)
	if (Children.toArray(children).length === 0) return null
	return (
		<Carousel
			label={label}
			className={className}
			slideClassName={slideClassByPerView[count]}
			gapClassName={count === 1 ? undefined : 'gap-npi-6'}
		>
			{children}
		</Carousel>
	)
}
