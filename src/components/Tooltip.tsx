'use client'

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
	useLayoutEffect,
	useRef,
	useState,
} from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons/Icon'

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

// The arrow is a flex sibling of the body — flexbox keeps its flat base flush against
// the body edge for every placement, so it always stays visually connected to the bubble.
// We size the SVG to its on-screen orientation (16×8 for top/bottom, 8×16 for left/right)
// instead of rotating a 16×8 box: CSS `rotate` leaves the layout box un-rotated, which is
// what previously detached the arrow on the left/right placements.
const arrowGeometry: Record<TooltipPlacement, { width: number; height: number; viewBox: string; path: string }> = {
	// apex points toward the trigger; the flat base sits against the body.
	top: { width: 16, height: 8, viewBox: '0 0 16 8', path: 'M8 8L0 0H16Z' },
	bottom: { width: 16, height: 8, viewBox: '0 0 16 8', path: 'M8 0L16 8H0Z' },
	left: { width: 8, height: 16, viewBox: '0 0 8 16', path: 'M8 8L0 0V16Z' },
	right: { width: 8, height: 16, viewBox: '0 0 8 16', path: 'M0 8L8 0V16Z' },
}

// Container holds [body, arrow] as a flex stack, positioned so the arrow apex sits a small
// gap (npi-1 = 4px) away from the trigger. `mb/mt/mr/ml` is that gap; flexbox handles the
// body→arrow seam. Cross-axis is centered on the trigger.
const placementContainerClass: Record<TooltipPlacement, string> = {
	top: 'bottom-full mb-npi-1 left-1/2 -translate-x-1/2 flex-col',
	bottom: 'top-full mt-npi-1 left-1/2 -translate-x-1/2 flex-col',
	left: 'right-full mr-npi-1 top-1/2 -translate-y-1/2 flex-row',
	right: 'left-full ml-npi-1 top-1/2 -translate-y-1/2 flex-row',
}

// The arrow precedes the body when the body sits after the trigger (bottom/right).
const arrowFirst = (placement: TooltipPlacement) => placement === 'bottom' || placement === 'right'

// Minimum gap the bubble keeps from the viewport edges when it has to be nudged back on screen.
const VIEWPORT_MARGIN = 16

/**
 * Keeps a top/bottom-placed bubble inside the viewport on narrow screens. The container centres the
 * bubble on the trigger, so a trigger near an edge would push a 300px bubble off screen; this
 * returns the horizontal correction to apply to the BODY only — the arrow stays centred on the
 * trigger, which is the whole point of shifting the body rather than the container.
 *
 * Left/right placements are left alone: shifting them horizontally would detach the arrow from the
 * trigger, and their own axis is already bounded by the trigger's position.
 */
function useViewportShift(bodyRef: React.RefObject<HTMLSpanElement | null>, open: boolean, placement: TooltipPlacement, width: number | string): number {
	const [shift, setShift] = useState(0)
	const horizontal = placement === 'top' || placement === 'bottom'

	useLayoutEffect(() => {
		if (!open || !horizontal) {
			setShift(0)
			return
		}
		const measure = () => {
			const node = bodyRef.current
			if (!node) return
			// Measure with the current shift removed, so repeated runs converge instead of drifting.
			const previous = node.style.transform
			node.style.transform = 'none'
			const rect = node.getBoundingClientRect()
			node.style.transform = previous
			const viewport = node.ownerDocument.defaultView?.innerWidth ?? 0
			const overflowLeft = VIEWPORT_MARGIN - rect.left
			const overflowRight = rect.right - (viewport - VIEWPORT_MARGIN)
			setShift(overflowLeft > 0 ? overflowLeft : overflowRight > 0 ? -overflowRight : 0)
		}
		measure()
		const view = bodyRef.current?.ownerDocument.defaultView
		view?.addEventListener('resize', measure)
		return () => view?.removeEventListener('resize', measure)
	}, [bodyRef, open, horizontal, width])

	return shift
}

