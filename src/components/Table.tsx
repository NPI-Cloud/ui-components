import { clsx } from 'clsx'
import { createContext, forwardRef, useContext } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

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
 * Body text color defaults to `text-npi-blue` (#3566FC) — matches the Figma frame where
 * primary-data cells render as link-blue. Override with `className="text-npi-text-primary"`
 * on a `TableCell` when the row should look static (e.g. inverted readonly summaries).
 *
 * - `comfortable` (vysoká) → 22/23px → row height 80px, body text 16px
 * - `compact` (střední)    → 14px    → row height 48px, body text 16px
 * - `condensed` (úsporná)  → 11px    → row height 40px, body text 14px
 */
const cellDensityClasses: Record<TableDensity, string> = {
	comfortable: 'py-[22px] text-[1rem] leading-[1.5]',
	compact: 'py-[14px] text-[1rem] leading-[1.5]',
	condensed: 'py-[11px] text-[0.875rem] leading-[1.3]',
}

/**
 * Header cell vertical padding per density. Header text is 12px / `#525252`.
 * Padding accounts for the 24px sort icon (when present) — sized so the row
 * lands on the target height with the icon centered.
 *
 * - `comfortable` → 28px → 80px row (24 icon + 28+28)
 * - `compact`     → 12px → 48px row (24 icon + 12+12)
 * - `condensed`   →  8px → 40px row (24 icon + 8+8)
 */
const headDensityClasses: Record<TableDensity, string> = {
	comfortable: 'py-[28px]',
	compact: 'py-[12px]',
	condensed: 'py-[8px]',
}

const alignClasses: Record<TableAlign, string> = {
	left: 'text-left',
	center: 'text-center',
	right: 'text-right',
}

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
	/**
	 * Visual density. Controls row height, cell padding, and body text size.
	 * - `comfortable` (default, "vysoká") — 80px rows, 16px body, generous spacing for read-heavy lists
	 * - `compact` ("střední") — 48px rows, 16px body
	 * - `condensed` ("úsporná") — 40px rows, 14px body, dense data
	 */
	density?: TableDensity
}

/**
 * Headless/structural table primitive. Lays out a `<table>` with NPI tokens and
 * delegates sorting/selection/pagination to the consumer. Compose with
 * `Pagination` and `Checkbox` as needed.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(
	({ density = 'comfortable', className, children, ...props }, ref) => (
		<TableContext.Provider value={{ density }}>
			<table
				ref={ref}
				className={twMerge(
					clsx('w-full border-collapse font-npi-sans text-npi-blue', className),
				)}
				{...props}
			>
				{children}
			</table>
		</TableContext.Provider>
	),
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
	/** Highlights the row as currently selected. Adds the light-blue background. */
	selected?: boolean
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
	({ selected, className, ...props }, ref) => (
		<tr
			ref={ref}
			data-selected={selected || undefined}
			className={twMerge(
				clsx(
					'border-t border-npi-gray-200 last:border-b',
					selected && 'bg-npi-blue-lighter',
					className,
				),
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

		const content = (
			<span
				className={clsx(
					'inline-flex items-center gap-0',
					align === 'center' && 'justify-center',
					align === 'right' && 'justify-end',
				)}
			>
				<span>{children}</span>
				{sortable && (
					<Icon
						name={sortDirection === 'asc' ? 'arrowNahoru' : 'arrowDolu'}
						className={clsx(
							'size-6 shrink-0 transition-opacity',
							sortDirection ? 'opacity-100' : 'opacity-60',
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
								'inline-flex w-full items-center gap-0 bg-transparent text-inherit cursor-pointer',
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
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
	({ align = 'left', className, style, ...props }, ref) => {
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
						className,
					),
				)}
				{...props}
			/>
		)
	},
)
TableCell.displayName = 'TableCell'
