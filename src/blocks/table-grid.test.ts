import { expect, test } from 'bun:test'
import { expandTableGrid, tableSpan, type TableCellSpan } from './table-grid'
type Cell = TableCellSpan & { type: 'tableCell'; children: { text: string }[] }
const cell = (text = '', spans: TableCellSpan = {}): Cell => ({ type: 'tableCell', children: [{ text }], ...spans })

test('expands rowspan and colspan with a stable rectangular roundtrip', () => {
	const rows = [
		[cell('A', { rowSpan: 2 }), cell('B', { colSpan: 2 })],
		[cell('C'), cell('D')],
	]
	const grid = expandTableGrid(rows, cell)
	expect(grid.map((row) => row.length)).toEqual([3, 3])
	expect(grid[0]?.[2]?.covered).toBe(true)
	expect(grid[1]?.[0]?.covered).toBe(true)
	expect(expandTableGrid(grid, cell)).toEqual(grid)
})
test('bounds malformed spans and clips rowspan to available rows', () => {
	for (const value of ['-2', 'Infinity', '1e6', '4px', 0, NaN, Infinity, 1.5]) expect(tableSpan(value)).toBe(1)
	expect(tableSpan('999999')).toBe(32)
	const grid = expandTableGrid([[cell('A', { rowSpan: 99999, colSpan: 99999 })]], cell)
	expect(grid[0]).toHaveLength(32)
	expect(grid[0]?.[0]?.rowSpan).toBeUndefined()
})
test('does not discard malformed covered cells carrying text', () => {
	const grid = expandTableGrid([[cell('A', { colSpan: 2 }), cell('Zachovat', { covered: true })]], cell)
	expect(grid[0]).toHaveLength(3)
	expect(grid[0]?.[2]?.children[0]?.text).toBe('Zachovat')
	expect(grid[0]?.[2]?.covered).toBeUndefined()
})
