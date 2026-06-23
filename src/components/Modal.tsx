'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode, useCallback, useEffect, useId, useImperativeHandle, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface ModalProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, 'title' | 'open'> {
	/** Controlled open state — when `true`, the dialog is shown via the native top-layer (`showModal()`). */
	open: boolean
	/** Called when the user dismisses the dialog (close button, ESC key, or backdrop click). */
	onClose: () => void
	/** Heading rendered at the top of the dialog. Falsy values hide the heading. */
	title?: ReactNode
	/** Body content rendered between the title and the action row. */
	children?: ReactNode
	/** Action row rendered at the bottom — typically one or two `<Button>` elements. */
	actions?: ReactNode
	/** Click on the dimmed backdrop closes the dialog. Defaults to `true`. */
	closeOnBackdropClick?: boolean
	/** ESC key closes the dialog. Defaults to `true` (the native `<dialog>` cancel event). */
	closeOnEscape?: boolean
	/** Hide the close icon button in the top-right corner. */
	hideCloseButton?: boolean
	/** Override the close button aria-label. */
	closeLabel?: string
}

// Card chrome — white surface, 24px radius (`npi-l`), no shadow (just the 80% black overlay). `m-auto`
// centers the dialog inside the native top-layer viewport — the `<dialog>` is positioned by the user
// agent. `@container` makes the inner layout respond to the dialog's own width, so the modal scales
// from a comfortable phone layout up to the Figma desktop spec without depending on the viewport.
const dialogClass = '@container m-auto w-[880px] max-w-[calc(100vw-32px)] bg-npi-white rounded-npi-m '
	+ 'p-0 '
	// Native <dialog>::backdrop — translucent black overlay matching the Figma 80% black overlay.
	+ 'backdrop:bg-[rgba(0,0,0,0.8)] '
	+ 'open:flex open:flex-col '
	+ 'focus:outline-none'

// Padding scales up to the Figma 92px×72px desktop spec at @npi-tablet; on narrow dialogs it relaxes to
// 24px horizontal so the content isn't crushed. (92 has no exact npi step — 88/100 are 4px off — kept arbitrary.)
// Mobile top padding is 56px (not 40px) so the centered full-width title clears the close button — which
// sits at 24px inset + 24px tall = 48px bottom — by at least 8px. Tablet's 72px top already clears its 64px button.
const innerClass = 'flex flex-col items-center gap-npi-6 px-npi-6 pt-npi-14 pb-npi-10 @npi-tablet:px-[92px] @npi-tablet:py-npi-18'

const titleClass = 'min-w-full text-center font-npi-serif text-[1.5rem] leading-[1.2] font-normal text-npi-text-primary @npi-tablet:text-[2rem]'

// `flex flex-col items-center` centers block-level children (e.g. a form input) — `text-center` alone
// only centers inline/text content, leaving block elements pinned to the left.
const bodyClass = 'flex min-w-full flex-col items-center text-center font-npi-sans text-[1rem] leading-[1.5] font-normal text-npi-text-primary'

// Buttons stack full-width on a narrow dialog, then sit in a centered row from @npi-tablet up.
const actionsClass = 'flex w-full flex-col items-stretch gap-npi-3 @npi-tablet:w-auto @npi-tablet:flex-row @npi-tablet:items-start'

const closeButtonClass = 'absolute right-npi-6 top-npi-6 inline-flex size-6 cursor-pointer items-center justify-center text-npi-blue '
	+ '@npi-tablet:right-npi-10 @npi-tablet:top-npi-10 '
	+ 'outline-none transition-colors hover:text-npi-blue-hover '
	+ 'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light'

export const Modal = forwardRef<HTMLDialogElement, ModalProps>((props, ref) => {
	const {
		open,
		onClose,
		title,
		children,
		actions,
		closeOnBackdropClick = true,
		closeOnEscape = true,
		hideCloseButton = false,
		closeLabel = 'Zavřít',
		className,
		...rest
	} = props

	const internalRef = useRef<HTMLDialogElement | null>(null)
	useImperativeHandle(ref, () => internalRef.current as HTMLDialogElement, [])

	// Wire the heading as the dialog's accessible name — native `<dialog>` does not auto-associate it.
	const titleId = useId()

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

	// `cancel` fires on ESC. We intercept it so the parent stays the source of truth via `onClose`.
	const handleCancel = useCallback(
		(event: React.SyntheticEvent<HTMLDialogElement, Event>) => {
			event.preventDefault()
			if (closeOnEscape) onClose()
		},
		[closeOnEscape, onClose],
	)

	// `close` fires when the dialog is dismissed by the platform (e.g. ESC). Mirror it back
	// to `onClose` so the parent can clear its `open` state.
	const handleClose = useCallback(() => {
		if (open) onClose()
	}, [open, onClose])

	// Native `<dialog>`'s backdrop is part of the dialog element. Clicks on the backdrop
	// dispatch a click whose `target === currentTarget` — clicks on inner content do not.
	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLDialogElement>) => {
			if (!closeOnBackdropClick) return
			if (event.target === event.currentTarget) onClose()
		},
		[closeOnBackdropClick, onClose],
	)

	return (
		<dialog
			ref={internalRef}
			onCancel={handleCancel}
			onClose={handleClose}
			onClick={handleClick}
			aria-labelledby={title ? titleId : undefined}
			className={twMerge(clsx(dialogClass, className))}
			{...rest}
		>
			{/* Inner wrapper is `relative` so the absolutely-positioned close button anchors here. */}
			<div className={clsx('relative w-full', innerClass)}>
				{!hideCloseButton && (
					<button
						type="button"
						onClick={onClose}
						aria-label={closeLabel}
						className={closeButtonClass}
					>
						<Icon name="zavrit" className="size-6" aria-hidden="true" />
					</button>
				)}
				{title && <h2 id={titleId} className={titleClass}>{title}</h2>}
				{children && <div className={bodyClass}>{children}</div>}
				{actions && <div className={actionsClass}>{actions}</div>}
			</div>
		</dialog>
	)
})
Modal.displayName = 'Modal'