// Whether the primary pointer can hover. Drives the interaction model: hover-capable
// devices reveal on hover/focus, touch devices toggle on tap. Defaults to `true` so the
// first SSR/paint matches desktop; the effect corrects it on touch devices.
function useCanHover(): boolean {
	const [canHover, setCanHover] = useState(true)
	useEffect(() => {
		const mq = window.matchMedia('(hover: hover)')
		setCanHover(mq.matches)
		const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches)
		mq.addEventListener('change', onChange)
		return () => mq.removeEventListener('change', onChange)
	}, [])
	return canHover
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
	const canHover = useCanHover()
	const [open, setOpen] = useState(false)
	const rootRef = useRef<HTMLSpanElement | null>(null)
	const bodyRef = useRef<HTMLSpanElement | null>(null)
	const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	// Merge the forwarded ref with the internal root ref used for outside-tap detection.
	const setRootRef = useCallback((node: HTMLSpanElement | null) => {
		rootRef.current = node
		if (typeof ref === 'function') ref(node)
		else if (ref) ref.current = node
	}, [ref])

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

	// Touch devices toggle on tap (no hover). Instant — no show delay on tap.
	const toggle = useCallback(() => {
		if (disabled) return
		clearTimers()
		setOpen(prev => !prev)
	}, [disabled, clearTimers])

	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === 'Escape' && open) hide()
	}, [open, hide])

	// On touch, a tap outside the trigger closes the tooltip (there is no mouseleave).
	// Listen on the root node's own document so this still works if the trigger is
	// rendered into a different document (e.g. a portal/iframe) than the component runs in.
	useEffect(() => {
		if (!open || canHover) return
		const doc = rootRef.current?.ownerDocument ?? document
		const onPointerDown = (e: Event) => {
			if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
		}
		doc.addEventListener('pointerdown', onPointerDown, true)
		return () => doc.removeEventListener('pointerdown', onPointerDown, true)
	}, [open, canHover])

	const isOpen = forceOpen || open
	const widthStyle = typeof width === 'number' ? `${width}px` : width
	const shiftX = useViewportShift(bodyRef, isOpen, placement, width)

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
	// Hover-capable devices reveal on hover/focus; touch devices toggle on tap (no hover).
	type TriggerProps = {
		'aria-describedby'?: string
		onMouseEnter?: (e: React.MouseEvent) => void
		onMouseLeave?: (e: React.MouseEvent) => void
		onFocus?: (e: React.FocusEvent) => void
		onBlur?: (e: React.FocusEvent) => void
		onKeyDown?: (e: React.KeyboardEvent) => void
		onClick?: (e: React.MouseEvent) => void
	}

	const buildTriggerProps = (childProps: TriggerProps): TriggerProps => ({
		'aria-describedby': isOpen
			? [childProps['aria-describedby'], tooltipId].filter(Boolean).join(' ')
			: childProps['aria-describedby'],
		onKeyDown: e => {
			childProps.onKeyDown?.(e)
			handleKeyDown(e)
		},
		...(canHover
			? {
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
			}
			: {
				onClick: e => {
					childProps.onClick?.(e)
					toggle()
				},
			}),
	})

	let trigger: ReactNode
	if (isValidElement<TriggerProps>(children)) {
		const childElement = children as ReactElement<TriggerProps>
		trigger = cloneElement<TriggerProps>(childElement, buildTriggerProps(childElement.props))
	} else {
		// Fallback: children is a string / Fragment / array that can't be cloned.
		// Wrap in a focusable span so the same a11y guarantees apply.
		trigger = (
			<span tabIndex={0} {...buildTriggerProps({})}>
				{children}
			</span>
		)
	}

	const geometry = arrowGeometry[placement]
	const arrow = (
		<svg
			width={geometry.width}
			height={geometry.height}
			viewBox={geometry.viewBox}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className="block shrink-0 text-npi-white"
		>
			<path d={geometry.path} fill="currentColor" />
		</svg>
	)

	return (
		<span
			ref={setRootRef}
			className={twMerge(clsx('relative inline-flex', className))}
			{...rest}
		>
			{trigger}
			{isOpen && (
				<span
					role="tooltip"
					id={tooltipId}
					className={clsx(
						'pointer-events-none absolute z-50 flex items-center',
						placementContainerClass[placement],
					)}
					style={{ filter: 'drop-shadow(0 20px 22.5px rgba(0, 0, 0, 0.06))' }}
				>
					{arrowFirst(placement) && arrow}
					<span
						ref={bodyRef}
						className="block rounded-npi-xs bg-npi-white p-npi-6 font-npi-sans text-[1rem] leading-[1.5] text-npi-text-primary"
						style={{
							width: widthStyle,
							// Never wider than the viewport allows, and nudged back on screen when the
							// trigger sits near an edge (the arrow stays put, pointing at the trigger).
							maxWidth: `calc(100vw - ${2 * VIEWPORT_MARGIN}px)`,
							transform: shiftX === 0 ? undefined : `translateX(${shiftX}px)`,
						}}
					>
						{content}
					</span>
					{!arrowFirst(placement) && arrow}
				</span>
			)}
		</span>
	)
})
Tooltip.displayName = 'Tooltip'

export interface TooltipInfoProps {
	/** Tooltip body — plain text. */
	content: string
	placement?: TooltipPlacement
	/** Accessible name for the trigger. */
	label?: string
	className?: string
}

/**
 * The standard tooltip trigger: an info glyph that reveals its note on hover/focus (tap on touch).
 * This is the ONLY trigger posture the design system uses — text and headings that carry a note
 * render plainly and place this icon after themselves rather than becoming triggers.
 *
 * Sizing and alignment are what make an inline icon read as part of the sentence:
 * - the glyph matches the surrounding font size (capped at 24px so it stays a glyph next to a large
 *   heading), so it never forces the line box taller than the text itself;
 * - `align-middle` on both the wrapper and the button centres it against the text's x-height —
 *   an `inline-flex` box would otherwise baseline-align by its bottom edge and sit visibly low;
 * - the tap target is grown with a pseudo-element rather than padding, so touch gets a comfortable
 *   hit area without the button's box disturbing line height.
 */
export function TooltipInfo({ content, placement, label = 'Více informací', className }: TooltipInfoProps) {
	return (
		<Tooltip content={content} placement={placement} className="align-middle">
			<button
				type="button"
				aria-label={label}
				style={{ width: 'min(1.5rem, 1em)', height: 'min(1.5rem, 1em)' }}
				className={twMerge(
					clsx(
						'relative inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 align-middle leading-none',
						'text-npi-blue transition-colors hover:text-npi-blue-hover',
						'rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue',
						"before:absolute before:-inset-2 before:content-['']",
						className,
					),
				)}
			>
				<Icon name="info" size="s" className="size-full" />
			</button>
		</Tooltip>
	)
}
