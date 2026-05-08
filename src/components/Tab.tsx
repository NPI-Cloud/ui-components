import { forwardRef } from 'react'
import { Icon, type IconName } from '../icons'
import { uic } from '../utils/uic'

export const tabVariants = ['segmented', 'pill', 'icon'] as const
export type TabVariant = (typeof tabVariants)[number]

export const tabSizes = ['M', 'L'] as const
export type TabSize = (typeof tabSizes)[number]

const TabRoot = uic('button', {
	baseClass: [
		'inline-flex items-center font-npi-sans cursor-pointer transition-colors whitespace-nowrap',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light',
		'disabled:cursor-not-allowed disabled:opacity-50',
	],
	variants: {
		variant: {
			// Verze 1 — segmented switch item: 16px / 7px padding, 4px radius, 16px bold label
			segmented: 'rounded-npi-xxs px-npi-4 py-[7px] text-[1rem] leading-[1.5] font-bold text-center',
			// Verze 2 — free-floating pill chip: 4px vertical padding, fully rounded (horizontal padding set per size)
			pill: 'rounded-full py-npi-1 font-normal',
			// Verze 3 — view-mode switcher with leading icon: 8px / 4px padding, 4px radius, 8px gap
			icon: 'rounded-npi-xxs px-npi-2 py-npi-1 gap-npi-2 text-[0.875rem] leading-[1.3] font-normal',
		},
		size: {
			M: '',
			L: '',
		},
		selected: {
			true: '',
			false: '',
		},
	},
	defaultVariants: { variant: 'segmented', size: 'M', selected: false },
	defaultProps: { type: 'button' },
	compoundVariants: [
		// Segmented — selected: blue fill, white text
		{
			variant: 'segmented',
			selected: true,
			className: 'bg-npi-blue text-npi-white hover:bg-npi-blue-hover',
		},
		// Segmented — idle: transparent, blue text, hover deepens
		{
			variant: 'segmented',
			selected: false,
			className: 'bg-transparent text-npi-blue hover:text-npi-blue-hover',
		},
		// Pill — sizes: M = 12px horizontal padding + small text, L = 16px horizontal padding + body text
		{ variant: 'pill', size: 'M', className: 'px-npi-3 text-[0.75rem] leading-[14px]' },
		{ variant: 'pill', size: 'L', className: 'px-npi-4 text-[1rem] leading-[22px]' },
		// Pill — selected: blue fill, white text, hover deepens
		{
			variant: 'pill',
			selected: true,
			className: 'bg-npi-blue text-npi-white hover:bg-npi-blue-hover',
		},
		// Pill — idle: transparent, blue text, hover deepens
		{
			variant: 'pill',
			selected: false,
			className: 'bg-transparent text-npi-blue hover:text-npi-blue-hover',
		},
		// Icon — selected: white fill, dark navy text
		{
			variant: 'icon',
			selected: true,
			className: 'bg-npi-white text-npi-text-primary',
		},
		// Icon — idle: transparent, blue text, hover deepens
		{
			variant: 'icon',
			selected: false,
			className: 'bg-transparent text-npi-blue hover:text-npi-blue-hover',
		},
	],
	displayName: 'TabRoot',
})

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
	/** Visual style — `segmented` (compact switch row), `pill` (free-floating chip), `icon` (view-mode switcher with leading icon) */
	variant: TabVariant
	/** Size variant — only meaningful for `pill` (M = 12px, L = 16px). Ignored otherwise. */
	size?: TabSize
	/** Whether this tab is currently active */
	selected?: boolean
	/** Icon rendered before the label (only meaningful for `icon` variant) */
	iconBefore?: IconName
	/** Tab label */
	children: React.ReactNode
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
	({ variant, size = 'M', selected = false, iconBefore, children, className, ...props }, ref) => {
		const showIcon = variant === 'icon' && iconBefore != null
		return (
			<TabRoot ref={ref} variant={variant} size={size} selected={selected} className={className} aria-pressed={selected} {...props}>
				{showIcon && <Icon name={iconBefore} className="size-6 shrink-0" />}
				<span>{children}</span>
			</TabRoot>
		)
	},
)
Tab.displayName = 'Tab'
