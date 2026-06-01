'use client'

import * as RadixAccordion from '@radix-ui/react-accordion'
import { clsx } from 'clsx'
import { createContext, forwardRef, useContext } from 'react'
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
						variant === 'boxed' && 'gap-npi-2',
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

const ITEM_VALUE = 'item'

export interface AccordionItemProps {
	/** Header content — string or any JSX (supports multi-line, medallion blocks, etc.) */
	title: React.ReactNode
	/** Secondary text shown under the title (Noto Sans 16px). Use for subtitle, role, or description patterns. */
	description?: React.ReactNode
	/** Optional leading slot rendered before the title — icon, number, switch, etc. */
	leading?: React.ReactNode
	/** Profile/medallion slot — a 56px avatar grouped tightly (16px gap) with the title+description and vertically centered. Takes precedence over `leading`. */
	avatar?: React.ReactNode
	/** Initially expanded (uncontrolled) */
	defaultOpen?: boolean
	/** Force expanded state (controlled). When set, use `onToggle` to react to user intent. */
	open?: boolean
	/** Disables interaction and greys out the row */
	disabled?: boolean
	/** Fires when the user attempts to toggle — receives the next open state */
	onToggle?: (open: boolean) => void
	/** Extra classes on the item wrapper */
	className?: string
	/** Body content */
	children?: React.ReactNode
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
	(
		{
			title,
			description,
			leading,
			avatar,
			defaultOpen,
			open,
			disabled,
			onToggle,
			className,
			children,
		},
		ref,
	) => {
		const { variant, size } = useContext(AccordionContext)
		const isMedallion = Boolean(avatar)
		const hasLeading = !isMedallion && Boolean(leading)

		const summary = (
			<span className="flex min-w-0 flex-1 flex-col gap-npi-1 text-start">
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
		)

		const rootValueProps = open !== undefined
			? { value: open ? ITEM_VALUE : '', onValueChange: (v: string) => onToggle?.(v === ITEM_VALUE) }
			: {
				defaultValue: defaultOpen ? ITEM_VALUE : undefined,
				onValueChange: (v: string) => onToggle?.(v === ITEM_VALUE),
			}

		return (
			<RadixAccordion.Root
				ref={ref}
				type="single"
				collapsible
				{...rootValueProps}
				className={twMerge(
					clsx(
						variant === 'plain' && 'border-t border-npi-gray-200 last:border-b',
						variant === 'boxed' && 'overflow-clip rounded-npi-xs bg-npi-gray-50 px-npi-8',
						className,
					),
				)}
			>
				<RadixAccordion.Item value={ITEM_VALUE} disabled={disabled}>
					<RadixAccordion.Header className="flex">
						<RadixAccordion.Trigger
							className={clsx(
								'group flex flex-1 select-none gap-npi-6 py-npi-6 outline-none',
								isMedallion ? 'items-center' : 'items-start',
								'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
								'transition-colors',
								disabled
									? 'cursor-not-allowed text-npi-gray-700'
									: 'cursor-pointer text-npi-blue hover:text-npi-blue-hover active:text-npi-blue-hover',
							)}
						>
							{isMedallion
								? (
									<span className="flex min-w-0 flex-1 items-center gap-npi-4">
										<span className="flex shrink-0 items-center">{avatar}</span>
										{summary}
									</span>
								)
								: (
									<>
										{hasLeading && <span className="flex shrink-0 items-center">{leading}</span>}
										{summary}
									</>
								)}
							<Icon
								name="arrowDolu"
								className="size-6 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
								aria-hidden="true"
							/>
						</RadixAccordion.Trigger>
					</RadixAccordion.Header>
					<RadixAccordion.Content
						className={clsx(
							'overflow-hidden',
							'data-[state=open]:animate-npi-accordion-down',
							'data-[state=closed]:animate-npi-accordion-up',
						)}
					>
						<div className="flex gap-npi-6 pb-npi-6">
							{isMedallion
								? (
									<span className="flex min-w-0 flex-1 items-start gap-npi-4">
										<span aria-hidden className="invisible shrink-0">
											{avatar}
										</span>
										<div className="min-w-0 flex-1 font-npi-sans text-[1rem] leading-[1.5] text-npi-text-primary">
											{children}
										</div>
									</span>
								)
								: (
									<>
										{hasLeading && (
											<span aria-hidden className="invisible shrink-0">
												{leading}
											</span>
										)}
										<div className="min-w-0 flex-1 font-npi-sans text-[1rem] leading-[1.5] text-npi-text-primary">
											{children}
										</div>
									</>
								)}
							<span aria-hidden className="invisible size-6 shrink-0" />
						</div>
					</RadixAccordion.Content>
				</RadixAccordion.Item>
			</RadixAccordion.Root>
		)
	},
)
AccordionItem.displayName = 'AccordionItem'
