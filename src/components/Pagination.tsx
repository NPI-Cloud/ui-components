import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export const paginationVariants = ['icon', 'text'] as const
export type PaginationVariant = (typeof paginationVariants)[number]

const ELLIPSIS = '…'
type PageItem = number | typeof ELLIPSIS

/**
 * Build the list of page items to render given the current page, total pages,
 * and how many siblings/boundaries to show. Inserts an ellipsis (…) wherever
 * there's a gap of more than one page.
 *
 * Items shown = first `boundaryCount` ∪ (currentPage ± siblingCount) ∪ last `boundaryCount`.
 * If a gap is exactly one page, the missing page is rendered instead of `…` (avoids "1 … 3").
 *
 * Examples (siblings = 1, boundaries = 1):
 *   current = 2, total = 12 → [1, 2, 3, …, 12]
 *   current = 6, total = 12 → [1, …, 5, 6, 7, …, 12]
 *   current = 1, total = 12 → [1, 2, …, 12]
 */
function buildPageItems(currentPage: number, totalPages: number, siblingCount: number, boundaryCount: number): PageItem[] {
	if (totalPages <= 0) return []

	const pages = new Set<number>()
	for (let i = 1; i <= Math.min(boundaryCount, totalPages); i++) pages.add(i)
	for (let i = Math.max(totalPages - boundaryCount + 1, 1); i <= totalPages; i++) pages.add(i)
	// Adjacent window of `2*siblingCount + 1` pages, anchored on current and clamped
	// against the [1..totalPages] range. Anchoring (rather than strict centering) keeps
	// the count of visible pages stable when current sits near a boundary.
	let siblingStart = currentPage - siblingCount
	let siblingEnd = currentPage + siblingCount
	if (siblingStart < 1) {
		siblingEnd = Math.min(siblingEnd + (1 - siblingStart), totalPages)
		siblingStart = 1
	}
	if (siblingEnd > totalPages) {
		siblingStart = Math.max(siblingStart - (siblingEnd - totalPages), 1)
		siblingEnd = totalPages
	}
	for (let i = siblingStart; i <= siblingEnd; i++) pages.add(i)

	const sorted = [...pages].sort((a, b) => a - b)
	const items: PageItem[] = []
	for (let i = 0; i < sorted.length; i++) {
		const value = sorted[i]!
		if (i > 0) {
			const gap = value - sorted[i - 1]!
			if (gap === 2) {
				items.push(value - 1)
			} else if (gap > 2) {
				items.push(ELLIPSIS)
			}
		}
		items.push(value)
	}
	return items
}

const numberCellBase = clsx(
	'inline-flex size-8 shrink-0 items-center justify-center rounded-npi-xxs py-[3px]',
	'font-npi-sans text-[1rem] leading-[1.5] text-center transition-colors',
	'focus-visible:bg-npi-white focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed',
)

const numberCellSelected = 'bg-npi-blue text-npi-white font-bold cursor-default'

const numberCellIdle = clsx(
	'bg-transparent text-npi-blue font-normal cursor-pointer',
	'hover:text-npi-blue-hover',
	'disabled:text-npi-gray-700 disabled:hover:text-npi-gray-700',
)

const navButtonIconBase = clsx(
	'inline-flex shrink-0 items-center justify-center rounded-npi-xxs cursor-pointer',
	'text-npi-blue transition-colors',
	'hover:text-npi-blue-hover',
	'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed disabled:text-npi-gray-700 disabled:hover:text-npi-gray-700',
)

const navButtonTextBase = clsx(
	'inline-flex shrink-0 items-center gap-npi-2 rounded-npi-xxs cursor-pointer',
	'font-npi-sans text-[1rem] leading-[1.5] text-npi-blue transition-colors',
	'hover:text-npi-blue-hover',
	'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed disabled:text-npi-gray-700 disabled:hover:text-npi-gray-700',
)

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
	/** `aria-label` for the root `<nav>`. Defaults to `'Pagination'`. */
	'aria-label'?: string
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
			className,
			'aria-label': ariaLabel = 'Pagination',
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
									aria-label={`Page ${item}`}
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
