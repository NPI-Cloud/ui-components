'use client'

import { useMemo, useState } from 'react'
import { Badge } from '../components/Badge'
import { Table, TableBody, TableCell, type TableDensity, TableHead, TableHeader, TableRow, type TableSortDirection } from '../components/Table'
import { Icon, type IconName, iconRegistryM } from '../icons'
import { normalizeTableBlockData, type TableBlockCell, type TableBlockColumn, type TableBlockRow, type TableCellLeaf, tableCellPlainText, tableColumnAlign } from './table-block-data'

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

// Sorting derives from the column kind — `number` and `date` compare parsed values, the rest the
// Czech collator over the plain-text projection.
const compareRows = (a: TableBlockRow, b: TableBlockRow, column: TableBlockColumn): number => {
	const textA = tableCellPlainText(a.cells[column.id])
	const textB = tableCellPlainText(b.cells[column.id])
	if (column.kind === 'number' || column.kind === 'date') {
		const parse = column.kind === 'number' ? parseNumeric : parseDate
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

const leafClass = (leaf: TableCellLeaf, linked: boolean): string | undefined => {
	const classes = [
		leaf.isBold && 'font-bold',
		leaf.isItalic && 'italic',
		leaf.isUnderlined && 'underline',
		linked && 'text-npi-text-link hover:underline',
	].filter(Boolean)
	return classes.length > 0 ? classes.join(' ') : undefined
}

/**
 * Renders a cell's content — rich lines (marks, line breaks, text-range links) when present, plain
 * text otherwise. `suppressLinks` skips leaf anchors when the whole cell is already wrapped in one
 * (nested `<a>` is invalid HTML); the link styling stays.
 */
export function TableCellContent({ cell, suppressLinks }: { cell: TableBlockCell | undefined; suppressLinks?: boolean }) {
	if (!cell?.content) return <>{cell?.text}</>
	return (
		<>
			{/* Content is display data without stable ids; index keys are fine for a read-only render. */}
			{cell.content.map((line, lineIndex) => (
				<span key={lineIndex}>
					{lineIndex > 0 && <br />}
					{line.map((leaf, leafIndex) =>
						leaf.link && !suppressLinks
							? <a key={leafIndex} href={leaf.link} className={leafClass(leaf, true)}>{leaf.text}</a>
							: <span key={leafIndex} className={leafClass(leaf, !!leaf.link)}>{leaf.text}</span>)}
				</span>
			))}
		</>
	)
}

/**
 * Full visual of one body cell by its COLUMN's kind — an icon alone, the text chipped in a Badge
 * (tone per cell, neutral by default), a number with the column's unit suffixed, or plain/rich
 * text — optionally wrapped in the cell-level link. Shared by the public renderer and the
 * editor's read-only preview. Inside a Badge chip, text-range links are suppressed (the chip is
 * one unit; link it via the cell link).
 */
export function TableCellVisual({ cell, column }: { cell: TableBlockCell | undefined; column?: TableBlockColumn }) {
	if (!cell) return null
	const kind = column?.kind
	let inner: React.ReactNode
	if (kind === 'icon') {
		const icon = cell.icon && cell.icon in iconRegistryM ? (cell.icon as IconName) : null
		if (!icon) return null
		inner = <Icon name={icon} className="inline-block size-4 shrink-0 align-middle" />
	} else if (kind === 'badge') {
		if (tableCellPlainText(cell) === '') return null
		inner = <Badge tone={cell.badge ?? 'neutral'}><TableCellContent cell={cell} suppressLinks /></Badge>
	} else {
		const unit = kind === 'number' && column?.unit && tableCellPlainText(cell) !== '' ? column.unit : null
		inner = (
			<>
				<TableCellContent cell={cell} suppressLinks={!!cell.link} />
				{unit && <>{' '}{unit}</>}
			</>
		)
	}
	return cell.link ? <a href={cell.link} className="hover:underline">{inner}</a> : inner
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
							align={tableColumnAlign(column)}
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
								<TableCell key={column.id} align={tableColumnAlign(column)} link={!!cell?.link}>
									<TableCellVisual cell={cell} column={column} />
								</TableCell>
							)
						})}
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
