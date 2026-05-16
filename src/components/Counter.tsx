'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type ReactNode, useCallback } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface CounterProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
	/** Current value (controlled). */
	value: number
	/** Called with the new value when the user activates `−` or `+`. */
	onChange: (value: number) => void
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
	/** `aria-label` for the value display (read out by screen readers). */
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
		value,
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

	const lowerBound = typeof min === 'number' && Number.isFinite(min) ? min : Number.NEGATIVE_INFINITY
	const upperBound = typeof max === 'number' && Number.isFinite(max) ? max : Number.POSITIVE_INFINITY
	const atMin = value <= lowerBound
	const atMax = value >= upperBound
	const decDisabled = disabled || atMin
	const incDisabled = disabled || atMax

	const decrement = useCallback(() => {
		if (decDisabled) return
		const next = Math.max(value - step, lowerBound)
		if (next !== value) onChange(next)
	}, [decDisabled, value, step, lowerBound, onChange])

	const increment = useCallback(() => {
		if (incDisabled) return
		const next = Math.min(value + step, upperBound)
		if (next !== value) onChange(next)
	}, [incDisabled, value, step, upperBound, onChange])

	return (
		<div
			ref={ref}
			className={twMerge(clsx('inline-flex items-center gap-npi-4 font-npi-sans', className))}
			role="spinbutton"
			aria-valuenow={value}
			aria-valuemin={lowerBound}
			aria-valuemax={upperBound}
			aria-valuetext={typeof valueLabel === 'string' ? valueLabel : undefined}
			aria-disabled={disabled || undefined}
			{...rest}
		>
			<button
				type="button"
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
