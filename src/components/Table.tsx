'use client'

import { clsx } from 'clsx'
import { createContext, forwardRef, type ReactNode, useContext } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import { Scrollbar } from './Scrollbar'
import { Text } from './Text'

export const tableDensities = ['comfortable', 'compact', 'condensed'] as const
export type TableDensity = (typeof tableDensities)[number]

export const tableAligns = ['left', 'center', 'right'] as const
export type TableAlign = (typeof tableAligns)[number]

export const tableSortDirections = ['asc', 'desc'] as const
export type TableSortDirection = (typeof tableSortDirections)[number]

interface TableContextValue {
	density: TableDensity
}

const TableContext = createContext<TableContextValue>({ density: 'comfortable' })

/**
 * Cell vertical padding per density. Matches Figma `Tabulka v3 - vysoká` (comfortable),
 * `Tabulka v1 - střední` (compact), and `Tabulka v2 - úsporná` (condensed).
 *
 * Body text color defaults to `text-npi-text-primary` (#02216E, navy) — matches the Figma
 * frame where primary-data cells (names, amounts) render in navy. Mark a cell as a link with
 * the `link` prop to render it in `text-npi-text-link` (#3566FC) blue, as Figma does for the
 * navigational columns (e.g. "Prevence").
 *
 * - `comfortable` (vysoká) → 22/23px → row height 80px, body text 16px
 * - `compact` (střední)    → 14px    → row height 52px, body text 16px
 * - `condensed` (úsporná)  → 11px    → row height 40px, body text 14px
 */
const cellDensityClasses: Record<TableDensity, string> = {
	comfortable: 'pt-[22px] pb-[23px] text-[1rem] leading-[1.5]',
	compact: 'py-[14px] text-[1rem] leading-[1.5]',
	condensed: 'py-[11px] text-[0.875rem] leading-[1.3]',
}

/**
 * Header cell height per density. Header text is 12px / `#525252` and is vertically centered,
 * so the row height stays constant whether or not a sort arrow is shown (the arrow only renders
 * for the actively-sorted column). Matches Figma `Buňka hlavičky` — the medium header is 48px.
 *
 * - `comfortable` → 80px (aligns with the 80px comfortable body row)
 * - `compact`     → 48px (Figma `Tabulka střední` header)
 * - `condensed`   → 40px
 */
const headDensityClasses: Record<TableDensity, string> = {
	comfortable: 'h-[80px]',
	compact: 'h-[48px]',
	condensed: 'h-[40px]',
}

const alignClasses: Record<TableAlign, string> = {
	left: 'text-left',
	center: 'text-center',
	right: 'text-right',
}

export interface TableProps extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'title'> {
	/**
	 * Visual density. Controls row height, cell padding, and body text size.
	 * - `comfortable` (default, "vysoká") — 80px rows, 16px body, generous spacing for read-heavy lists
	 * - `compact` ("střední") — 52px rows, 16px body
	 * - `condensed` ("úsporná") — 40px rows, 14px body, dense data
	 */
	density?: TableDensity
	/**
	 * Wrap the table in an NPI-styled horizontal scroll container so wide tables stay usable on
	 * narrow / mobile viewports instead of overflowing the layout. On by default; a table that
	 * fits its container shows no scrollbar. Set to `false` to render a bare `<table>`.
	 */
	scrollable?: boolean
	/**
	 * Optional table heading ("Nadpis tabulky") rendered above the table. Pass a string to get the
	 * default NPI heading style (16px bold navy), or pass your own `Heading`/`Text` node for a
	 * different level. The heading stays fixed above the horizontal scroll area.
	 */
	title?: ReactNode
}

