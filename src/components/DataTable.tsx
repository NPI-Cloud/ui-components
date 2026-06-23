'use client'

import { type ReactNode, useState } from 'react'
import { Checkbox } from './Checkbox'
import {
	Table,
	TableBody,
	TableCell,
	type TableAlign,
	type TableDensity,
	TableHead,
	TableHeader,
	TableRow,
	type TableSortDirection,
} from './Table'

export interface DataTableColumn<T> {
	/** Stable identifier — also the value passed to `onSort` and matched against the active sort. */
	key: string
	/** Header label. */
	header: ReactNode
	/** Renders the cell body for a row. */
	cell: (row: T) => ReactNode
	/** Horizontal alignment applied to both the header and its cells. */
	align?: TableAlign
	/** Render the cell text in link-blue (`text-npi-text-link`) — for navigational columns. */
	link?: boolean
	/** Make the column sortable. Provide `sortValue` so the rows can actually be ordered. */
	sortable?: boolean
	/** The value this column sorts by. Required for `sortable` columns to do anything. */
	sortValue?: (row: T) => string | number
	/** Fixed column width (CSS value or px number). */
	width?: string | number
}

export interface DataTableProps<T> {
	/** Column definitions, left to right. */
	columns: DataTableColumn<T>[]
	/** Row data. */
	data: T[]
	/** Returns a stable id for a row (used as React key and selection id). */
	rowId: (row: T) => string
	/** Row density — `comfortable` (default), `compact`, or `condensed`. */
	density?: TableDensity
	/** Optional heading rendered above the table (see `Table` `title`). */
	title?: ReactNode
	/** Adds a leading checkbox column with a select-all checkbox in the header. */
	selectable?: boolean
	/** Controlled selection. Omit to let `DataTable` manage selection internally. */
	selectedIds?: ReadonlySet<string>
	/** Fires whenever the selection changes (with the full next selection). */
	onSelectionChange?: (ids: ReadonlySet<string>) => void
	/** Initial sort for the uncontrolled case. */
	defaultSort?: { key: string; direction: TableSortDirection }
	/** Controlled sort. Omit to let `DataTable` manage sort internally (seeded by `defaultSort`). */
	sort?: { key: string; direction: TableSortDirection } | null
	/** Fires when the user toggles a sortable header — pair with `sort` for server-side / controlled ordering. */
	onSortChange?: (sort: { key: string; direction: TableSortDirection }) => void
	/** Wrap in the horizontal scroll container (on by default — keeps wide tables usable on mobile). */
	scrollable?: boolean
	/** Rendered in place of rows when `data` is empty. */
	emptyState?: ReactNode
}

/**
 * Batteries-included data table. Give it `columns` + `data` and it handles sorting (click a
 * sortable header to toggle asc/desc) and row selection (header checkbox selects all, with an
 * indeterminate state for partial selection) internally — no wiring required by the caller.
 *
 * Built on the headless `Table` primitives, so it inherits the NPI density tokens, the navy/link
 * text rules, the active-only sort arrow, and the responsive horizontal scroll. For bespoke
 * layouts (multi-line cells, icon columns, file lists) compose the `Table*` primitives directly.
 */
export function DataTable<T>({
	columns,
	data,
	rowId,
	density = 'comfortable',
	title,
	selectable = false,
	selectedIds,
	onSelectionChange,
	defaultSort,
	sort: sortProp,
	onSortChange,
	scrollable = true,
	emptyState,
}: DataTableProps<T>) {
	const [internalSort, setInternalSort] = useState<{ key: string; direction: TableSortDirection } | null>(defaultSort ?? null)
	const isSortControlled = sortProp !== undefined
	const sort = isSortControlled ? sortProp : internalSort
	const [internalSelected, setInternalSelected] = useState<ReadonlySet<string>>(() => new Set<string>())

	const selected = selectedIds ?? internalSelected
	const setSelected = (next: ReadonlySet<string>) => {
		onSelectionChange?.(next)
		if (selectedIds === undefined) setInternalSelected(next)
	}

	const sortColumn = sort ? columns.find(c => c.key === sort.key) : undefined
	const sortValue = sortColumn?.sortValue
	const sortFactor = sort?.direction === 'desc' ? -1 : 1
	const rows = sortValue
		? [...data].sort((a, b) => {
			const va = sortValue(a)
			const vb = sortValue(b)
			if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * sortFactor
			return String(va).localeCompare(String(vb), 'cs-CZ') * sortFactor
		})
		: data

	const toggleSort = (key: string) => {
		const next: { key: string; direction: TableSortDirection } = sort?.key === key
			? { key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
			: { key, direction: 'asc' }
		if (!isSortControlled) setInternalSort(next)
		onSortChange?.(next)
	}

	const allSelected = data.length > 0 && data.every(r => selected.has(rowId(r)))
	const someSelected = !allSelected && data.some(r => selected.has(rowId(r)))
	const toggleAll = () => setSelected(allSelected ? new Set<string>() : new Set(data.map(rowId)))
	const toggleRow = (id: string) => {
		const next = new Set(selected)
		if (next.has(id)) next.delete(id)
		else next.add(id)
		setSelected(next)
	}

	const colSpan = columns.length + (selectable ? 1 : 0)

	return (
		<Table density={density} title={title} scrollable={scrollable}>
			<TableHeader>
				<TableRow>
					{selectable && (
						<TableHead className="w-px pl-0 pr-npi-3">
							<Checkbox
								aria-label="Vybrat vše"
								checked={allSelected}
								ref={el => {
									if (el) el.indeterminate = someSelected
								}}
								onChange={toggleAll}
							/>
						</TableHead>
					)}
					{columns.map(col => (
						<TableHead
							key={col.key}
							align={col.align}
							width={col.width}
							sortable={col.sortable}
							sortDirection={sort?.key === col.key ? sort.direction : null}
							onSort={col.sortable ? () => toggleSort(col.key) : undefined}
						>
							{col.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.length === 0
					? (
						<TableRow>
							<TableCell colSpan={colSpan} align="center" className="text-npi-text-secondary">
								{emptyState ?? 'Žádná data'}
							</TableCell>
						</TableRow>
					)
					: rows.map(row => {
						const id = rowId(row)
						return (
							<TableRow key={id} selected={selectable ? selected.has(id) : undefined}>
								{selectable && (
									<TableCell className="w-px pl-0 pr-npi-3">
										<Checkbox aria-label="Vybrat řádek" checked={selected.has(id)} onChange={() => toggleRow(id)} />
									</TableCell>
								)}
								{columns.map(col => (
									<TableCell key={col.key} align={col.align} link={col.link}>
										{col.cell(row)}
									</TableCell>
								))}
							</TableRow>
						)
					})}
			</TableBody>
		</Table>
	)
}
DataTable.displayName = 'DataTable'
