'use client'

import { clsx } from 'clsx'
import { Children, forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { CarouselControls } from './CarouselControls'

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
	/** Slide nodes rendered in order. Each child becomes a full-width snap slide. */
	children: React.ReactNode
	/** Controlled current slide index (0-based) */
	current?: number
	/** Initial current slide index when uncontrolled */
	defaultCurrent?: number
	/** Called whenever the current slide changes */
	onChange?: (index: number) => void
	/** Hide the built-in controls (render your own `CarouselControls` if needed) */
	hideControls?: boolean
	/** Extra class applied to the scrollable viewport */
	viewportClassName?: string
	/** Extra class applied to each slide wrapper */
	slideClassName?: string
	/** aria-label for the carousel region */
	label?: string
	/** aria-label for the previous button */
	previousLabel?: string
	/** aria-label for the next button */
	nextLabel?: string
	/** aria-label for each indicator — receives the slide index */
	slideLabel?: (index: number) => string
}

export const Carousel = forwardRef<HTMLElement, CarouselProps>(
	({
		children,
		current,
		defaultCurrent = 0,
		onChange,
		hideControls,
		className,
		viewportClassName,
		slideClassName,
		label,
		previousLabel,
		nextLabel,
		slideLabel,
		...props
	}, ref) => {
		const slides = Children.toArray(children)
		const total = slides.length

		const isControlled = current !== undefined
		const [uncontrolled, setUncontrolled] = useState(defaultCurrent)
		const activeIndex = isControlled ? Math.max(0, Math.min(total - 1, current)) : uncontrolled

		const viewportRef = useRef<HTMLDivElement>(null)
		const lastEmittedRef = useRef(activeIndex)
		lastEmittedRef.current = activeIndex

		const emit = useCallback((index: number) => {
			if (index === lastEmittedRef.current) return
			if (!isControlled) setUncontrolled(index)
			onChange?.(index)
		}, [isControlled, onChange])

		const scrollToIndex = useCallback((index: number) => {
			const vp = viewportRef.current
			if (!vp) return
			vp.scrollTo({ left: vp.clientWidth * index, behavior: 'smooth' })
		}, [])

		const goTo = useCallback((index: number) => {
			const clamped = Math.max(0, Math.min(total - 1, index))
			emit(clamped)
			scrollToIndex(clamped)
		}, [total, emit, scrollToIndex])

		useEffect(() => {
			if (!isControlled) return
			scrollToIndex(activeIndex)
		}, [isControlled, activeIndex, scrollToIndex])

		useEffect(() => {
			const vp = viewportRef.current
			if (!vp) return
			let timer: ReturnType<typeof setTimeout> | null = null
			const onScroll = () => {
				if (timer) clearTimeout(timer)
				timer = setTimeout(() => {
					if (vp.clientWidth === 0) return
					const index = Math.max(0, Math.min(total - 1, Math.round(vp.scrollLeft / vp.clientWidth)))
					emit(index)
				}, 120)
			}
			vp.addEventListener('scroll', onScroll, { passive: true })
			return () => {
				if (timer) clearTimeout(timer)
				vp.removeEventListener('scroll', onScroll)
			}
		}, [emit, total])

		return (
			<section
				ref={ref}
				aria-roledescription="carousel"
				aria-label={label}
				className={twMerge(clsx('flex flex-col gap-npi-6 items-center', className))}
				{...props}
			>
				<div
					ref={viewportRef}
					className={twMerge(clsx(
						'w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory',
						'[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
						viewportClassName,
					))}
				>
					<div className="flex">
						{slides.map((slide, i) => (
							<div
								key={i}
								role="group"
								aria-roledescription="slide"
								aria-label={`${i + 1} / ${total}`}
								aria-hidden={i !== activeIndex}
								// `inert` also removes off-screen slides from the tab order, so focusable
								// content in hidden slides can't be reached behind the active one.
								inert={i !== activeIndex}
								className={twMerge(clsx('shrink-0 w-full snap-start snap-always', slideClassName))}
							>
								{slide}
							</div>
						))}
					</div>
				</div>
				{!hideControls && total > 1 && (
					<CarouselControls
						total={total}
						current={activeIndex}
						onPrevious={() => goTo(activeIndex - 1)}
						onNext={() => goTo(activeIndex + 1)}
						onSelect={goTo}
						previousLabel={previousLabel}
						nextLabel={nextLabel}
						slideLabel={slideLabel}
					/>
				)}
			</section>
		)
	},
)
Carousel.displayName = 'Carousel'
