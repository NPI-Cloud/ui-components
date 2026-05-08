import { clsx } from 'clsx'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface LightboxImage {
	/** Image URL — full-resolution source rendered inside the lightbox. */
	src: string
	/** Alt text for assistive technology. */
	alt: string
	/** Optional caption rendered below the image. */
	caption?: string
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
// the dim overlay — matching Figma's 80% black overlay (#000000 at 0.8 alpha).
//
// Backdrop value (`rgba(0,0,0,0.8)`) has no matching `npi-*` token — flagged in the audit response.
const dialogClass = 'm-0 size-full max-h-screen max-w-full bg-transparent p-0 '
	+ 'backdrop:bg-[rgba(0,0,0,0.8)] '
	+ 'open:flex open:items-center open:justify-center '
	+ 'focus:outline-none'

// Outer chevron-anchor layer: full viewport width, vertically centers its child. The prev/next
// chevrons are absolutely positioned against this layer so they can sit in the gutter outside
// the 1064px content stack on wide viewports while clamping to the screen edge on narrow ones.
const stageClass = 'relative flex h-full w-full items-center justify-center'

// Inner content stack: capped at the global NPI layout max (`max-w-npi-layout` = 1064px) per
// "Šířka je maximální stejně jako layout - 1 064 px". No horizontal padding so the image can
// actually reach 1064px wide. 64px (`py-npi-16`) top/bottom padding so portrait photos breathe
// per the Figma annotation "horní i spodní odsazení 64 px".
const contentStackClass = 'flex max-h-full w-full max-w-npi-layout flex-col items-center justify-center py-npi-16'

// The image fills the available content-stack space while preserving aspect ratio.
// `object-contain` keeps portrait photos within the 64px top/bottom safe-area; landscape photos
// fill width up to the 1064px cap.
const imageClass = 'block max-h-full max-w-full object-contain'

// Close: top-right, 40px right and 64px from the dialog top per the Figma annotations.
// `right-npi-10` = 40px, `top-npi-16` = 64px. White circular icon button using the existing
// inverted icon Button variant — no need to invent a new chrome here.
const closeButtonClass = 'absolute right-npi-10 top-npi-16 z-10'

// Prev/next chevrons sit 40px outside the 1064px content stack on wide viewports (so the chevron
// centre is in the gutter, matching the Figma annotation "40 px" between image edge and chevron
// centre). On narrower viewports we clamp them to a 16px screen edge minimum so they remain
// visible. Calc: half-viewport − half-stack (532px) − chevron-gap (40px) − chevron-half (20px) =
// `calc(50% - 532px - 60px)`. `max(<calc>, 16px)` keeps a 16px screen edge on narrow viewports.
const navButtonBaseClass = 'absolute top-1/2 -translate-y-1/2 z-10'
const prevButtonClass = `${navButtonBaseClass} left-[max(calc(50%-532px-60px),16px)]`
const nextButtonClass = `${navButtonBaseClass} right-[max(calc(50%-532px-60px),16px)]`

// Caption: white sans, centered, sits below the image. Mirrors the muted secondary tone
// used on inverted overlays elsewhere in the system.
const captionClass = 'mt-npi-4 text-center font-npi-sans text-[1rem] leading-[1.5] text-npi-white'

const NavButton = ({
	direction,
	onClick,
	label,
	className,
}: {
	direction: 'prev' | 'next'
	onClick: () => void
	label: string
	className: string
}) => (
	<button
		type="button"
		onClick={onClick}
		aria-label={label}
		className={clsx(
			className,
			'inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-npi-white text-npi-blue '
				+ 'transition-colors hover:text-npi-blue-hover '
				+ 'focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
		)}
	>
		<Icon name={direction === 'prev' ? 'sipkaVlevo' : 'sipkaVpravo'} className="size-6" aria-hidden="true" />
	</button>
)

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
					>
						<img src={current.src} alt={current.alt} className={imageClass} />
						{current.caption && <p className={captionClass}>{current.caption}</p>}
					</div>

					{hasMultiple && (
						<>
							<NavButton direction="prev" onClick={goPrev} label={prevLabel} className={prevButtonClass} />
							<NavButton direction="next" onClick={goNext} label={nextLabel} className={nextButtonClass} />
						</>
					)}

					<button
						type="button"
						onClick={onClose}
						aria-label={closeLabel}
						className={clsx(
							closeButtonClass,
							'inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-npi-white text-npi-blue '
								+ 'transition-colors hover:text-npi-blue-hover '
								+ 'focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
						)}
					>
						<Icon name="zavrit" className="size-6" aria-hidden="true" />
					</button>
				</div>
			)}
		</dialog>
	)
})
Lightbox.displayName = 'Lightbox'
