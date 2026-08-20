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

// Distance between two neighbouring snap positions: slide width plus the track gap. Slides are
// uniform, so the offset delta of the first two covers them all; a single slide never scrolls.
const slideStride = (vp: HTMLDivElement): number => {
	const track = vp.firstElementChild
	const first = track?.children.item(0)
	const second = track?.children.item(1)
	return first instanceof HTMLElement && second instanceof HTMLElement
		? second.offsetLeft - first.offsetLeft
		: vp.clientWidth
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
			vp.scrollTo({ left: slideStride(vp) * index, behavior: 'smooth' })
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
					const stride = slideStride(vp)
					if (stride === 0) return
					const index = Math.max(0, Math.min(total - 1, Math.round(vp.scrollLeft / stride)))
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
						'self-stretch overflow-x-auto overflow-y-hidden snap-x snap-mandatory',
						'[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
						// The mask below makes this box a stacking context, so its shadow-headroom padding would sit
						// ABOVE later siblings in hit-testing and swallow clicks on the controls (and on content around
						// the carousel). pointer-events pass through the box itself; the track re-enables them, so
						// wheel/touch scrolling over the slides still reaches this scroller by bubbling.
						'pointer-events-none',
						// Headroom for slide content shadows (shadow-npi-m reaches ~25px above, ~70px below and ~45px
						// beside a card): the vertical padding and the widened box (-mx, matched by the track's px so
						// slides keep the layout width) keep the shadows inside the scrollport's clip, fading naturally
						// instead of being cut at the content edge. 24px matches the page's `px-npi-6` gutter, so the
						// box never overflows the viewport on mobile. The horizontal padding lives on the TRACK, not
						// here — end padding of a scroll container is excluded from its scrollable overflow, which
						// would leave the last slide's snap position unreachable. `scroll-pl` keeps snap positions on
						// the inset content edge, and the track gap keeps the neighbouring slide's shadow out of the
						// widened zone at rest.
						'pt-8 -mt-8 pb-20 -mb-20 -mx-npi-6 scroll-pl-npi-6',
						// Belt and suspenders for the shadow's faint tail at the scrollport's side edges: fade the
						// outermost 16px out instead of hard-clipping. Cards rest 24px in, so only shadows are faded.
						'[mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-16px),transparent)]',
						viewportClassName,
					))}
				>
					{/* px restores the 24px gutters the viewport's -mx removed (and sizes the w-full slides back to
					    the layout width). The slides overflow this fixed-width block, so the right padding never
					    lands after the LAST slide — the trailing ::after spacer extends the scrollable overflow so
					    the last slide's snap position stays reachable. */}
					<div className="flex gap-npi-16 px-npi-6 pointer-events-auto after:w-npi-6 after:shrink-0 after:content-['']">
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
