import { clsx } from 'clsx'
import { createContext, forwardRef, type MouseEvent, useContext } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export const accordionVariants = ['plain', 'boxed'] as const
export const accordionSizes = ['m', 's'] as const

export type AccordionVariant = (typeof accordionVariants)[number]
export type AccordionSize = (typeof accordionSizes)[number]

interface AccordionContextValue {
	variant: AccordionVariant
	size: AccordionSize
}

const AccordionContext = createContext<AccordionContextValue>({
	variant: 'plain',
	size: 'm',
})

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
	/** Visual container — `plain` adds separator lines between items, `boxed` wraps the group in a gray rounded box with no lines */
	variant?: AccordionVariant
	/** Heading size — `m` (20px Bitter Medium) for top-level, `s` (16px Bitter Bold) for nested second-level */
	size?: AccordionSize
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
	({ variant = 'plain', size = 'm', className, children, ...props }, ref) => (
		<AccordionContext.Provider value={{ variant, size }}>
			<div
				ref={ref}
				className={twMerge(
					clsx(
						'flex flex-col font-npi-sans',
						variant === 'boxed'
							&& 'overflow-clip rounded-npi-xs bg-npi-gray-50 px-npi-8',
						className,
					),
				)}
				{...props}
			>
				{children}
			</div>
		</AccordionContext.Provider>
	),
)
Accordion.displayName = 'Accordion'

export interface AccordionItemProps extends Omit<React.HTMLAttributes<HTMLDetailsElement>, 'title' | 'onToggle'> {
	/** Header content — string or any JSX (supports multi-line, medallion blocks, etc.) */
	title: React.ReactNode
	/** Secondary text shown under the title (Noto Sans 16px). Use for subtitle, role, or description patterns. */
	description?: React.ReactNode
	/** Optional leading slot rendered before the title — icon, number, switch, etc. */
	leading?: React.ReactNode
	/** Initially expanded (uncontrolled) */
	defaultOpen?: boolean
	/** Force expanded state (controlled). When set, use `onToggle` to react to user intent. */
	open?: boolean
	/** Disables interaction and greys out the row */
	disabled?: boolean
	/** Fires when the user attempts to toggle — receives the next open state */
	onToggle?: (open: boolean) => void
}

export const AccordionItem = forwardRef<HTMLDetailsElement, AccordionItemProps>(
	(
		{
			title,
			description,
			leading,
			defaultOpen,
			open,
			disabled,
			onToggle,
			className,
			children,
			...props
		},
		ref,
	) => {
		const { variant, size } = useContext(AccordionContext)
		const hasLeading = Boolean(leading)

		const handleSummaryClick = (event: MouseEvent<HTMLElement>) => {
			if (disabled) {
				event.preventDefault()
				return
			}
			if (open !== undefined) event.preventDefault()
			onToggle?.(
				!(event.currentTarget.parentElement as HTMLDetailsElement).open,
			)
		}

		return (
			<details
				ref={ref}
				open={open ?? defaultOpen}
				className={twMerge(
					clsx(
						variant === 'plain' && 'border-t border-npi-gray-200 last:border-b',
						className,
					),
				)}
				{...props}
			>
				<summary
					onClick={handleSummaryClick}
					aria-disabled={disabled || undefined}
					className={clsx(
						'flex list-none items-center gap-npi-6 py-npi-6 outline-none',
						'[&::-webkit-details-marker]:hidden',
						'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
						'transition-colors',
						disabled
							? 'cursor-not-allowed text-npi-gray-700'
							: 'cursor-pointer text-npi-blue hover:text-npi-blue-hover active:text-npi-blue-hover',
					)}
				>
					{hasLeading && <span className="flex shrink-0 items-center">{leading}</span>}
					<span className="flex min-w-0 flex-1 flex-col gap-npi-1">
						<span
							className={clsx(
								'font-npi-serif leading-[1.2]',
								size === 'm' ? 'text-[1.25rem] font-medium' : 'text-[1rem] font-bold',
							)}
						>
							{title}
						</span>
						{description && (
							<span
								className={clsx(
									'font-npi-sans font-normal text-npi-text-primary',
									size === 'm' ? 'text-[1rem] leading-[1.5]' : 'text-[0.875rem] leading-[1.3]',
								)}
							>
								{description}
							</span>
						)}
					</span>
					<Icon
						name="arrowDolu"
						className="size-6 shrink-0 transition-transform duration-200 [details[open]>summary>&]:rotate-180"
						aria-hidden="true"
					/>
				</summary>
				<div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-out [details[open]>&]:grid-rows-[1fr]">
					<div className="min-h-0 overflow-hidden">
						<div className="flex gap-npi-6 pb-npi-6">
							{hasLeading && (
								<span aria-hidden className="invisible shrink-0">
									{leading}
								</span>
							)}
							<div className="min-w-0 flex-1 font-npi-sans text-[1rem] leading-[1.5] text-npi-text-primary">
								{children}
							</div>
							<span aria-hidden className="invisible size-6 shrink-0" />
						</div>
					</div>
				</div>
			</details>
		)
	},
)
AccordionItem.displayName = 'AccordionItem'
