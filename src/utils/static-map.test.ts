import { describe, expect, test } from 'bun:test'
import { buildTileSrc, computeMosaic, isValidLatLng, MAX_STATIC_SIZE, pinPercent, snapMapSize, STATIC_MAP_RENDER_VERSION } from './static-map'

const PRAGUE = { lat: 50.08657, lng: 14.43011 }

describe('computeMosaic', () => {
	test('covers a box that fits in one tile with a single tile', () => {
		const tiles = computeMosaic(400, 300, PRAGUE, 15)
		expect(tiles.length).toBe(1)
		expect(tiles[0]!.boxWidth).toBe(400)
		expect(tiles[0]!.boxHeight).toBe(300)
	})

	test('never requests more than the Static Maps 640 px cap, in either dimension', () => {
		for (const [w, h] of [[400, 300], [1400, 800], [3000, 2000]] as const) {
			for (const tile of computeMosaic(w, h, PRAGUE, 15)) {
				expect(tile.reqWidth).toBeLessThanOrEqual(MAX_STATIC_SIZE)
				// The requested height carries the attribution crop on top of the visible box.
				expect(tile.reqHeight).toBeLessThanOrEqual(MAX_STATIC_SIZE)
			}
		}
	})

	test('requests each tile taller than its visible box so the baked Google credit can be clipped', () => {
		for (const tile of computeMosaic(1400, 800, PRAGUE, 15)) {
			expect(tile.reqWidth).toBe(tile.boxWidth)
			expect(tile.reqHeight).toBeGreaterThan(tile.boxHeight)
		}
	})

	test('tiles a wide container into a grid that covers it fully', () => {
		const width = 1400
		const height = 800
		const tiles = computeMosaic(width, height, PRAGUE, 15)
		expect(tiles.length).toBeGreaterThan(1)

		// The union of the boxes must reach past both far edges, or the container shows bare background.
		const right = Math.max(...tiles.map(t => t.leftPx + t.boxWidth))
		const bottom = Math.max(...tiles.map(t => t.topPx + t.boxHeight))
		const left = Math.min(...tiles.map(t => t.leftPx))
		const top = Math.min(...tiles.map(t => t.topPx))
		expect(left).toBeLessThanOrEqual(0)
		expect(top).toBeLessThanOrEqual(0)
		expect(right).toBeGreaterThanOrEqual(width)
		expect(bottom).toBeGreaterThanOrEqual(height)
	})

	test('lays tiles out edge to edge, with no gaps or overlaps between columns', () => {
		const tiles = computeMosaic(1400, 400, PRAGUE, 15)
		const columns = [...new Set(tiles.map(t => t.leftPx))].sort((a, b) => a - b)
		for (let i = 1; i < columns.length; i++) {
			const previous = tiles.find(t => t.leftPx === columns[i - 1])!
			expect(columns[i]).toBe(previous.leftPx + previous.boxWidth)
		}
	})

	test('places every tile centre inside the world, west to east across the grid', () => {
		const tiles = computeMosaic(1400, 800, PRAGUE, 15)
		const topRow = tiles.filter(t => t.topPx === Math.min(...tiles.map(x => x.topPx)))
		const byLeft = [...topRow].sort((a, b) => a.leftPx - b.leftPx)
		for (let i = 1; i < byLeft.length; i++) {
			expect(byLeft[i]!.center.lng).toBeGreaterThan(byLeft[i - 1]!.center.lng)
		}
	})
})

describe('pinPercent', () => {
	test('puts a pin at the map centre in the middle of the pane', () => {
		expect(pinPercent(PRAGUE, PRAGUE, 15, 696, 400)).toEqual({ left: 50, top: 50 })
	})

	test('moves east/right and north/up as expected', () => {
		const east = pinPercent({ lat: PRAGUE.lat, lng: PRAGUE.lng + 0.01 }, PRAGUE, 15, 696, 400)
		expect(east.left).toBeGreaterThan(50)
		expect(east.top).toBe(50)

		const north = pinPercent({ lat: PRAGUE.lat + 0.01, lng: PRAGUE.lng }, PRAGUE, 15, 696, 400)
		// Screen coordinates grow downward, so further north is a SMALLER top.
		expect(north.top).toBeLessThan(50)
		expect(north.left).toBe(50)
	})

	test('doubles the offset when the zoom goes up one level', () => {
		const offset = (zoom: number) => pinPercent({ lat: PRAGUE.lat, lng: PRAGUE.lng + 0.01 }, PRAGUE, zoom, 696, 400).left - 50
		// Precision 2: pinPercent rounds its output to 3 decimals, and doubling amplifies that rounding.
		expect(offset(16)).toBeCloseTo(offset(15) * 2, 2)
	})
})

describe('buildTileSrc', () => {
	test('emits canonical, cache-friendly parameters in a fixed order', () => {
		const src = buildTileSrc({ endpoint: '/api/static-map', center: PRAGUE, zoom: 15, width: 640, height: 424 })
		expect(src).toBe(`/api/static-map?c=50.08657%2C14.43011&z=15&w=640&h=424&r=${STATIC_MAP_RENDER_VERSION}`)
	})

	test('rounds coordinates to ~1 m so a float tail cannot mint a new cache entry', () => {
		const src = buildTileSrc({ endpoint: '/x', center: { lat: 50.086570001, lng: 14.430109999 }, zoom: 15, width: 10, height: 10 })
		expect(src).toContain('c=50.08657%2C14.43011')
	})

	test('supports a cross-origin endpoint (the proxy lives on the worker)', () => {
		const src = buildTileSrc({ endpoint: 'https://worker.test/api/static-map', center: PRAGUE, zoom: 15, width: 10, height: 10 })
		expect(src.startsWith('https://worker.test/api/static-map?')).toBe(true)
	})
})

describe('snapMapSize', () => {
	test('snaps to a 16 px grid so resizing cannot storm the cache', () => {
		expect(snapMapSize(0)).toBe(0)
		expect(snapMapSize(7)).toBe(0)
		expect(snapMapSize(9)).toBe(16)
		expect(snapMapSize(695)).toBe(688)
		expect(snapMapSize(700)).toBe(704)
	})
})

describe('isValidLatLng', () => {
	test.each([
		[0, 0, true],
		[50.08, 14.43, true],
		[-90, -180, true],
		[90, 180, true],
		[91, 0, false],
		[0, 181, false],
		[Number.NaN, 0, false],
		[Number.POSITIVE_INFINITY, 0, false],
	])('(%p, %p) → %p', (lat, lng, expected) => {
		expect(isValidLatLng(lat, lng)).toBe(expected)
	})
})
