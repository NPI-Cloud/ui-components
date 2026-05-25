'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface BreadcrumbsItem {
	/** Visible label. Also used as aria-label for the home icon on desktop. */
	label: string
	/** Link target. Omit for the current page (renders as inactive text). */
	href?: string
}

export interface BreadcrumbsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
	/** Ordered trail of crumbs. `items[0]` is the home crumb (shown as an icon on desktop); the last item is the current page. Below the tablet breakpoint a compact back-arrow layout is shown instead. */
	items: BreadcrumbsItem[]
}

const textPaddingClass = 'pt-npi-1 pb-[3px]'
const textSizeClass = 'text-[0.875rem] leading-[1.3]'

const focusUnderlineClass = 'focus-visible:outline-none focus-visible:shadow-[0_2px_0_0_var(--npi-blue-light)]'

const linkClass = clsx(
	textPaddingClass,
	textSizeClass,
	'text-npi-text-link underline decoration-solid',
	'hover:text-npi-text-link-hover active:text-npi-text-link-hover',
	'focus-visible:no-underline',
	focusUnderlineClass,
)

const currentTextClass = clsx(textPaddingClass, textSizeClass, 'text-npi-text-primary')

const homeLinkClass = clsx(
	'inline-flex size-6 items-center justify-center rounded-npi-xxs text-npi-blue transition-colors',
	'hover:text-npi-blue-hover active:text-npi-blue-hover',
	focusUnderlineClass,
)

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(
	({ items, className, ...props }, ref) => {
		if (items.length === 0) return null

		const lastIndex = items.length - 1
		const parent = items[lastIndex - 1]

		return (
			<nav
				ref={ref}
				aria-label="Breadcrumbs"
				className={twMerge(clsx('font-npi-sans', className))}
				{...props}
			>
				{parent && (
					<a
						href={parent.href}
						className={clsx(
							'inline-flex items-center gap-npi-2 npi-tablet:hidden',
							textPaddingClass,
							textSizeClass,
							'text-npi-text-link underline decoration-solid',
							'hover:text-npi-text-link-hover active:text-npi-text-link-hover',
							'focus-visible:no-underline',
							focusUnderlineClass,
						)}
					>
						<Icon name="arrowVlevo" size="m" className="size-6 shrink-0" aria-hidden="true" />
						<span>{parent.label}</span>
					</a>
				)}

				<ol className="hidden flex-wrap items-center gap-npi-2 npi-tablet:inline-flex">
					{items.map((item, i) => {
						const isHome = i === 0
						const isCurrent = i === lastIndex
						const isLinked = !isCurrent && item.href != null

						return (
							<li key={i} className="inline-flex items-center gap-npi-2">
								{!isHome && (
									<Icon
										name="arrowVpravoSmall"
										size="m"
										className="size-6 shrink-0 text-npi-gray-400"
										aria-hidden="true"
									/>
								)}
								{isHome
									? (isLinked
										? (
											<a href={item.href} aria-label={item.label} className={homeLinkClass}>
												<Icon name="domecek" size="m" className="size-6" />
											</a>
										)
										: (
											<span
												aria-label={item.label}
												aria-current={isCurrent ? 'page' : undefined}
												className="inline-flex size-6 items-center justify-center text-npi-text-primary"
											>
												<Icon name="domecek" size="m" className="size-6" />
											</span>
										))
									: (isLinked
										? <a href={item.href} className={linkClass}>{item.label}</a>
										: (
											<span aria-current={isCurrent ? 'page' : undefined} className={currentTextClass}>
												{item.label}
											</span>
										))}
							</li>
						)
					})}
				</ol>
			</nav>
		)
	},
)
Breadcrumbs.displayName = 'Breadcrumbs'
