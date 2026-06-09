'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { uic } from '../utils/uic'
import { Text, type TextSize } from './Text'

export const radioSizes = ['s', 'm'] as const
export type RadioSize = (typeof radioSizes)[number]

const RadioBox = uic('span', {
	baseClass: 'relative inline-block shrink-0',
	variants: {
		size: {
			s: 'size-4',
			m: 'size-6',
		},
	},
	defaultVariants: { size: 'm' },
	displayName: 'RadioBox',
})

const RadioInput = uic('input', {
	baseClass: [
		'peer absolute inset-0 size-full appearance-none cursor-pointer rounded-full border border-npi-blue bg-npi-bg-white transition-colors',
		'hover:border-npi-blue-hover active:border-npi-blue-hover',
		'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
		'disabled:cursor-not-allowed disabled:border-npi-gray-700',
	],
	defaultProps: { type: 'radio' },
	displayName: 'RadioInput',
})

const RadioDot = uic('span', {
	baseClass: [
		'pointer-events-none absolute inset-0 m-auto rounded-full bg-npi-blue opacity-0 transition-opacity',
		'peer-checked:opacity-100 peer-disabled:bg-npi-gray-700',
	],
	variants: {
		// Dot is half the box diameter (8px in S / 12px in M).
		size: {
			s: 'size-2',
			m: 'size-3',
		},
	},
	defaultVariants: { size: 'm' },
	defaultProps: { 'aria-hidden': true },
	displayName: 'RadioDot',
})

// Label typography per size (smaller text for the compact S control). Both sizes use a 12px gap
// between control and label per the Figma "Radio S" frame.
const labelSize: Record<RadioSize, TextSize> = { s: 'm', m: 'l' }

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
	/** Visual size — `s` (16px) for compact/complex forms, `m` (24px, default) for standalone use */
	size?: RadioSize
	/** Optional label rendered next to the radio */
	label?: React.ReactNode
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
	({ size = 'm', label, className, disabled, ...props }, ref) => (
		<label
			className={twMerge(
				clsx(
					'inline-flex items-center gap-npi-3 font-npi-sans',
					disabled ? 'cursor-not-allowed' : 'cursor-pointer',
					className,
				),
			)}
		>
			<RadioBox size={size}>
				<RadioInput ref={ref} disabled={disabled} {...props} />
				<RadioDot size={size} />
			</RadioBox>
			{label && (
				<Text variant={labelSize[size]} secondary={disabled} asChild>
					<span>{label}</span>
				</Text>
			)}
		</label>
	),
)
Radio.displayName = 'Radio'
