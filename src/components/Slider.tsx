'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type ReactNode, useCallback, useId, useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

export const sliderSizes = ['m', 's'] as const
export type SliderSize = typeof sliderSizes[number]

type SliderValue = number | [number, number]

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
	/** Current value. Pass a number for a single-thumb slider, or `[min, max]` for a range slider with two thumbs. */
	value: SliderValue
	/** Called whenever the user moves a thumb. The shape matches `value`. */
	onChange: (value: SliderValue) => void
	/** Lower bound of the scale. Defaults to `0`. */
	min?: number
	/** Upper bound of the scale. Defaults to `100`. */
	max?: number
	/** Increment used by keyboard arrows and pointer snapping. Defaults to `1`. */
	step?: number
	/** Visual size — `m` (32 px thumb / 8 px track) or `s` (16 px thumb / 4 px track). Defaults to `m`. */
	size?: SliderSize
	/** Disables interaction and dims the control. */
	disabled?: boolean
	/** Optional icon rendered before the track (e.g. mute). */
	iconBefore?: ReactNode
	/** Optional icon rendered after the track (e.g. volume up). */
	iconAfter?: ReactNode
	/** Min/max labels rendered below the track. Pass a tuple `[startLabel, endLabel]`. */
	rangeLabels?: [ReactNode, ReactNode]
	/** Discrete marks rendered below the track. Each mark is positioned at its `value` along the scale. */
	marks?: ReadonlyArray<{ value: number; label?: ReactNode }>
	/** `aria-label` for the (single or first) thumb. Defaults to Czech `'Hodnota'`. */
	label?: string
	/** `aria-label` for the second thumb of a range slider. Defaults to Czech `'Maximální hodnota'`. */
	labelEnd?: string
}

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const snapToStep = (value: number, min: number, step: number) => {
	if (step <= 0) return value
	const steps = Math.round((value - min) / step)
	return min + steps * step
}

