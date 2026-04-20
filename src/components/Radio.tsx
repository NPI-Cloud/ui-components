import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Text } from './Text'

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	/** Optional label rendered next to the radio */
	label?: React.ReactNode
}

const inputClass = 'peer size-6 shrink-0 appearance-none cursor-pointer rounded-full border border-npi-blue bg-npi-bg-white transition-colors '
	+ 'hover:border-npi-blue-hover active:border-npi-blue-hover '
	+ 'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light '
	+ 'disabled:cursor-not-allowed disabled:border-npi-gray-700'

const dotClass = 'pointer-events-none absolute inset-0 m-auto size-3 rounded-full bg-npi-blue opacity-0 transition-opacity '
	+ 'peer-checked:opacity-100 peer-disabled:bg-npi-gray-700'

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
	({ label, className, disabled, ...props }, ref) => {
		return (
			<label
				className={twMerge(
					clsx(
						'inline-flex items-center gap-npi-3 font-npi-sans',
						disabled ? 'cursor-not-allowed' : 'cursor-pointer',
						className,
					),
				)}
			>
				<span className="relative inline-block size-6">
					<input
						ref={ref}
						type="radio"
						disabled={disabled}
						className={inputClass}
						{...props}
					/>
					<span aria-hidden="true" className={dotClass} />
				</span>
				{label && (
					<Text variant="l" secondary={disabled} asChild>
						<span>{label}</span>
					</Text>
				)}
			</label>
		)
	},
)
Radio.displayName = 'Radio'
