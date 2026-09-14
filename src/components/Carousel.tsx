'use client'

import { clsx } from 'clsx'
import { Children, forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { CarouselControls } from './CarouselControls'

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
	/**
	 * Slide nodes rendered in order. Each child becomes a snap slide — full width by default; narrow
	 * the slides with `slideClassName` to show several side by side. The carousel measures how many
	 * fit and pages by that many: the controls, the indicators and the snap points all move a whole
	 * page, and the last page aligns to the end so it never shows an empty gap.
	 */
	children: React.ReactNode
	/** Controlled current page index (0-based); a page is one slide while slides are full width */
	current?: number
	/** Initial current page index when uncontrolled */
	defaultCurrent?: number
	/** Called whenever the current page changes */
	onChange?: (index: number) => void
	/** Hide the built-in controls (render your own `CarouselControls` if needed) */
	hideControls?: boolean
	/** Extra class applied to the scrollable viewport */
	viewportClassName?: string
	/** Extra class applied to each slide wrapper */
	slideClassName?: string
	/** Gap between slides — a `gap-*` class; slide widths that share the row must account for it */
	gapClassName?: string
	/** aria-label for the carousel region */
	label?: string
	/** aria-label for the previous button */
	previousLabel?: string
	/** aria-label for the next button */
	nextLabel?: string
	/** aria-label for each indicator — receives the page index */
	slideLabel?: (index: number) => string
}

// `instanceof` against the element's own window — a carousel rendered into an iframe from its parent
// (the showcase) holds elements of the iframe's realm, which the parent's `HTMLElement` doesn't match.
const isHTMLElement = (node: Element | null | undefined): node is HTMLElement =>
	node != null && node instanceof (node.ownerDocument.defaultView ?? window).HTMLElement

// Distance between two neighbouring snap positions: slide width plus the track gap. Slides are
// uniform, so the offset delta of the first two covers them all; a single slide never scrolls.
const slideStride = (vp: HTMLDivElement): number => {
	const track = vp.firstElementChild
	const first = track?.children.item(0)
	const second = track?.children.item(1)
	return isHTMLElement(first) && isHTMLElement(second)
		? second.offsetLeft - first.offsetLeft
		: vp.clientWidth
}

// How many slides are fully in view at once, measured from the laid-out track so CSS alone decides
// (a breakpoint can change it). The track spans the viewport; its inline padding is the shadow gutter.
const visibleSlides = (vp: HTMLDivElement): number => {
	const track = vp.firstElementChild
	const first = track?.children.item(0)
	if (!isHTMLElement(track) || !isHTMLElement(first)) return 1
	const stride = slideStride(vp)
	if (stride <= 0) return 1
	const style = (track.ownerDocument.defaultView ?? window).getComputedStyle(track)
	const contentWidth = track.clientWidth - Number.parseFloat(style.paddingLeft) - Number.parseFloat(style.paddingRight)
	const gap = stride - first.offsetWidth
	return Math.max(1, Math.round((contentWidth + gap) / stride))
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
		gapClassName,
		label,
		previousLabel,
		nextLabel,
		slideLabel,
		...props
	}, ref) => {
		const slides = Children.toArray(children)
		const total = slides.length

		const viewportRef = useRef<HTMLDivElement>(null)
		const [visible, setVisible] = useState(1)
		const pages = Math.max(1, Math.ceil(total / visible))
		// The first slide of a page. The last page starts where its window ends on the last slide, so a
		// short final page shows the tail of the previous one instead of an empty gap.
		const lastStart = Math.max(0, total - visible)
		const pageStart = useCallback((page: number) => Math.min(page * visible, lastStart), [visible, lastStart])

		const isControlled = current !== undefined
		const [uncontrolled, setUncontrolled] = useState(defaultCurrent)
		const activeIndex = Math.max(0, Math.min(pages - 1, isControlled ? current : uncontrolled))
		const activeStart = pageStart(activeIndex)

		const lastEmittedRef = useRef(activeIndex)
		lastEmittedRef.current = activeIndex

		const emit = useCallback((index: number) => {
			if (index === lastEmittedRef.current) return
			if (!isControlled) setUncontrolled(index)
			onChange?.(index)
		}, [isControlled, onChange])

		const scrollToPage = useCallback((page: number) => {
			const vp = viewportRef.current
			if (!vp) return
			vp.scrollTo({ left: slideStride(vp) * pageStart(page), behavior: 'smooth' })
		}, [pageStart])

		const goTo = useCallback((page: number) => {
			const clamped = Math.max(0, Math.min(pages - 1, page))
			emit(clamped)
			scrollToPage(clamped)
		}, [pages, emit, scrollToPage])

		useEffect(() => {
			const vp = viewportRef.current
			if (!vp) return
			const measure = () => setVisible(visibleSlides(vp))
			measure()
			// The viewport's own window — a carousel rendered into an iframe from its parent must observe there.
			const observer = new (vp.ownerDocument.defaultView?.ResizeObserver ?? ResizeObserver)(measure)
			observer.observe(vp)
			// A slide's width can change while the viewport's doesn't (a breakpoint, late-loading styles).
			const first = vp.firstElementChild?.firstElementChild
			if (first) observer.observe(first)
			return () => observer.disconnect()
		}, [total])

		useEffect(() => {
			if (!isControlled) return
			scrollToPage(activeIndex)
		}, [isControlled, activeIndex, scrollToPage])

		useEffect(() => {
			const vp = viewportRef.current
			if (!vp) return
			let timer: ReturnType<typeof setTimeout> | null = null
			const onScroll = () => {
				if (timer) clearTimeout(timer)
				timer = setTimeout(() => {
					const stride = slideStride(vp)
					if (stride === 0) return
					const slide = Math.round(vp.scrollLeft / stride)
					const page = slide >= lastStart ? pages - 1 : Math.round(slide / visible)
					emit(Math.max(0, Math.min(pages - 1, page)))
				}, 120)
			}
			vp.addEventListener('scroll', onScroll, { passive: true })
			return () => {
				if (timer) clearTimeout(timer)
				vp.removeEventListener('scroll', onScroll)
			}
		}, [emit, pages, visible, lastStart])

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
					<div
						// `npi-*` spacing tokens don't tailwind-merge, so the default gap is swapped out, not overridden.
						className={clsx("flex px-npi-6 pointer-events-auto after:w-npi-6 after:shrink-0 after:content-['']", gapClassName ?? 'gap-npi-16')}
					>
						{slides.map((slide, i) => {
							const offscreen = i < activeStart || i >= activeStart + visible
							// Only page starts snap, so a swipe settles on a whole page like the controls do.
							const snaps = (i % visible === 0 && i <= lastStart) || i === lastStart
							return (
								<div
									key={i}
									role="group"
									aria-roledescription="slide"
									aria-label={`${i + 1} / ${total}`}
									aria-hidden={offscreen}
									// `inert` also removes off-screen slides from the tab order, so focusable
									// content in hidden slides can't be reached behind the ones in view.
									inert={offscreen}
									className={twMerge(clsx('shrink-0 w-full', snaps ? 'snap-start snap-always' : 'snap-align-none', slideClassName))}
								>
									{slide}
								</div>
							)
						})}
					</div>
				</div>
				{!hideControls && pages > 1 && (
					<CarouselControls
						total={pages}
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
