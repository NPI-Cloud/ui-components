'use client'

import { clsx } from 'clsx'
import {
	createContext,
	forwardRef,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	useCallback,
	useContext,
	useId,
	useMemo,
	useState,
} from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { uic } from '../utils/uic'

export const tabVariants = ['segmented', 'pill', 'icon'] as const
export type TabVariant = (typeof tabVariants)[number]

export const tabSizes = ['M', 'L'] as const
export type TabSize = (typeof tabSizes)[number]

export const tabsOrientations = ['horizontal', 'vertical'] as const
export type TabsOrientation = (typeof tabsOrientations)[number]

interface TabsContextValue {
	value: string
	setValue: (value: string) => void
	variant: TabVariant
	size: TabSize
	orientation: TabsOrientation
	idPrefix: string
}

const TabsContext = createContext<TabsContextValue | null>(null)

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

export interface TabsProps {
	/** Currently selected tab value (controlled). */
	value?: string
	/** Default selected tab value (uncontrolled). */
	defaultValue?: string
	/** Called whenever the selected tab changes. */
	onValueChange?: (value: string) => void
	/** Visual style propagated to all `Tab` children that don't override it. */
	variant?: TabVariant
	/** Size propagated to all `Tab` children that don't override it (only meaningful for `pill`). */
	size?: TabSize
	/**
	 * Layout direction. `horizontal` (default) stacks TabList above TabPanels; `vertical` puts
	 * TabList on the left and TabPanel on the right. The keyboard handler also flips: ←/→ for
	 * horizontal, ↑/↓ for vertical.
	 */
	orientation?: TabsOrientation
	/** TabList + TabPanel children. */
	children: ReactNode
	className?: string
}

export const Tabs = ({
	value: controlledValue,
	defaultValue,
	onValueChange,
	variant = 'segmented',
	size = 'M',
	orientation = 'horizontal',
	children,
	className,
}: TabsProps) => {
	const [uncontrolled, setUncontrolled] = useState<string>(defaultValue ?? '')
	const isControlled = controlledValue !== undefined
	const value = isControlled ? controlledValue : uncontrolled

	const setValue = useCallback((next: string) => {
		if (!isControlled) setUncontrolled(next)
		onValueChange?.(next)
	}, [isControlled, onValueChange])

	const idPrefix = useId()

	const ctx = useMemo<TabsContextValue>(
		() => ({ value, setValue, variant, size, orientation, idPrefix }),
		[value, setValue, variant, size, orientation, idPrefix],
	)

	const wrapperClass = orientation === 'vertical'
		? 'flex flex-row items-start gap-npi-6'
		: 'flex flex-col'

	return (
		<TabsContext.Provider value={ctx}>
			<div className={twMerge(wrapperClass, className)}>{children}</div>
		</TabsContext.Provider>
	)
}
Tabs.displayName = 'Tabs'

const tabListLayoutByVariant: Record<TabVariant, Record<TabsOrientation, string>> = {
	segmented: {
		// Verze 1 — grey backdrop, 4px padding, 16px gap, single row that scrolls horizontally if it overflows
		horizontal: 'inline-flex self-start max-w-full overflow-x-auto bg-npi-bg-light rounded-npi-xs p-npi-1 gap-npi-4',
		vertical: 'inline-flex flex-col items-start bg-npi-bg-light rounded-npi-xs p-npi-1 gap-npi-1',
	},
	pill: {
		// Verze 2 — free-floating chip cloud, wraps to multiple rows
		horizontal: 'inline-flex flex-wrap gap-npi-1',
		// Vertical pill — stacks as a sidebar nav (no backdrop)
		vertical: 'inline-flex flex-col items-start gap-npi-1',
	},
	icon: {
		// Verze 3 — grey backdrop with smaller gap
		horizontal: 'inline-flex self-start bg-npi-bg-light rounded-npi-xs p-npi-1 gap-npi-1',
		vertical: 'inline-flex flex-col items-start bg-npi-bg-light rounded-npi-xs p-npi-1 gap-npi-1',
	},
}

export interface TabListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'aria-orientation'> {
	'aria-label'?: string
	children: ReactNode
}

