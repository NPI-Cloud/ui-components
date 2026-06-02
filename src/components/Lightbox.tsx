'use client'

import { clsx } from 'clsx'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface LightboxImage {
	/** Image URL — full-resolution source rendered inside the lightbox. */
	src: string
	/** Alt text for assistive technology. */
	alt: string
}

export interface LightboxProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'open'> {
	/** Controlled open state — when `true`, the dialog is shown via the native top-layer (`showModal()`). */
	open: boolean
	/** Called when the user dismisses the lightbox (close button, ESC key, or backdrop click). */
	onClose: () => void
	/** Image set rendered in sequence. Navigation is hidden when there is a single image. */
	images: LightboxImage[]
	/** Currently displayed image — controlled. */
	index: number
	/** Called whenever the user navigates to a different image (prev/next, ArrowLeft/Right, Home/End). */
	onIndexChange: (index: number) => void
	/** Click on the dimmed backdrop closes the lightbox. Defaults to `true`. */
	closeOnBackdropClick?: boolean
	/** Override the close button aria-label. Defaults to `'Zavřít'`. */
	closeLabel?: string
	/** Override the previous-image aria-label. Defaults to `'Předchozí'`. */
	prevLabel?: string
	/** Override the next-image aria-label. Defaults to `'Další'`. */
	nextLabel?: string
}

// `<dialog>` lives in the top layer. We make it span the full viewport so the backdrop covers
// everything and the inner content can center freely. `bg-transparent` so only `::backdrop` paints
// the dim overlay — Figma's "Overlay 80% černá #000000" maps to `npi-black/80` (= rgba(0,0,0,0.8)).
// `overflow-hidden`: the dialog itself must never scroll. The image is clamped by `object-contain`
// + `max-h-full`, so content always fits the viewport; without this a vertical scrollbar appears on
// tall content and steals ~15px of width, shrinking the 1064px stack and pushing the close button
// off its 40px right offset.
const dialogClass = 'm-0 size-full max-h-screen max-w-full overflow-hidden bg-transparent p-0 '
	+ 'backdrop:bg-npi-black/80 '
	+ 'open:flex open:items-center open:justify-center '
	+ 'focus:outline-none'

// Positioning layer: fills the dialog and centers its child. The close button and the bottom nav
// pill are absolutely positioned against this layer.
const stageClass = 'relative flex h-full w-full items-center justify-center'

// Inner content stack: capped at the global NPI layout max (`max-w-npi-layout` = 1064px) per
// "Šířka je maximální stejně jako layout - 1 064 px". No horizontal padding so the image can
// actually reach 1064px wide. `h-full` (a *definite* height, unlike `max-h-full`) is what lets the
// image's percentage `max-height` resolve — without it a portrait photo keeps its natural height and
// gets clipped by the dialog. 64px top safe-area per Figma ("horní i spodní odsazení 64 px"); the
// bottom uses 100px so a full-height portrait clears the nav pill (which floats 40px off the bottom).
const contentStackClass = 'flex h-full w-full max-w-npi-layout flex-col items-center justify-center pt-npi-16 pb-npi-25'

// The image fills the available content-stack space while preserving aspect ratio. `object-contain`
// keeps the whole photo visible (letterboxed, never cropped); the definite-height parent above makes
// `max-h-full` actually clamp portrait photos to the viewport.
const imageClass = 'block max-h-full max-w-full object-contain'

// Overlay chrome follows the Figma icon-button style: white surfaces carrying blue glyphs. A soft
// shadow lifts the white chrome off the photo so it stays legible on bright images. The shared focus
// ring stays brand blue.
const chromeFocusRing = 'focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light'

// Close: pinned top-right per Figma ("CTA zavřít drží pozici v pravém horním rohu", 64px top / 40px
// right). White circle + blue X.
const closeButtonClass = 'absolute right-npi-10 top-npi-16 z-10 inline-flex size-10 cursor-pointer items-center '
	+ 'justify-center rounded-full bg-npi-white text-npi-blue shadow-npi-m '
	+ 'transition-colors hover:text-npi-blue-hover '
	+ chromeFocusRing

