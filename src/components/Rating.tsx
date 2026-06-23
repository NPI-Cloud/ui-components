'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type KeyboardEvent, useCallback, useState } from 'react'
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
	const [hoverValue, setHoverValue] = useState<number | null>(null)

	// The whole control is a single `slider` widget (0..max). The wrapper is the one focusable element
	// and owns keyboard control; the per-star buttons are mouse steppers, kept out of the tab order and
	// hidden from assistive tech so it doesn't read as N independent radios.
	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLDivElement>) => {
			if (!interactive || disabled || !onChange) return
			switch (event.key) {
				case 'ArrowRight':
				case 'ArrowUp':
					event.preventDefault()
					onChange(Math.min(max, value + 1))
					break
				case 'ArrowLeft':
				case 'ArrowDown':
					event.preventDefault()
					onChange(Math.max(0, value - 1))
					break
				case 'Home':
					event.preventDefault()
					onChange(0)
					break
				case 'End':
					event.preventDefault()
					onChange(max)
					break
			}
		},
		[interactive, disabled, onChange, value, max],
	)

	const ariaProps = interactive
		? {
			role: 'slider' as const,
			tabIndex: disabled ? -1 : 0,
			'aria-label': label,
			'aria-valuemin': 0,
			'aria-valuemax': max,
			'aria-valuenow': value,
			'aria-valuetext': value > 0 ? starLabel(value, max) : `${label}: 0 / ${max}`,
			'aria-orientation': 'horizontal' as const,
			'aria-disabled': disabled || undefined,
		}
		: {
			role: 'img' as const,
			'aria-label': `${label}: ${value} / ${max}`,
		}

	return (
		<div
			ref={ref}
			className={twMerge(clsx(
				'inline-flex items-center gap-npi-1 rounded-npi-xs font-npi-sans outline-none',
				interactive && 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
				className,
			))}
			onMouseLeave={interactive && !disabled ? () => setHoverValue(null) : undefined}
			onKeyDown={interactive ? handleKeyDown : undefined}
			{...ariaProps}
			{...rest}
		>
			{Array.from({ length: max }, (_, i) => {
				const starIndex = i + 1
				// While hovering, preview the hovered count; otherwise reflect the committed value.
				const displayValue = interactive && !disabled && hoverValue !== null ? hoverValue : value
				const isDisplayFilled = starIndex <= displayValue
				const colorClass = isDisplayFilled ? 'text-npi-blue' : 'text-npi-gray-200'

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
						type="button"
						tabIndex={-1}
						aria-hidden="true"
						disabled={disabled}
						onClick={() => onChange?.(starIndex)}
						onMouseEnter={!disabled ? () => setHoverValue(starIndex) : undefined}
						className={clsx(
							'inline-flex size-npi-6 shrink-0 items-center justify-center bg-transparent p-0 transition-colors',
							colorClass,
							disabled ? 'cursor-not-allowed' : 'cursor-pointer',
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
