// The table block's stored document shape and its parser. Kept free of `'use client'` so server
// code (the websites page resolver) can normalize `WebsiteBlock.tableData` before render.
import type { BadgeTone } from '../components/badge-tones'
import { badgeTones } from '../components/badge-tones'
import type { TableAlign } from '../components/Table'

// How a column's cells render AND sort — the KIND lives on the column (consistency: a status
// column is all badges, a price column all numbers), the VALUE stays per cell (which icon, which
// tone, what text). Sorting derives from the kind: `number` compares numerically, `date` by the
// parsed date, `icon` never sorts, everything else uses the Czech collator. Default `text`.
export const tableColumnKinds = ['text', 'number', 'date', 'icon', 'badge'] as const
export type TableColumnKind = (typeof tableColumnKinds)[number]

export interface TableBlockColumn {
	id: string
	header: string
	kind?: TableColumnKind | null
	/** Absent = `left`, except `number` columns which default to `right` (typographic standard). */
	align?: TableAlign | null
	/** Never true on `icon` columns — sorting by icon name is meaningless, normalize enforces it. */
	sortable?: boolean | null
	/** Number columns only — unit rendered after every cell value with a non-breaking space ("Kč"). */
	unit?: string | null
}

/** A column's effective alignment — `number` columns right-align unless explicitly overridden. */
export const tableColumnAlign = (column: TableBlockColumn): TableAlign =>
	column.align ?? (column.kind === 'number' ? 'right' : 'left')

/** One formatted text run inside a cell. Mark keys mirror the rich-text leaf convention. */
export interface TableCellLeaf {
	text: string
	isBold?: boolean
	isItalic?: boolean
	isUnderlined?: boolean
	/** Resolved href snapshot — this run renders as a link (rich-text anchor posture). */
	link?: string
}

/** One visual line of a cell — cells support soft line breaks (Shift+Enter in the editor). */
export type TableCellLine = TableCellLeaf[]

// Which of a cell's value slots renders is decided by ITS COLUMN's `kind` — a text column reads
// `content`/`text`, an icon column reads `icon`, a badge column chips the text in the `badge`
// tone. The unused slots stay in the document, so switching a column's kind back and forth never
// loses data.
export interface TableBlockCell {
	/** Plain-text projection of `content`, kept in sync by the editor; sorting compares this. */
	text?: string | null
	/** Whole-cell resolved href snapshot — the cell's visual (any kind) links out. */
	link?: string | null
	/** Rich content (marks + line breaks + text-range links). When absent, `text` renders as-is. */
	content?: TableCellLine[] | null
	/** Icon-registry key — what an icon-kind column renders for this cell. */
	icon?: string | null
	/** Badge tone for a badge-kind column. Absent = the neutral tone. */
	badge?: BadgeTone | null
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
const isColumnKind = (v: unknown): v is TableColumnKind => (tableColumnKinds as readonly string[]).includes(v as string)

const isBadgeTone = (v: unknown): v is BadgeTone => typeof v === 'string' && (badgeTones as readonly string[]).includes(v)

const parseCellContent = (value: unknown): TableCellLine[] | null => {
	if (!Array.isArray(value)) return null
	const lines = value.flatMap((line): TableCellLine[] => {
		if (!Array.isArray(line)) return []
		return [line.flatMap((leaf): TableCellLeaf[] => {
			if (typeof leaf !== 'object' || leaf === null) return []
			const { text, isBold, isItalic, isUnderlined, link } = leaf as Record<string, unknown>
			if (typeof text !== 'string') return []
			return [{
				text,
				...(isBold === true ? { isBold: true } : {}),
				...(isItalic === true ? { isItalic: true } : {}),
				...(isUnderlined === true ? { isUnderlined: true } : {}),
				...(typeof link === 'string' && link !== '' ? { link } : {}),
			}]
		})]
	})
	return lines.length > 0 ? lines : null
}

/** Plain-text projection of a cell — what sorting compares and what the editor mirrors into `text`. */
export const tableCellPlainText = (cell: TableBlockCell | undefined): string =>
	cell?.content ? cell.content.map(line => line.map(leaf => leaf.text).join('')).join('\n') : cell?.text ?? ''

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
		const kind = isColumnKind(col.kind) ? col.kind : null
		return [{
			id: typeof col.id === 'string' && col.id !== '' ? col.id : `c${index}`,
			header: typeof col.header === 'string' ? col.header : '',
			kind,
			align: isAlign(col.align) ? col.align : null,
			sortable: col.sortable === true && kind !== 'icon',
			unit: kind === 'number' && typeof col.unit === 'string' && col.unit.trim() !== '' ? col.unit.trim() : null,
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
			const { text, link, content, icon, badge } = cell as Record<string, unknown>
			cells[column.id] = {
				text: typeof text === 'string' ? text : null,
				link: typeof link === 'string' && link !== '' ? link : null,
				content: parseCellContent(content),
				icon: typeof icon === 'string' && icon !== '' ? icon : null,
				badge: isBadgeTone(badge) ? badge : null,
			}
		}
		return [{ id: typeof row.id === 'string' && row.id !== '' ? row.id : `r${index}`, cells }]
	})
	return { columns, rows }
}