// Navigation: prev / position-counter / next grouped into one bottom-centered white pill, 40px off
// the bottom edge. This replaces the scattered gutter chevrons + lone corner X with a single cohesive
// unit that also answers "where am I in the set?" — and lands in the thumb zone on mobile.
// `select-none` so rapid/double clicks on the chevrons don't text-select the counter between them.
const navBarClass = 'absolute bottom-npi-10 left-1/2 z-10 flex -translate-x-1/2 select-none items-center gap-npi-1 '
	+ 'rounded-full bg-npi-white px-npi-2 py-npi-1 shadow-npi-m'

// Ghost icon buttons inside the white pill — the pill is the surface, so each button is borderless
// with just a subtle hover disc. Blue chevron glyphs (the `arrow*` icon family = a tail-less chevron).
const navIconButtonClass = 'inline-flex size-10 cursor-pointer items-center justify-center rounded-full '
	+ 'text-npi-blue transition-colors hover:bg-npi-blue/10 hover:text-npi-blue-hover '
	+ chromeFocusRing

// Position indicator — dark neutral text (not blue, so it reads as a label, not an action) with
// tabular figures so the pill width doesn't jitter as the index changes.
const navCounterClass = 'min-w-[3rem] px-npi-1 text-center font-npi-sans text-[0.875rem] '
	+ 'leading-none text-npi-text-primary tabular-nums'

