import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { uic } from '../utils/uic'
import { Text, type TextSize } from './Text'

export const checkboxSizes = ['s', 'm'] as const
export type CheckboxSize = (typeof checkboxSizes)[number]

const CheckboxBox = uic('span', {
	baseClass: 'relative block shrink-0',
	variants: {
		size: {
			s: 'size-4',
			m: 'size-6',
		},
	},
	defaultVariants: { size: 'm' },
	displayName: 'CheckboxBox',
})

const CheckboxInput = uic('input', {
	baseClass: [
		'peer absolute inset-0 size-full appearance-none cursor-pointer rounded-npi-xxs border border-npi-blue bg-npi-bg-white transition-colors',
		'hover:border-npi-blue-hover active:border-npi-blue-hover',
		'checked:bg-npi-blue checked:border-npi-blue',
		'checked:hover:bg-npi-blue-hover checked:hover:border-npi-blue-hover',
		'checked:active:bg-npi-blue-hover checked:active:border-npi-blue-hover',
		'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
		'disabled:cursor-not-allowed disabled:border-npi-gray-700',
		'checked:disabled:border-npi-gray-700 checked:disabled:bg-npi-gray-700',
	],
	defaultProps: { type: 'checkbox' },
	displayName: 'CheckboxInput',
})

const CheckboxIndicator = uic('svg', {
	baseClass: 'pointer-events-none absolute inset-0 hidden size-full text-npi-white peer-checked:block',
	defaultProps: {
		'aria-hidden': true,
		viewBox: '0 0 24 24',
		fill: 'none',
		stroke: 'currentColor',
		strokeWidth: 2.5,
	},
	displayName: 'CheckboxIndicator',
})

const labelSize: Record<CheckboxSize, TextSize> = { s: 'm', m: 'l' }

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
	/** Visual size — `s` (16px) for compact layouts, `m` (24px, default) for standalone use */
	size?: CheckboxSize
	/** Optional label rendered next to the box */
	label?: React.ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ size = 'm', label, className, disabled, ...props }, ref) => (
		<label
			className={twMerge(
				clsx(
					'inline-flex items-center gap-npi-2 font-npi-sans',
					disabled ? 'cursor-not-allowed' : 'cursor-pointer',
					className,
				),
			)}
		>
			<CheckboxBox size={size}>
				<CheckboxInput ref={ref} disabled={disabled} {...props} />
				<CheckboxIndicator>
					<path d="M7 12.5 L10.5 16 L17 8.5" strokeLinecap="round" strokeLinejoin="round" />
				</CheckboxIndicator>
			</CheckboxBox>
			{label && (
				<Text variant={labelSize[size]} secondary={disabled} asChild>
					<span>{label}</span>
				</Text>
			)}
		</label>
	),
)
Checkbox.displayName = 'Checkbox'
