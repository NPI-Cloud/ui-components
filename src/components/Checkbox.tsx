import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Text, type TextSize } from './Text'

export const checkboxSizes = ['s', 'm'] as const
export type CheckboxSize = (typeof checkboxSizes)[number]

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
	/** Visual size — `s` (16px) for compact layouts, `m` (24px, default) for standalone use */
	size?: CheckboxSize
	/** Optional label rendered next to the box */
	label?: React.ReactNode
}

const boxClass = 'peer shrink-0 appearance-none cursor-pointer rounded-npi-xxs border border-npi-blue bg-npi-bg-white transition-colors '
	+ 'hover:border-npi-blue-hover active:border-npi-blue-hover '
	+ 'checked:bg-npi-blue checked:border-npi-blue '
	+ 'checked:hover:bg-npi-blue-hover checked:hover:border-npi-blue-hover '
	+ 'checked:active:bg-npi-blue-hover checked:active:border-npi-blue-hover '
	+ 'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light '
	+ 'disabled:cursor-not-allowed disabled:border-npi-gray-700 '
	+ 'checked:disabled:border-npi-gray-700 checked:disabled:bg-npi-gray-700'

const sizeBoxClass: Record<CheckboxSize, string> = {
	s: 'size-4',
	m: 'size-6',
}

const sizeLabelVariant: Record<CheckboxSize, TextSize> = {
	s: 'm',
	m: 'l',
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	({ size = 'm', label, className, disabled, ...props }, ref) => {
		return (
			<label
				className={twMerge(
					clsx(
						'inline-flex items-center gap-npi-2 font-npi-sans',
						disabled ? 'cursor-not-allowed' : 'cursor-pointer',
						className,
					),
				)}
			>
				<span className={clsx('relative block shrink-0', sizeBoxClass[size])}>
					<input
						ref={ref}
						type="checkbox"
						disabled={disabled}
						className={clsx(boxClass, 'absolute inset-0 size-full')}
						{...props}
					/>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.5}
						className="pointer-events-none absolute inset-0 hidden size-full text-npi-white peer-checked:block"
					>
						<path d="M7 12.5 L10.5 16 L17 8.5" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</span>
				{label && (
					<Text variant={sizeLabelVariant[size]} secondary={disabled} asChild>
						<span>{label}</span>
					</Text>
				)}
			</label>
		)
	},
)
Checkbox.displayName = 'Checkbox'