export const Lightbox = forwardRef<HTMLDialogElement, LightboxProps>((props, ref) => {
	const {
		open,
		onClose,
		images,
		index,
		onIndexChange,
		closeOnBackdropClick = true,
		closeLabel = 'Zavřít',
		prevLabel = 'Předchozí',
		nextLabel = 'Další',
		className,
		...rest
	} = props

	const internalRef = useRef<HTMLDialogElement | null>(null)
	useImperativeHandle(ref, () => internalRef.current as HTMLDialogElement, [])

	// Start point of an in-progress touch gesture, used for swipe-to-navigate on mobile.
	const touchStartRef = useRef<{ x: number; y: number } | null>(null)

	// Drive the native dialog's open state via the `<dialog>` API.
	// `showModal()` puts the element in the top layer with focus trapping and inert background.
	useEffect(() => {
		const node = internalRef.current
		if (!node) return
		if (open && !node.open) {
			node.showModal()
		} else if (!open && node.open) {
			node.close()
		}
	}, [open])

	// Block background scroll while open ("Blokuje scroll pozadí"). `showModal()` makes the backdrop
	// inert but does not stop the underlying document from scrolling — wheel/touch still reach the
	// body on most engines — so we pin the owning document's body. `ownerDocument` keeps this correct
	// inside the showcase iframe (component JS runs in the parent window, DOM lives in the iframe).
	useEffect(() => {
		if (!open) return
		const body = internalRef.current?.ownerDocument.body
		if (!body) return
		const previousOverflow = body.style.overflow
		body.style.overflow = 'hidden'
		return () => {
			body.style.overflow = previousOverflow
		}
	}, [open])

	// Clamp index defensively so out-of-range parent state doesn't render `images[-1]`.
	const safeIndex = images.length === 0 ? 0 : Math.max(0, Math.min(index, images.length - 1))
	const current = images[safeIndex]
	const hasMultiple = images.length > 1

	const goPrev = useCallback(() => {
		if (!hasMultiple) return
		onIndexChange(safeIndex === 0 ? images.length - 1 : safeIndex - 1)
	}, [hasMultiple, images.length, onIndexChange, safeIndex])

	const goNext = useCallback(() => {
		if (!hasMultiple) return
		onIndexChange(safeIndex === images.length - 1 ? 0 : safeIndex + 1)
	}, [hasMultiple, images.length, onIndexChange, safeIndex])

	// Native ESC dispatches `cancel`. Intercept so the parent stays the source of truth.
	const handleCancel = useCallback(
		(event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
			event.preventDefault()
			onClose()
		},
		[onClose],
	)

	// Mirror native close events back to `onClose` so the parent clears its `open` flag.
	const handleClose = useCallback(() => {
		if (open) onClose()
	}, [open, onClose])

	// Backdrop click — clicks on the `<dialog>` itself (not its descendants) hit the backdrop.
	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLDialogElement>) => {
			if (!closeOnBackdropClick) return
			if (event.target === event.currentTarget) onClose()
		},
		[closeOnBackdropClick, onClose],
	)

	// Keyboard navigation (arrows, Home/End). ESC is handled by the platform via `onCancel`.
	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDialogElement>) => {
			if (!hasMultiple) return
			switch (event.key) {
				case 'ArrowLeft':
					event.preventDefault()
					goPrev()
					break
				case 'ArrowRight':
					event.preventDefault()
					goNext()
					break
				case 'Home':
					event.preventDefault()
					onIndexChange(0)
					break
				case 'End':
					event.preventDefault()
					onIndexChange(images.length - 1)
					break
			}
		},
		[goNext, goPrev, hasMultiple, images.length, onIndexChange],
	)

	// Swipe-to-navigate on mobile ("swipe na mobilu"): a horizontal drag moves through a gallery,
	// complementing the chevrons for the natural touch gesture on a phone.
	const handleTouchStart = useCallback((event: React.TouchEvent) => {
		const touch = event.touches[0]
		touchStartRef.current = { x: touch.clientX, y: touch.clientY }
	}, [])

	const handleTouchEnd = useCallback(
		(event: React.TouchEvent) => {
			const start = touchStartRef.current
			touchStartRef.current = null
			if (!start || !hasMultiple) return
			const touch = event.changedTouches[0]
			const dx = touch.clientX - start.x
			const dy = touch.clientY - start.y
			// Only act on a clearly horizontal swipe — ignore short drags and mostly-vertical gestures.
			if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return
			if (dx < 0) goNext()
			else goPrev()
		},
		[goNext, goPrev, hasMultiple],
	)

	return (
		<dialog
			ref={internalRef}
			onCancel={handleCancel}
			onClose={handleClose}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={twMerge(clsx(dialogClass, className))}
			{...rest}
		>
			{current && (
				<div className={stageClass}>
					{
						/* Inner content stack — capped at 1064px so the image can reach the Figma max
					    width on wide viewports. Clicks inside shouldn't bubble into the backdrop
					    click handler. */
					}
					<div
						className={contentStackClass}
						onClick={(event) => event.stopPropagation()}
						onTouchStart={handleTouchStart}
						onTouchEnd={handleTouchEnd}
					>
						{/* TODO: zoom is listed as a Figma capability ("Umožňuje … zoom") but is not
						    designed in detail and was deferred — the image renders without zoom/pan for now. */}
						<img src={current.src} alt={current.alt} className={imageClass} />
					</div>

					{hasMultiple && (
						<div className={navBarClass}>
							<button type="button" onClick={goPrev} aria-label={prevLabel} className={navIconButtonClass}>
								<Icon name="arrowVlevo" className="size-6" aria-hidden="true" />
							</button>
							<span
								className={navCounterClass}
								aria-live="polite"
								aria-label={`Obrázek ${safeIndex + 1} z ${images.length}`}
							>
								{safeIndex + 1} / {images.length}
							</span>
							<button type="button" onClick={goNext} aria-label={nextLabel} className={navIconButtonClass}>
								<Icon name="arrowVpravo" className="size-6" aria-hidden="true" />
							</button>
						</div>
					)}

					<button type="button" onClick={onClose} aria-label={closeLabel} className={closeButtonClass}>
						<Icon name="zavrit" className="size-6" aria-hidden="true" />
					</button>
				</div>
			)}
		</dialog>
	)
})
Lightbox.displayName = 'Lightbox'