const trimFloatingError = (value: number, step: number) => {
	const decimals = (() => {
		const stepStr = step.toString()
		const dot = stepStr.indexOf('.')
		return dot === -1 ? 0 : stepStr.length - dot - 1
	})()
	if (decimals === 0) return Math.round(value)
	const factor = 10 ** decimals
	return Math.round(value * factor) / factor
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>((props, ref) => {
	const {
		value,
		onChange,
		min = 0,
		max = 100,
		step = 1,
		size = 'm',
		disabled = false,
		iconBefore,
		iconAfter,
		rangeLabels,
		marks,
		label = 'Hodnota',
		labelEnd = 'Maximální hodnota',
		className,
		...rest
	} = props

	const isRange = Array.isArray(value)
	const [startValue, endValue] = isRange ? value : [min, value]
	const trackRef = useRef<HTMLDivElement | null>(null)
	const startThumbRef = useRef<HTMLButtonElement | null>(null)
	const endThumbRef = useRef<HTMLButtonElement | null>(null)
	const baseId = useId()

	const span = max - min
	const startPct = span > 0 ? ((startValue - min) / span) * 100 : 0
	const endPct = span > 0 ? ((endValue - min) / span) * 100 : 0
	const filledLeft = isRange ? startPct : 0
	const filledRight = endPct

	const isM = size === 'm'
	const trackHeightClass = isM ? 'h-npi-2' : 'h-npi-1'
	const thumbSizeClass = isM ? 'size-npi-8' : 'size-npi-4'
	const railRadiusClass = isM ? 'rounded-npi-xs' : 'rounded-npi-xxs'

	const setStart = useCallback(
		(next: number) => {
			const clamped = clampValue(next, min, Math.min(endValue, max))
			const snapped = trimFloatingError(snapToStep(clamped, min, step), step)
			if (isRange) {
				if (snapped !== startValue) onChange([snapped, endValue])
			} else if (snapped !== endValue) {
				onChange(snapped)
			}
		},
		[min, max, step, endValue, isRange, startValue, onChange],
	)

	const setEnd = useCallback(
		(next: number) => {
			const lowerBound = isRange ? startValue : min
			const clamped = clampValue(next, lowerBound, max)
			const snapped = trimFloatingError(snapToStep(clamped, min, step), step)
			if (isRange) {
				if (snapped !== endValue) onChange([startValue, snapped])
			} else if (snapped !== endValue) {
				onChange(snapped)
			}
		},
		[min, max, step, isRange, startValue, endValue, onChange],
	)

	const valueAtPointer = useCallback((clientX: number): number => {
		const track = trackRef.current
		if (!track) return min
		const rect = track.getBoundingClientRect()
		if (rect.width === 0) return min
		const ratio = clampValue((clientX - rect.left) / rect.width, 0, 1)
		return min + ratio * span
	}, [min, span])

	const handlePointerInput = useCallback(
		(clientX: number, target: 'start' | 'end' | 'auto') => {
			const pointerValue = valueAtPointer(clientX)
			if (!isRange || target === 'end') {
				setEnd(pointerValue)
				return
			}
			if (target === 'start') {
				setStart(pointerValue)
				return
			}
			// auto: pick the nearer thumb
			const distStart = Math.abs(pointerValue - startValue)
			const distEnd = Math.abs(pointerValue - endValue)
			if (distStart <= distEnd) setStart(pointerValue)
			else setEnd(pointerValue)
		},
		[valueAtPointer, isRange, startValue, endValue, setStart, setEnd],
	)

	const startPointerDrag = useCallback(
		(event: PointerEvent<HTMLElement>, target: 'start' | 'end' | 'auto') => {
			if (disabled) return
			const element = event.currentTarget
			element.setPointerCapture(event.pointerId)

			const activeTarget: 'start' | 'end' = (() => {
				if (target === 'auto') {
					const pointerValue = valueAtPointer(event.clientX)
					if (!isRange) return 'end'
					return Math.abs(pointerValue - startValue) <= Math.abs(pointerValue - endValue) ? 'start' : 'end'
				}
				return target
			})()

			handlePointerInput(event.clientX, target === 'auto' ? activeTarget : target)

			const onMove = (moveEvent: globalThis.PointerEvent) => {
				handlePointerInput(moveEvent.clientX, activeTarget)
			}
			const onUp = (_upEvent: globalThis.PointerEvent) => {
				element.releasePointerCapture?.(event.pointerId)
				element.removeEventListener('pointermove', onMove)
				element.removeEventListener('pointerup', onUp)
				element.removeEventListener('pointercancel', onUp)
			}

			element.addEventListener('pointermove', onMove)
			element.addEventListener('pointerup', onUp)
			element.addEventListener('pointercancel', onUp)
		},
		[disabled, isRange, startValue, endValue, valueAtPointer, handlePointerInput],
	)

	const handleThumbKey = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>, which: 'start' | 'end') => {
			if (disabled) return
			const setter = which === 'start' ? setStart : setEnd
			const current = which === 'start' ? startValue : endValue
			const big = step * 10
			switch (event.key) {
				case 'ArrowLeft':
				case 'ArrowDown':
					event.preventDefault()
					setter(current - step)
					break
				case 'ArrowRight':
				case 'ArrowUp':
					event.preventDefault()
					setter(current + step)
					break
				case 'PageDown':
					event.preventDefault()
					setter(current - big)
					break
				case 'PageUp':
					event.preventDefault()
					setter(current + big)
					break
				case 'Home':
					event.preventDefault()
					setter(min)
					break
				case 'End':
					event.preventDefault()
					setter(max)
					break
			}
		},
		[disabled, setStart, setEnd, startValue, endValue, step, min, max],
	)

	const trackColorClass = disabled ? 'bg-npi-gray-300' : 'bg-npi-blue'
	const railColorClass = disabled ? 'bg-npi-gray-200' : 'bg-npi-gray-300'
	const thumbColorClass = disabled ? 'bg-npi-gray-300' : 'bg-npi-blue'
	const thumbHoverClass = disabled ? '' : 'hover:bg-npi-blue-hover focus-visible:bg-npi-blue-hover active:bg-npi-blue-hover'

	const thumbBaseClass = clsx(
		'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 border-0 transition-colors',
		thumbSizeClass,
		thumbColorClass,
		thumbHoverClass,
		'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
		disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
	)

	const renderedMarks = useMemo(() => {
		if (!marks || marks.length === 0) return null
		return marks.map((mark, idx) => {
			const pct = span > 0 ? ((mark.value - min) / span) * 100 : 0
			const isActive = !isRange ? mark.value === endValue : mark.value >= startValue && mark.value <= endValue
			return (
				<div
					key={`${mark.value}-${idx}`}
					className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
					style={{ left: `${pct}%` }}
				>
					<span
						className={clsx(
							'block text-[16px] leading-[1.5] font-npi-sans',
							disabled ? 'text-npi-text-secondary' : isActive ? 'text-npi-blue' : 'text-npi-text-primary',
						)}
					>
						{mark.label ?? mark.value}
					</span>
				</div>
			)
		})
	}, [marks, span, min, isRange, startValue, endValue, disabled])

	return (
		<div
			ref={ref}
			className={twMerge(
				clsx(
					'flex w-full items-center font-npi-sans',
					iconBefore || iconAfter ? 'gap-npi-3' : '',
					disabled && 'opacity-60',
					className,
				),
			)}
			{...rest}
		>
			{iconBefore && (
				<span aria-hidden className={clsx('inline-flex shrink-0', disabled ? 'text-npi-gray-400' : 'text-npi-blue')}>
					{iconBefore}
				</span>
			)}
			<div className="flex flex-1 flex-col gap-npi-1 min-w-0">
				<div
					ref={trackRef}
					className={clsx(
						'relative w-full select-none',
						isM ? 'h-npi-8' : 'h-npi-4',
						disabled ? 'cursor-not-allowed' : 'cursor-pointer',
					)}
					onPointerDown={event => startPointerDrag(event, 'auto')}
				>
					{/* rail (background) */}
					<div
						className={clsx('absolute left-0 right-0 top-1/2 -translate-y-1/2', trackHeightClass, railRadiusClass, railColorClass)}
						aria-hidden
					/>
					{/* filled portion */}
					<div
						className={clsx('absolute top-1/2 -translate-y-1/2', trackHeightClass, railRadiusClass, trackColorClass)}
						style={{ left: `${filledLeft}%`, right: `${100 - filledRight}%` }}
						aria-hidden
					/>
					{isRange && (
						<button
							ref={startThumbRef}
							type="button"
							role="slider"
							id={`${baseId}-start`}
							aria-label={label}
							aria-valuemin={min}
							aria-valuemax={endValue}
							aria-valuenow={startValue}
							aria-valuetext={String(startValue)}
							aria-disabled={disabled || undefined}
							disabled={disabled}
							tabIndex={disabled ? -1 : 0}
							onPointerDown={event => {
								event.stopPropagation()
								startPointerDrag(event, 'start')
							}}
							onKeyDown={event => handleThumbKey(event, 'start')}
							className={thumbBaseClass}
							style={{ left: `${startPct}%` }}
						/>
					)}
					<button
						ref={endThumbRef}
						type="button"
						role="slider"
						id={`${baseId}-end`}
						aria-label={isRange ? labelEnd : label}
						aria-valuemin={isRange ? startValue : min}
						aria-valuemax={max}
						aria-valuenow={endValue}
						aria-valuetext={String(endValue)}
						aria-disabled={disabled || undefined}
						disabled={disabled}
						tabIndex={disabled ? -1 : 0}
						onPointerDown={event => {
							event.stopPropagation()
							startPointerDrag(event, 'end')
						}}
						onKeyDown={event => handleThumbKey(event, 'end')}
						className={thumbBaseClass}
						style={{ left: `${endPct}%` }}
					/>
				</div>

				{rangeLabels && (
					<div className="flex w-full justify-between px-npi-1 text-[16px] leading-[1.5] text-npi-text-primary">
						<span>{rangeLabels[0]}</span>
						<span className="text-right">{rangeLabels[1]}</span>
					</div>
				)}

				{marks && marks.length > 0 && (
					<div className="relative h-[24px] w-full">
						{renderedMarks}
					</div>
				)}
			</div>
			{iconAfter && (
				<span aria-hidden className={clsx('inline-flex shrink-0', disabled ? 'text-npi-gray-400' : 'text-npi-blue')}>
					{iconAfter}
				</span>
			)}
		</div>
	)
})
Slider.displayName = 'Slider'
