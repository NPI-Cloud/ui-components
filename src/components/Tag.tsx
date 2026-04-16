import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'

export const tagSizes = ['M', 'S'] as const
export type TagSize = (typeof tagSizes)[number]

export interface TagProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
	/** Visible label */
	label: string
	/** Size variant — M (14px text, 1px border) or S (12px semibold, 2px border) */
	size?: TagSize
	/** Icon before the label (size M only). Use `'check'` for an active/selected tag. */
	iconBefore?: IconName
	/** Icon after the label (size M only). Overridden by the × dismiss icon when `onRemove` is set. */
	iconAfter?: IconName
	/** Render for dark backgrounds (white border, navy fill) */
	inverted?: boolean
	/** When provided, renders a × dismiss button inside the tag (size M only) */
	onRemove?: () => void
}

const rootBase =
	'inline-flex items-center gap-npi-2 rounded-npi-xxs font-npi-sans cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-npi-blue-light'

const sizeClass: Record<TagSize, string> = {
	// px-12 py-[6px] / text-m / 1px border
	M: 'px-npi-3 py-[6px] text-[0.875rem] leading-[1.3] border',
	// px-[10px] py-1 / text-s semibold / 2px border
	S: 'px-[10px] py-npi-1 text-[0.75rem] leading-[1.3] font-semibold border-2',
}

const toneClass = {
	default:
		'bg-npi-white border-npi-blue text-npi-blue hover:border-npi-blue-hover hover:text-npi-blue-hover active:border-npi-blue-hover active:text-npi-blue-hover',
	inverted:
		'bg-transparent border-npi-white text-npi-white hover:border-npi-blue-light hover:text-npi-blue-light active:border-npi-blue-light active:text-npi-blue-light',
}

export const Tag = forwardRef<HTMLButtonElement, TagProps>(
	({ label, size = 'M', iconBefore, iconAfter, inverted = false, onRemove, className, type = 'button', ...props }, ref) => {
		const showIconBefore = iconBefore != null && size === 'M'
		const showRemove = onRemove != null && size === 'M'
		const showIconAfter = iconAfter != null && size === 'M' && !showRemove

		return (
			<button
				ref={ref}
				type={type}
				className={twMerge(clsx(rootBase, sizeClass[size], inverted ? toneClass.inverted : toneClass.default, className))}
				{...props}
			>
				{showIconBefore && <Icon name={iconBefore} size="s" className="size-4 shrink-0" />}
				<span>{label}</span>
				{showIconAfter && <Icon name={iconAfter} size="s" className="size-4 shrink-0" />}
				{showRemove && (
					<span
						role="button"
						tabIndex={0}
						aria-label="Remove"
						className="inline-flex items-center justify-center rounded-npi-xxs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light"
						onClick={e => {
							e.stopPropagation()
							onRemove?.()
						}}
						onKeyDown={e => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault()
								e.stopPropagation()
								onRemove?.()
							}
						}}
					>
						<Icon name="zavrit" size="s" className="size-4 shrink-0" />
					</span>
				)}
			</button>
		)
	},
)
Tag.displayName = 'Tag'