/**
 * Headless/structural table primitive. Lays out a `<table>` with NPI tokens and
 * delegates sorting/selection/pagination to the consumer. Compose with
 * `Pagination` and `Checkbox` as needed.
 *
 * By default the table is wrapped in a horizontal `Scrollbar` so it degrades to
 * side-scrolling on mobile rather than breaking the page layout — opt out with `scrollable={false}`.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
	({ density = 'comfortable', scrollable = true, title, className, children, ...props }, ref) => {
		const table = (
			<table
				ref={ref}
				className={twMerge(
					clsx('w-full border-collapse font-npi-sans text-npi-text-primary', className),
				)}
				{...props}
			>
				{children}
			</table>
		)

		const scrolled = scrollable ? <Scrollbar direction="horizontal" className="w-full">{table}</Scrollbar> : table

		return (
			<TableContext.Provider value={{ density }}>
				{title
					? (
						<div className="flex flex-col gap-npi-4">
							{typeof title === 'string'
								? <Text variant="l" weight="bold" className="text-npi-text-primary">{title}</Text>
								: title}
							{scrolled}
						</div>
					)
					: scrolled}
			</TableContext.Provider>
		)
	},
)
Table.displayName = 'Table'

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
	({ className, ...props }, ref) => <thead ref={ref} className={twMerge(clsx(className))} {...props} />,
)
TableHeader.displayName = 'TableHeader'

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
	({ className, ...props }, ref) => <tbody ref={ref} className={twMerge(clsx(className))} {...props} />,
)
TableBody.displayName = 'TableBody'

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
	/**
	 * Marks the row as selected for assistive tech (`aria-selected`). It intentionally does NOT
	 * paint a row background — selection is communicated by the row's checkbox, per the Figma design.
	 */
	selected?: boolean
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
	({ selected, className, ...props }, ref) => (
		<tr
			ref={ref}
			data-selected={selected || undefined}
			aria-selected={selected || undefined}
			className={twMerge(
				clsx('border-t border-npi-gray-200 last:border-b', className),
			)}
			{...props}
		/>
	),
)
TableRow.displayName = 'TableRow'

export interface TableHeadProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
	/** Horizontal text alignment. Defaults to `left` for left/center cells, `right` for right-aligned. */
	align?: TableAlign
	/** Marks the column as sortable — renders a chevron next to the label and makes the cell a button-like target. */
	sortable?: boolean
	/** Current sort direction for this column. `null`/undefined = column is sortable but inactive. */
	sortDirection?: TableSortDirection | null
	/** Fires when the user clicks a sortable header. */
	onSort?: () => void
	/**
	 * Override the column width. Native `<col>` widths are easier to manage,
	 * but for ad-hoc tables you can pass a CSS value here (`'160px'`, `'10rem'`, `'1fr'`).
	 */
	width?: string | number
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
	({ align = 'left', sortable, sortDirection, onSort, width, className, children, style, ...props }, ref) => {
		const { density } = useContext(TableContext)
		const cellPadding = align === 'left' ? 'pr-npi-3' : align === 'right' ? 'pl-npi-3' : 'px-npi-3'
		const sortActive = sortDirection === 'asc' || sortDirection === 'desc'

		const content = (
			<span
				className={clsx(
					'inline-flex items-center gap-npi-1',
					align === 'center' && 'justify-center',
					align === 'right' && 'justify-end',
				)}
			>
				<span>{children}</span>
				{sortable && (
					// Figma headers carry no arrow until a column is the active sort. The slot is always
					// reserved (so toggling sort never shifts the layout) but stays invisible until the
					// column is sorted or the header is hovered/focused — keeping the affordance discoverable.
					<Icon
						name={sortDirection === 'asc' ? 'arrowNahoru' : 'arrowDolu'}
						className={clsx(
							'size-6 shrink-0 transition-opacity',
							sortActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60 group-focus-visible:opacity-60',
						)}
						aria-hidden="true"
					/>
				)}
			</span>
		)

		return (
			<th
				ref={ref}
				scope="col"
				aria-sort={sortable
					? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none')
					: undefined}
				style={{ ...style, width }}
				className={twMerge(
					clsx(
						'align-middle font-normal',
						headDensityClasses[density],
						cellPadding,
						alignClasses[align],
						'text-[0.75rem] leading-[1.3] text-npi-gray-700',
						className,
					),
				)}
				{...props}
			>
				{sortable
					? (
						<button
							type="button"
							onClick={onSort}
							className={clsx(
								'group inline-flex w-full items-center gap-npi-1 bg-transparent text-inherit cursor-pointer',
								'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
								align === 'left' && 'justify-start',
								align === 'center' && 'justify-center',
								align === 'right' && 'justify-end',
							)}
						>
							{content}
						</button>
					)
					: content}
			</th>
		)
	},
)
TableHead.displayName = 'TableHead'

export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
	/** Horizontal text alignment. */
	align?: TableAlign
	/**
	 * Renders the cell text in link-blue (`text-npi-text-link`, #3566FC) instead of the default
	 * navy. Use for navigational / link cells — matches the Figma columns that read as links.
	 */
	link?: boolean
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
	({ align = 'left', link, className, style, ...props }, ref) => {
		const { density } = useContext(TableContext)
		const cellPadding = align === 'left' ? 'pr-npi-3' : align === 'right' ? 'pl-npi-3' : 'px-npi-3'

		return (
			<td
				ref={ref}
				style={style}
				className={twMerge(
					clsx(
						'align-middle',
						cellDensityClasses[density],
						cellPadding,
						alignClasses[align],
						link && 'text-npi-text-link',
						className,
					),
				)}
				{...props}
			/>
		)
	},
)
TableCell.displayName = 'TableCell'