export const TabList = forwardRef<HTMLDivElement, TabListProps>(
	({ children, className, onKeyDown, ...rest }, ref) => {
		const ctx = useContext(TabsContext)
		const isVertical = ctx?.orientation === 'vertical'

		const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
			onKeyDown?.(event)
			if (event.defaultPrevented) return

			const tabs = Array.from(
				event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])'),
			)
			if (tabs.length === 0) return

			const active = event.currentTarget.ownerDocument?.activeElement
			const currentIndex = active ? tabs.indexOf(active as HTMLButtonElement) : -1

			const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
			const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

			let nextIndex: number
			if (event.key === nextKey) {
				nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
			} else if (event.key === prevKey) {
				nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
			} else if (event.key === 'Home') {
				nextIndex = 0
			} else if (event.key === 'End') {
				nextIndex = tabs.length - 1
			} else {
				return
			}

			event.preventDefault()
			const next = tabs[nextIndex]
			next?.focus()
			next?.click()
		}

		const layoutClass = ctx
			? tabListLayoutByVariant[ctx.variant][ctx.orientation]
			: 'inline-flex gap-npi-1'

		return (
			<div
				ref={ref}
				role="tablist"
				aria-orientation={isVertical ? 'vertical' : 'horizontal'}
				onKeyDown={handleKeyDown}
				className={twMerge(clsx(layoutClass, className))}
				{...rest}
			>
				{children}
			</div>
		)
	},
)
TabList.displayName = 'TabList'

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'value'> {
	/** Identifies which tab is active when wrapped in `<Tabs>`. Required for the functional Tabs API; omit only when using `Tab` standalone as a styled trigger. */
	value?: string
	/** Visual style — overrides the variant inherited from `<Tabs>`. */
	variant?: TabVariant
	/**
	 * Size — overrides the size inherited from `<Tabs>` (only meaningful for `pill`).
	 * Pill `M` is 22px tall; on touch surfaces prefer `L` (30px) so the hit target is closer to the
	 * WCAG 2.5.8 recommendation of 24×24.
	 */
	size?: TabSize
	/** Forces the active visual state. Ignored when used inside `<Tabs>` with a `value` (state comes from context). */
	selected?: boolean
	/** Icon rendered before the label (only meaningful for `icon` variant) */
	iconBefore?: IconName
	/** Tab label */
	children: ReactNode
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(
	(
		{
			value,
			variant: variantProp,
			size: sizeProp,
			selected: selectedProp,
			iconBefore,
			children,
			className,
			onClick,
			...props
		},
		ref,
	) => {
		const ctx = useContext(TabsContext)
		const inTabs = ctx !== null && value !== undefined

		const variant: TabVariant = variantProp ?? ctx?.variant ?? 'segmented'
		const size: TabSize = sizeProp ?? ctx?.size ?? 'M'

		const selected = inTabs ? ctx.value === value : (selectedProp ?? false)

		const ariaProps: React.ButtonHTMLAttributes<HTMLButtonElement> = inTabs
			? {
				role: 'tab',
				id: `${ctx.idPrefix}-tab-${value}`,
				'aria-selected': selected,
				'aria-controls': `${ctx.idPrefix}-panel-${value}`,
				tabIndex: selected ? 0 : -1,
			}
			: { 'aria-pressed': selected }

		const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
			onClick?.(event)
			if (event.defaultPrevented) return
			if (inTabs) ctx.setValue(value)
		}

		const showIcon = variant === 'icon' && iconBefore != null

		return (
			<TabRoot
				ref={ref}
				variant={variant}
				size={size}
				selected={selected}
				className={className}
				onClick={handleClick}
				{...ariaProps}
				{...props}
			>
				{showIcon && <Icon name={iconBefore} className="size-6 shrink-0" />}
				<span>{children}</span>
			</TabRoot>
		)
	},
)
Tab.displayName = 'Tab'

export interface TabPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role' | 'id' | 'aria-labelledby' | 'hidden'> {
	/** Tab value this panel corresponds to. */
	value: string
	children: ReactNode
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
	({ value, children, className, ...rest }, ref) => {
		const ctx = useContext(TabsContext)
		if (!ctx) return null

		const active = ctx.value === value
		if (!active) return null

		// In vertical mode the TabPanel sits next to TabList in a flex row — take the remaining space.
		const verticalClass = ctx.orientation === 'vertical' ? 'min-w-0 flex-1' : ''

		return (
			<div
				ref={ref}
				role="tabpanel"
				id={`${ctx.idPrefix}-panel-${value}`}
				aria-labelledby={`${ctx.idPrefix}-tab-${value}`}
				tabIndex={0}
				className={twMerge(verticalClass, className)}
				{...rest}
			>
				{children}
			</div>
		)
	},
)
TabPanel.displayName = 'TabPanel'
