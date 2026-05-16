'use client'

import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export const bigNumberSizes = ['M', 'L'] as const
export type BigNumberSize = (typeof bigNumberSizes)[number]

export interface BigNumberProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	/** The big numeric value. Pass as `ReactNode` so the consumer formats it (locale, separators, currency, signs, units). */
	value: ReactNode
	/** Descriptive label shown below the number. */
	label: ReactNode
	/**
	 * Visual size.
	 * - `L` (default) — desktop, 100px Bitter (`text-[6.25rem]`).
	 * - `M` — mobile, 72px Bitter (`text-[4.5rem]`).
	 *
	 * Note: Bitter sizes 72/100 px are larger than every `Heading` step, so the number is
	 * rendered with inline typography utilities rather than `Heading`. Color uses `npi-blue`.
	 */
	size?: BigNumberSize
}

// Hardcoded so Tailwind v4's source scanner can see the literal arbitrary values.
// Number sizes (100/72 px) sit above the heading scale, so we use inline arbitrary values.
const numberSizeClasses: Record<BigNumberSize, string> = {
	L: 'text-[6.25rem]',
	M: 'text-[4.5rem]',
}

const numberCva = cva('font-npi-serif font-normal leading-none text-npi-blue', {
	variants: {
		size: numberSizeClasses,
	},
	defaultVariants: {
		size: 'L',
	},
})

export const BigNumber = forwardRef<HTMLDivElement, BigNumberProps>(({ value, label, size = 'L', className, ...rest }, ref) => {
	return (
		<div ref={ref} className={twMerge(clsx('flex flex-col items-start gap-npi-2', className))} {...rest}>
			<p className={numberCva({ size })}>{value}</p>
			<p className="font-npi-sans text-[1rem] leading-[1.5] text-npi-text-primary">
				{label}
			</p>
		</div>
	)
})
BigNumber.displayName = 'BigNumber'
