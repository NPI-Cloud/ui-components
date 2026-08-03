'use client'

import { useMemo, useState } from 'react'
import { Table, type TableAlign, TableBody, TableCell, type TableDensity, TableHead, TableHeader, TableRow, type TableSortDirection } from '../components/Table'

export const tableBlockSortTypes = ['text', 'number', 'date'] as const
export type TableBlockSortType = (typeof tableBlockSortTypes)[number]

export interface TableBlockColumn {
	id: string
	header: string
	align?: TableAlign | null
	sortable?: boolean | null
	/** How cell values compare when the visitor sorts this column. Default `text`. */
	sortAs?: TableBlockSortType | null
	/** Optional CSS width for the column (`'160px'`, `'20%'`). */
	width?: string | null
}

export interface TableBlockCell {
	text?: string | null
	/** Resolved href snapshot — renders the cell as a link in link-blue. */
	link?: string | null
}

export interface TableBlockRow {
	id: string
	/** Keyed by column id, so column reorder never re-maps cell values. */
	cells: Record<string, TableBlockCell>
}

export interface TableBlockData {
	columns: TableBlockColumn[]
	rows: TableBlockRow[]
}

const isAlign = (v: unknown): v is TableAlign => v === 'left' || v === 'center' || v === 'right'
const isSortType = (v: unknown): v is TableBlockSortType => v === 'text' || v === 'number' || v === 'date'

// Tolerant parse of the stored JSON document (`WebsiteBlock.tableData`) into a clean grid. Never
// throws on malformed input — unknown keys are dropped, missing ids fall back to positional ones
// (deterministic, so SSR and client render identically). Returns null when there is no usable grid.
export function normalizeTableBlockData(value: unknown): TableBlockData | null {
	if (typeof value !== 'object' || value === null) return null
	const doc = value as { columns?: unknown; rows?: unknown }
	if (!Array.isArray(doc.columns)) return null
	const columns = doc.columns.flatMap((entry, index): TableBlockColumn[] => {
		if (typeof entry !== 'object' || entry === null) return []
		const col = entry as Record<string, unknown>
		return [{
			id: typeof col.id === 'string' && col.id !== '' ? col.id : `c${index}`,
			header: typeof col.header === 'string' ? col.header : '',
			align: isAlign(col.align) ? col.align : null,
			sortable: col.sortable === true,
			sortAs: isSortType(col.sortAs) ? col.sortAs : null,
			width: typeof col.width === 'string' && col.width !== '' ? col.width : null,
		}]
	})
	if (columns.length === 0) return null
	const rawRows = Array.isArray(doc.rows) ? doc.rows : []
	const rows = rawRows.flatMap((entry, index): TableBlockRow[] => {
		if (typeof entry !== 'object' || entry === null) return []
		const row = entry as Record<string, unknown>
		const rawCells = typeof row.cells === 'object' && row.cells !== null ? row.cells as Record<string, unknown> : {}
		const cells: Record<string, TableBlockCell> = {}
		for (const column of columns) {
			const cell = rawCells[column.id]
			if (typeof cell !== 'object' || cell === null) continue
			const { text, link } = cell as Record<string, unknown>
			cells[column.id] = {
				text: typeof text === 'string' ? text : null,
				link: typeof link === 'string' && link !== '' ? link : null,
			}
		}
		return [{ id: typeof row.id === 'string' && row.id !== '' ? row.id : `r${index}`, cells }]
	})
	return { columns, rows }
}

const collator = new Intl.Collator('cs', { sensitivity: 'base', numeric: true })

// "12 540,50" / "84 %" / "1.5" → number. Strips spaces (incl. nbsp) and any trailing non-numeric
// unit, treats a comma as the decimal separator. NaN sorts last regardless of direction.
const parseNumeric = (text: string): number => {
	const cleaned = text.replace(/[\s ]/g, '').replace(',', '.').replace(/[^0-9.+-]/g, '')
	return cleaned === '' ? Number.NaN : Number.parseFloat(cleaned)
}

// Czech "12. 6. 2026" (with or without spaces) or anything Date.parse understands (ISO). NaN last.
const parseDate = (text: string): number => {
	const cs = /^\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\s*$/.exec(text)
	if (cs) return new Date(Number(cs[3]), Number(cs[2]) - 1, Number(cs[1])).getTime()
	const parsed = Date.parse(text)
	return Number.isNaN(parsed) ? Number.NaN : parsed
}

const compareRows = (a: TableBlockRow, b: TableBlockRow, column: TableBlockColumn): number => {
	const textA = a.cells[column.id]?.text ?? ''
	const textB = b.cells[column.id]?.text ?? ''
	if (column.sortAs === 'number' || column.sortAs === 'date') {
		const parse = column.sortAs === 'number' ? parseNumeric : parseDate
		const numA = parse(textA)
		const numB = parse(textB)
		const aInvalid = Number.isNaN(numA)
		const bInvalid = Number.isNaN(numB)
		if (aInvalid || bInvalid) return aInvalid === bInvalid ? 0 : aInvalid ? 1 : -1
		return numA - numB
	}
	return collator.compare(textA, textB)
}

export interface TableBlockProps {
	/** The stored `tableData` JSON — accepts the raw unknown value and normalizes internally. */
	data: unknown
	density?: TableDensity | null
	/** Table title ("Nadpis tabulky") rendered above the grid. */
	title?: string | null
	/** Disables the interactive sorting affordance (editor canvas — headers are being edited). */
	staticHeader?: boolean
}

interface SortState {
	columnId: string
	direction: TableSortDirection
}

/**
 * Renders the table block's authored grid. Sorting is purely client-side: clicking a sortable
 * header cycles asc → desc → authored order; the server always renders the authored order, so
 * there is no CLS and the full content is in the HTML.
 */
export function TableBlock({ data, density, title, staticHeader }: TableBlockProps) {
	const grid = useMemo(() => normalizeTableBlockData(data), [data])
	const [sort, setSort] = useState<SortState | null>(null)

	const rows = useMemo(() => {
		if (!grid || !sort) return grid?.rows ?? []
		const column = grid.columns.find(c => c.id === sort.columnId)
		if (!column) return grid.rows
		const dir = sort.direction === 'desc' ? -1 : 1
		return [...grid.rows].sort((a, b) => dir * compareRows(a, b, column))
	}, [grid, sort])

	if (!grid) return null

	const cycleSort = (columnId: string) =>
		setSort(prev => {
			if (prev?.columnId !== columnId) return { columnId, direction: 'asc' }
			return prev.direction === 'asc' ? { columnId, direction: 'desc' } : null
		})

	return (
		<Table density={density ?? undefined} title={title || undefined}>
			<TableHeader>
				<TableRow>
					{grid.columns.map(column => (
						<TableHead
							key={column.id}
							align={column.align ?? 'left'}
							width={column.width ?? undefined}
							sortable={!staticHeader && column.sortable === true}
							sortDirection={sort?.columnId === column.id ? sort.direction : null}
							onSort={() => cycleSort(column.id)}
						>
							{column.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{rows.map(row => (
					<TableRow key={row.id}>
						{grid.columns.map(column => {
							const cell = row.cells[column.id]
							return (
								<TableCell key={column.id} align={column.align ?? 'left'} link={!!cell?.link}>
									{cell?.link
										? <a href={cell.link} className="hover:underline">{cell.text}</a>
										: cell?.text}
								</TableCell>
							)
						})}
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
