import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Text } from './Text'

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
	/** Optional label rendered next to the switch */
	label?: React.ReactNode
	/** Render label on the left of the switch instead of the right */
	labelPosition?: 'before' | 'after'
}

const trackClass =
	'peer h-6 w-[42px] shrink-0 appearance-none cursor-pointer rounded-full border border-npi-gray-400 bg-npi-bg-white transition-colors '
	+ 'checked:border-npi-blue checked:bg-npi-blue '
	+ 'checked:hover:border-npi-blue-hover checked:hover:bg-npi-blue-hover '
	+ 'checked:active:border-npi-blue-hover checked:active:bg-npi-blue-hover '
	+ 'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light '
	+ 'disabled:cursor-not-allowed disabled:border-npi-gray-400 disabled:bg-npi-gray-200 '
	+ 'checked:disabled:border-npi-gray-300 checked:disabled:bg-npi-gray-300'

const thumbClass = 'pointer-events-none absolute top-1.5 left-1.5 size-3 rounded-full bg-npi-gray-400 transition-all '
	+ 'peer-[&:not(:checked):not(:disabled):hover]:bg-npi-blue-hover '
	+ 'peer-[&:not(:checked):not(:disabled):active]:bg-npi-blue-hover '
	+ 'peer-checked:translate-x-[18px] peer-checked:bg-npi-white'

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
	({ label, labelPosition = 'after', className, disabled, ...props }, ref) => {
		const labelNode = label && (
			<Text variant="l" secondary={disabled} asChild>
				<span>{label}</span>
			</Text>
		)
		const control = (
			<span className="relative block h-6 w-[42px] shrink-0">
				<input
					ref={ref}
					type="checkbox"
					role="switch"
					disabled={disabled}
					className={clsx(trackClass, 'absolute inset-0')}
					{...props}
				/>
				<span aria-hidden="true" className={thumbClass} />
			</span>
		)
		return (
			<label
				className={twMerge(
					clsx(
						'inline-flex items-center gap-npi-6 font-npi-sans',
						disabled ? 'cursor-not-allowed' : 'cursor-pointer',
						className,
					),
				)}
			>
				{labelPosition === 'before' && labelNode}
				{control}
				{labelPosition === 'after' && labelNode}
			</label>
		)
	},
)
Switch.displayName = 'Switch'
