import { clsx } from 'clsx'

// Pure, server-safe pieces shared by the interactive <Pagination> (button + callback) and the
// server-rendered <PaginationLinks> (crawlable <a> anchors). Kept out of any 'use client' module
// so a React Server Component can import the helpers and class names directly.

export const paginationVariants = ['icon', 'text'] as const
export type PaginationVariant = (typeof paginationVariants)[number]

export const ELLIPSIS = '…'
export type PageItem = number | typeof ELLIPSIS

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
export function buildPageItems(currentPage: number, totalPages: number, siblingCount: number, boundaryCount: number): PageItem[] {
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

export const numberCellBase = clsx(
	'inline-flex size-8 shrink-0 items-center justify-center rounded-npi-xxs py-[3px]',
	'font-npi-sans text-[1rem] leading-[1.5] text-center transition-colors',
	'focus-visible:bg-npi-white focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed',
)

export const numberCellSelected = 'bg-npi-blue text-npi-white font-bold cursor-default'

export const numberCellIdle = clsx(
	'bg-transparent text-npi-blue font-normal cursor-pointer',
	'hover:text-npi-blue-hover',
	'disabled:text-npi-gray-700 disabled:hover:text-npi-gray-700',
)

export const navButtonIconBase = clsx(
	'inline-flex shrink-0 items-center justify-center rounded-npi-xxs cursor-pointer',
	'text-npi-blue transition-colors',
	'hover:text-npi-blue-hover',
	'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed disabled:text-npi-gray-700 disabled:hover:text-npi-gray-700',
)

export const navButtonTextBase = clsx(
	'inline-flex shrink-0 items-center gap-npi-2 rounded-npi-xxs cursor-pointer',
	'font-npi-sans text-[1rem] leading-[1.5] text-npi-blue transition-colors',
	'hover:text-npi-blue-hover',
	'focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed disabled:text-npi-gray-700 disabled:hover:text-npi-gray-700',
)
