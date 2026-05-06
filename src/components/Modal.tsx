import { clsx } from 'clsx'
import { forwardRef, type ReactNode, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
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

// Card chrome — white surface, 24px radius (`npi-l`), Shadow M (`#F0F0F0` 0 20 45 0).
// `drop-shadow-[…]` follows the rounded corners cleanly. `m-auto` centers the dialog inside
// the native top-layer viewport — the `<dialog>` is positioned by the user agent.
const dialogClass = 'm-auto w-[880px] max-w-[calc(100vw-32px)] bg-npi-white rounded-npi-m '
	+ 'p-0 drop-shadow-[0px_20px_22.5px_#F0F0F0] '
	// Native <dialog>::backdrop — translucent black overlay matching the Figma 80% black overlay.
	+ 'backdrop:bg-[rgba(0,0,0,0.8)] '
	+ 'open:flex open:flex-col '
	+ 'focus:outline-none'

// Internal padding uses the Figma 92px×72px spec. 92 has no exact npi step (88/100 are the
// neighbors, 4px off). Kept as arbitrary value and flagged as a token gap.
const innerClass = 'flex flex-col items-center gap-npi-6 px-[92px] py-npi-18'

const titleClass = 'min-w-full text-center font-npi-serif text-[2rem] leading-[1.2] font-normal text-npi-text-primary'

const bodyClass = 'min-w-full text-center font-npi-sans text-[1rem] leading-[1.5] font-normal text-npi-text-primary'

const actionsClass = 'flex items-start gap-npi-3'

const closeButtonClass = 'absolute right-npi-10 top-npi-10 inline-flex size-6 cursor-pointer items-center justify-center text-npi-blue '
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
				{title && <h2 className={titleClass}>{title}</h2>}
				{children && <div className={bodyClass}>{children}</div>}
				{actions && <div className={actionsClass}>{actions}</div>}
			</div>
		</dialog>
	)
})
Modal.displayName = 'Modal'
