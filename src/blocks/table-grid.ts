export type TableCellSpan = { rowSpan?: number; colSpan?: number; covered?: boolean }

/** Bound imported spans before allocating cells. Invalid/zero values mean a single cell. */
export function tableSpan(value: unknown): number {
	const n = typeof value === 'number' ? value : typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value) : 1
	return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 32) : 1
}

/**
 * Rectangular storage keeps Slate's table normalizer from dropping content in short rows.
 * Covered slots contain empty text; HTML renders only anchor cells with their actual spans.
 * Accepts both compact HTML rows and the already-expanded stored representation.
 */
export function expandTableGrid<T extends TableCellSpan>(rows: T[][], empty: () => T): T[][] {
	const grid: T[][] = rows.map(() => [])
	for (let r = 0; r < rows.length; r++) {
		let c = 0
		for (const source of rows[r]!) {
			if (source.covered && !tableCellHasContent(source)) continue
			while (grid[r]![c]) c++
			const rowSpan = Math.min(tableSpan(source.rowSpan), rows.length - r)
			let colSpan = tableSpan(source.colSpan)
			// Do not overlap a rowspan from an earlier row. Keep every source cell's content.
			while (colSpan > 1 && Array.from({ length: colSpan }, (_, offset) => grid[r]![c + offset]).some(Boolean)) colSpan--
			const cell = { ...source }
			if (rowSpan > 1) cell.rowSpan = rowSpan
			else delete cell.rowSpan
			if (colSpan > 1) cell.colSpan = colSpan
			else delete cell.colSpan
			delete cell.covered
			grid[r]![c] = cell
			for (let y = r; y < r + rowSpan; y++) {
				for (let x = c; x < c + colSpan; x++) {
					if (y !== r || x !== c) grid[y]![x] = { ...empty(), covered: true }
				}
			}
			c += colSpan
		}
	}
	const width = Math.max(0, ...grid.map((row) => row.length))
	for (const row of grid) for (let c = 0; c < width; c++) row[c] ??= empty()
	return grid
}

/** A malformed covered slot with content must become a visible cell, never be discarded. */
export function tableCellHasContent(value: unknown): boolean {
	if (!value || typeof value !== 'object') return false
	const node = value as Record<string, unknown>
	if (typeof node.text === 'string') return node.text.length > 0
	if (node.referenceId || node.videoUrl || node.href || (typeof node.type === 'string' && node.type !== 'tableCell')) return true
	return Array.isArray(node.children) && node.children.some(tableCellHasContent)
}
