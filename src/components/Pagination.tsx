'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import {
	buildPageItems,
	ELLIPSIS,
	navButtonIconBase,
	navButtonTextBase,
	numberCellBase,
	numberCellIdle,
	numberCellSelected,
	paginationVariants,
	type PaginationVariant,
} from './pagination-shared'

export { paginationVariants, type PaginationVariant }

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
	/** Currently active page (1-indexed). */
	currentPage: number
	/** Total number of pages. Pass `0` to render nothing. */
	totalPages: number
	/** Called with the new page number when the user activates a page item or prev/next. */
	onPageChange: (page: number) => void
	/**
	 * Visual style of the prev/next controls.
	 * - `icon` (default): icon-only chevron buttons
	 * - `text`: chevron + label ("Předchozí" / "Následující")
	 */
	variant?: PaginationVariant
	/** Number of pages to show adjacent to the current page on each side. Defaults to `1`. */
	siblingCount?: number
	/** Number of pages always shown at the start and end. Defaults to `1`. */
	boundaryCount?: number
	/** Disables the entire pagination control. */
	disabled?: boolean
	/** Label for the previous-page control (used as both visible text in `text` variant and `aria-label` in `icon` variant). */
	previousLabel?: string
	/** Label for the next-page control (used as both visible text in `text` variant and `aria-label` in `icon` variant). */
	nextLabel?: string
	/** `aria-label` for the root `<nav>`. Defaults to `'Stránkování'`. */
	'aria-label'?: string
	/** Builds the `aria-label` for a page-number button. Defaults to Czech `Stránka {page}`. */
	pageLabel?: (page: number) => string
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(
	(
		{
			currentPage,
			totalPages,
			onPageChange,
			variant = 'icon',
			siblingCount = 1,
			boundaryCount = 1,
			disabled = false,
			previousLabel = 'Předchozí',
			nextLabel = 'Následující',
			pageLabel = page => `Stránka ${page}`,
			className,
			'aria-label': ariaLabel = 'Stránkování',
			...props
		},
		ref,
	) => {
		if (totalPages <= 0) return null

		const isFirst = currentPage <= 1
		const isLast = currentPage >= totalPages
		const items = buildPageItems(currentPage, totalPages, siblingCount, boundaryCount)

		const goTo = (page: number) => {
			if (disabled) return
			const next = Math.min(Math.max(page, 1), totalPages)
			if (next === currentPage) return
			onPageChange(next)
		}

		const prevDisabled = disabled || isFirst
		const nextDisabled = disabled || isLast

		return (
			<nav
				ref={ref}
				aria-label={ariaLabel}
				className={twMerge(clsx('inline-flex items-center gap-npi-6', className))}
				{...props}
			>
				{variant === 'icon'
					? (
						<button
							type="button"
							onClick={() => goTo(currentPage - 1)}
							disabled={prevDisabled}
							aria-label={previousLabel}
							className={navButtonIconBase}
						>
							<Icon name="arrowVlevo" size="m" className="size-6" aria-hidden="true" />
						</button>
					)
					: (
						<button
							type="button"
							onClick={() => goTo(currentPage - 1)}
							disabled={prevDisabled}
							className={navButtonTextBase}
						>
							<Icon name="arrowVlevo" size="m" className="size-6" aria-hidden="true" />
							<span>{previousLabel}</span>
						</button>
					)}

				<ol className="inline-flex items-center gap-npi-1">
					{items.map((item, i) => {
						if (item === ELLIPSIS) {
							return (
								<li key={`ellipsis-${i}`} aria-hidden="true" className={clsx(numberCellBase, 'text-npi-blue cursor-default')}>
									<span>{ELLIPSIS}</span>
								</li>
							)
						}
						const isCurrent = item === currentPage
						return (
							<li key={item} className="inline-flex">
								<button
									type="button"
									onClick={() => goTo(item)}
									disabled={disabled || isCurrent}
									aria-current={isCurrent ? 'page' : undefined}
									aria-label={pageLabel(item)}
									className={clsx(numberCellBase, isCurrent ? numberCellSelected : numberCellIdle)}
								>
									{item}
								</button>
							</li>
						)
					})}
				</ol>

				{variant === 'icon'
					? (
						<button
							type="button"
							onClick={() => goTo(currentPage + 1)}
							disabled={nextDisabled}
							aria-label={nextLabel}
							className={navButtonIconBase}
						>
							<Icon name="arrowVpravo" size="m" className="size-6" aria-hidden="true" />
						</button>
					)
					: (
						<button
							type="button"
							onClick={() => goTo(currentPage + 1)}
							disabled={nextDisabled}
							className={navButtonTextBase}
						>
							<span>{nextLabel}</span>
							<Icon name="arrowVpravo" size="m" className="size-6" aria-hidden="true" />
						</button>
					)}
			</nav>
		)
	},
)
Pagination.displayName = 'Pagination'
