'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type KeyboardEvent, useCallback, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface RatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
	/** Current rating value, integer in `0..max`. Per design, half-stars are not supported. */
	value: number
	/** Maximum number of stars. Defaults to `5`. */
	max?: number
	/** When provided, the component becomes interactive. The user picks a value by clicking a star or using arrow keys. */
	onChange?: (value: number) => void
	/** Disables the control (only meaningful when `onChange` is provided). */
	disabled?: boolean
	/** `aria-label` for the rating group. Defaults to Czech `'Hodnocení'`. */
	label?: string
	/** Builds an `aria-label` for the i-th star (1-based). Defaults to Czech `Hodnocení {i} z {max} hvězdiček`. */
	starLabel?: (index: number, max: number) => string
}

export const Rating = forwardRef<HTMLDivElement, RatingProps>((props, ref) => {
	const {
		value,
		max = 5,
		onChange,
		disabled = false,
		label = 'Hodnocení',
		starLabel = (i, m) => `Hodnocení ${i} z ${m} hvězdiček`,
		className,
		...rest
	} = props

	const interactive = typeof onChange === 'function'
	const buttonsRef = useRef<Array<HTMLButtonElement | null>>([])

	const focusStar = useCallback((index: number) => {
		const target = buttonsRef.current[index]
		target?.focus()
	}, [])

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLButtonElement>, index: number) => {
			if (!interactive || disabled || !onChange) return
			switch (event.key) {
				case 'ArrowRight':
				case 'ArrowUp': {
					event.preventDefault()
					const next = Math.min(max, index + 2)
					onChange(next)
					focusStar(next - 1)
					break
				}
				case 'ArrowLeft':
				case 'ArrowDown': {
					event.preventDefault()
					const next = Math.max(0, index)
					onChange(next)
					if (next > 0) focusStar(next - 1)
					break
				}
				case 'Home': {
					event.preventDefault()
					onChange(1)
					focusStar(0)
					break
				}
				case 'End': {
					event.preventDefault()
					onChange(max)
					focusStar(max - 1)
					break
				}
			}
		},
		[interactive, disabled, onChange, max, focusStar],
	)

	const ariaProps = interactive
		? {
			role: 'radiogroup' as const,
			'aria-label': label,
			'aria-disabled': disabled || undefined,
		}
		: {
			role: 'img' as const,
			'aria-label': `${label}: ${value} / ${max}`,
		}

	return (
		<div
			ref={ref}
			className={twMerge(clsx('inline-flex items-center gap-npi-1 font-npi-sans', className))}
			{...ariaProps}
			{...rest}
		>
			{Array.from({ length: max }, (_, i) => {
				const starIndex = i + 1
				const isFilled = starIndex <= value
				const colorClass = isFilled ? 'text-npi-blue' : 'text-npi-gray-200'

				if (!interactive) {
					return (
						<span
							key={starIndex}
							aria-hidden
							className={clsx('inline-flex size-npi-6 shrink-0 items-center justify-center', colorClass)}
						>
							<Icon name="hvezdaFill" size="m" className="size-npi-6" />
						</span>
					)
				}

				return (
					<button
						key={starIndex}
						ref={el => {
							buttonsRef.current[i] = el
						}}
						type="button"
						role="radio"
						aria-checked={isFilled}
						aria-label={starLabel(starIndex, max)}
						disabled={disabled}
						tabIndex={interactive && !disabled ? (starIndex === Math.max(1, value) ? 0 : -1) : -1}
						onClick={() => onChange?.(starIndex)}
						onKeyDown={event => handleKeyDown(event, i)}
						className={clsx(
							'inline-flex size-npi-6 shrink-0 cursor-pointer items-center justify-center bg-transparent p-0 transition-colors',
							colorClass,
							!disabled && (isFilled ? 'hover:text-npi-blue-hover' : 'hover:text-npi-gray-300'),
							'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
							disabled && 'cursor-not-allowed',
						)}
					>
						<Icon name="hvezdaFill" size="m" className="size-npi-6" aria-hidden />
					</button>
				)
			})}
		</div>
	)
})
Rating.displayName = 'Rating'
