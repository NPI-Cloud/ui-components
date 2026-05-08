import { clsx } from 'clsx'
import {
	cloneElement,
	forwardRef,
	type HTMLAttributes,
	isValidElement,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from 'react'
import { twMerge } from 'tailwind-merge'

export const tooltipPlacements = ['top', 'right', 'bottom', 'left'] as const
export type TooltipPlacement = (typeof tooltipPlacements)[number]

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
	/** Trigger element — Tooltip wraps it. `aria-describedby` and listeners are attached to the focusable child element when possible. */
	children: ReactNode
	/** Tooltip body content. Plain text or rich nodes. */
	content: ReactNode
	/** Placement relative to the trigger. Defaults to `'top'`. */
	placement?: TooltipPlacement
	/** Delay before showing (ms). Defaults to `300`. */
	delayShow?: number
	/** Delay before hiding (ms). Defaults to `0`. */
	delayHide?: number
	/** Disables the tooltip — renders the trigger without any popup. */
	disabled?: boolean
	/** Force the tooltip open (uncontrolled escape hatch — useful for stories and visual tests). */
	forceOpen?: boolean
	/** Width of the tooltip body. Defaults to `300` (matches Figma). Pass a number for px or a CSS string. */
	width?: number | string
}

// Figma arrow path (16×8 viewBox): triangle pointing down from a horizontal top edge.
// We render two copies — one filled white (the body), one solid token-colored backdrop for the shadow.
// `drop-shadow` on the filled triangle alone clips at the body, so we apply it on the wrapper instead.
const ARROW_PATH = 'M8 8L0 0H16L8 8Z'

const placementBodyOffsetClass: Record<TooltipPlacement, string> = {
	top: 'bottom-full mb-npi-2',
	bottom: 'top-full mt-npi-2',
	left: 'right-full mr-npi-2',
	right: 'left-full ml-npi-2',
}

// Centered along the cross-axis relative to the trigger.
const placementBodyAlignClass: Record<TooltipPlacement, string> = {
	top: 'left-1/2 -translate-x-1/2',
	bottom: 'left-1/2 -translate-x-1/2',
	left: 'top-1/2 -translate-y-1/2',
	right: 'top-1/2 -translate-y-1/2',
}

const placementArrowPositionClass: Record<TooltipPlacement, string> = {
	top: 'top-full left-1/2 -translate-x-1/2',
	bottom: 'bottom-full left-1/2 -translate-x-1/2 rotate-180',
	left: 'left-full top-1/2 -translate-y-1/2 -rotate-90',
	right: 'right-full top-1/2 -translate-y-1/2 rotate-90',
}

export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>((props, ref) => {
	const {
		children,
		content,
		placement = 'top',
		delayShow = 300,
		delayHide = 0,
		disabled = false,
		forceOpen = false,
		width = 300,
		className,
		...rest
	} = props

	const tooltipId = useId()
	const [open, setOpen] = useState(false)
	const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	const clearTimers = useCallback(() => {
		if (showTimerRef.current) clearTimeout(showTimerRef.current)
		if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
		showTimerRef.current = null
		hideTimerRef.current = null
	}, [])

	useEffect(() => () => clearTimers(), [clearTimers])

	const show = useCallback(() => {
		if (disabled) return
		clearTimers()
		if (delayShow > 0) {
			showTimerRef.current = setTimeout(() => setOpen(true), delayShow)
		} else {
			setOpen(true)
		}
	}, [disabled, clearTimers, delayShow])

	const hide = useCallback(() => {
		clearTimers()
		if (delayHide > 0) {
			hideTimerRef.current = setTimeout(() => setOpen(false), delayHide)
		} else {
			setOpen(false)
		}
	}, [clearTimers, delayHide])

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Escape' && open) hide()
	}, [open, hide])

	const isOpen = forceOpen || open
	const widthStyle = typeof width === 'number' ? `${width}px` : width

	if (disabled) {
		return (
			<span ref={ref} className={twMerge(clsx('relative inline-flex', className))} {...rest}>
				{children}
			</span>
		)
	}

	// Inject ARIA + listeners onto the focusable trigger child so screen readers
	// announce the tooltip on focus and Escape works without relying on bubbling.
	// Compose with any handlers the child already has — never silently override.
	type TriggerProps = {
		'aria-describedby'?: string
		onMouseEnter?: (e: React.MouseEvent) => void
		onMouseLeave?: (e: React.MouseEvent) => void
		onFocus?: (e: React.FocusEvent) => void
		onBlur?: (e: React.FocusEvent) => void
		onKeyDown?: (e: React.KeyboardEvent) => void
	}

	let trigger: ReactNode
	if (isValidElement<TriggerProps>(children)) {
		const childElement = children as ReactElement<TriggerProps>
		const childProps = childElement.props
		const composedAriaDescribedBy = isOpen
			? [childProps['aria-describedby'], tooltipId].filter(Boolean).join(' ')
			: childProps['aria-describedby']
		trigger = cloneElement<TriggerProps>(childElement, {
			'aria-describedby': composedAriaDescribedBy,
			onMouseEnter: e => {
				childProps.onMouseEnter?.(e)
				show()
			},
			onMouseLeave: e => {
				childProps.onMouseLeave?.(e)
				hide()
			},
			onFocus: e => {
				childProps.onFocus?.(e)
				show()
			},
			onBlur: e => {
				childProps.onBlur?.(e)
				hide()
			},
			onKeyDown: e => {
				childProps.onKeyDown?.(e)
				handleKeyDown(e)
			},
		})
	} else {
		// Fallback: children is a string / Fragment / array that can't be cloned.
		// Wrap in a focusable span so the same a11y guarantees apply.
		trigger = (
			<span
				tabIndex={0}
				aria-describedby={isOpen ? tooltipId : undefined}
				onMouseEnter={show}
				onMouseLeave={hide}
				onFocus={show}
				onBlur={hide}
				onKeyDown={handleKeyDown}
			>
				{children}
			</span>
		)
	}

	return (
		<span
			ref={ref}
			className={twMerge(clsx('relative inline-flex', className))}
			{...rest}
		>
			{trigger}
			{isOpen && (
				<span
					role="tooltip"
					id={tooltipId}
					className={clsx(
						'pointer-events-none absolute z-50 flex flex-col items-center',
						placementBodyOffsetClass[placement],
						placementBodyAlignClass[placement],
					)}
					style={{ filter: 'drop-shadow(0 20px 22.5px #f0f0f0)' }}
				>
					<span
						className="block rounded-npi-xs bg-npi-white p-npi-6 font-npi-sans text-[1rem] leading-[1.5] text-npi-text-primary"
						style={{ width: widthStyle }}
					>
						{content}
					</span>
					<svg
						width="16"
						height="8"
						viewBox="0 0 16 8"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
						className={clsx('absolute block', placementArrowPositionClass[placement])}
					>
						<path d={ARROW_PATH} fill="currentColor" className="text-npi-white" />
					</svg>
				</span>
			)}
		</span>
	)
})
Tooltip.displayName = 'Tooltip'
