'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type KeyboardEvent, type ReactNode, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import { useControllableState } from '../utils/use-controllable-state'

export interface CounterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'defaultValue'> {
	/** Current value (controlled). Omit and pass `defaultValue` for an uncontrolled counter. */
	value?: number
	/** Initial value for the uncontrolled counter. Defaults to `0`. Ignored when `value` is set. */
	defaultValue?: number
	/** Called with the new value when the user activates `−` / `+` or the arrow keys. */
	onChange?: (value: number) => void
	/** Lower bound (inclusive). `−` is disabled when `value <= min`. */
	min?: number
	/** Upper bound (inclusive). `+` is disabled when `value >= max`. */
	max?: number
	/** Increment / decrement step. Defaults to `1`. */
	step?: number
	/** Disables the entire control. */
	disabled?: boolean
	/** `aria-label` for the decrement button. Defaults to Czech `'Snížit'`. */
	decrementLabel?: string
	/** `aria-label` for the increment button. Defaults to Czech `'Zvýšit'`. */
	incrementLabel?: string
	/** Accessible value text announced for the spinbutton (e.g. `'3 osoby'`). */
	valueLabel?: ReactNode
}

const buttonBase = clsx(
	'inline-flex size-npi-6 shrink-0 cursor-pointer items-center justify-center rounded-npi-xl border border-solid bg-npi-bg-white p-npi-1 transition-colors',
	'border-npi-gray-200 text-npi-blue',
	'hover:border-npi-blue-hover hover:text-npi-blue-hover',
	'active:border-npi-blue-hover active:text-npi-blue-hover',
	'focus-visible:border-npi-blue focus-visible:text-npi-blue focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed disabled:border-npi-gray-200 disabled:text-npi-text-secondary disabled:hover:border-npi-gray-200 disabled:hover:text-npi-text-secondary',
)

export const Counter = forwardRef<HTMLDivElement, CounterProps>((props, ref) => {
	const {
		value: valueProp,
		defaultValue = 0,
		onChange,
		min,
		max,
		step = 1,
		disabled = false,
		decrementLabel = 'Snížit',
		incrementLabel = 'Zvýšit',
		valueLabel,
		className,
		...rest
	} = props

	const [value, setValue] = useControllableState(valueProp, defaultValue, onChange)

	const hasMin = typeof min === 'number' && Number.isFinite(min)
	const hasMax = typeof max === 'number' && Number.isFinite(max)
	const lowerBound = hasMin ? (min as number) : Number.NEGATIVE_INFINITY
	const upperBound = hasMax ? (max as number) : Number.POSITIVE_INFINITY
	const atMin = value <= lowerBound
	const atMax = value >= upperBound
	const decDisabled = disabled || atMin
	const incDisabled = disabled || atMax

	const decrement = useCallback(() => {
		if (decDisabled) return
		const next = Math.max(value - step, lowerBound)
		if (next !== value) setValue(next)
	}, [decDisabled, value, step, lowerBound, setValue])

	const increment = useCallback(() => {
		if (incDisabled) return
		const next = Math.min(value + step, upperBound)
		if (next !== value) setValue(next)
	}, [incDisabled, value, step, upperBound, setValue])

	// The wrapper is the spinbutton: it owns keyboard control (arrows / Home / End), while the visible
	// `−`/`+` buttons are mouse steppers taken out of the tab order and hidden from assistive tech so the
	// control reads as a single widget rather than two stray buttons.
	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (disabled) return
			switch (event.key) {
				case 'ArrowUp':
				case 'ArrowRight':
					event.preventDefault()
					increment()
					break
				case 'ArrowDown':
				case 'ArrowLeft':
					event.preventDefault()
					decrement()
					break
				case 'Home':
					if (hasMin && value !== lowerBound) {
						event.preventDefault()
						setValue(lowerBound)
					}
					break
				case 'End':
					if (hasMax && value !== upperBound) {
						event.preventDefault()
						setValue(upperBound)
					}
					break
			}
		},
		[disabled, increment, decrement, hasMin, hasMax, value, lowerBound, upperBound, setValue],
	)

	return (
		<div
			ref={ref}
			className={twMerge(
				clsx(
					'inline-flex items-center gap-npi-4 rounded-npi-xs font-npi-sans outline-none',
					'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
					className,
				),
			)}
			role="spinbutton"
			tabIndex={disabled ? -1 : 0}
			aria-valuenow={value}
			aria-valuemin={hasMin ? lowerBound : undefined}
			aria-valuemax={hasMax ? upperBound : undefined}
			aria-valuetext={typeof valueLabel === 'string' ? valueLabel : undefined}
			aria-disabled={disabled || undefined}
			onKeyDown={handleKeyDown}
			{...rest}
		>
			<button
				type="button"
				tabIndex={-1}
				aria-hidden="true"
				onClick={decrement}
				disabled={decDisabled}
				aria-label={decrementLabel}
				className={buttonBase}
			>
				<Icon name="minus" size="s" className="size-4" aria-hidden />
			</button>
			<span
				className={clsx(
					'inline-flex min-w-[1.125rem] justify-center text-center font-bold text-[1rem] leading-[1.5] tabular-nums',
					disabled ? 'text-npi-text-secondary' : 'text-npi-text-primary',
				)}
				aria-hidden="true"
			>
				{value}
			</span>
			<button
				type="button"
				tabIndex={-1}
				aria-hidden="true"
				onClick={increment}
				disabled={incDisabled}
				aria-label={incrementLabel}
				className={buttonBase}
			>
				<Icon name="plus" size="s" className="size-4" aria-hidden />
			</button>
		</div>
	)
})
Counter.displayName = 'Counter'
