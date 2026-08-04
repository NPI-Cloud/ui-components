// Environment-agnostic helpers for the Google Static Maps picture rendered by `StaticMap`.
//
// The picture has two layers:
//   1. A MARKERLESS base rendered at the requested zoom for full detail. A single Static Maps image
//      caps at 640 logical px per side, so a container wider/taller than that is covered by a MOSAIC
//      of tiles laid out in the DOM (`computeMosaic`). Each tile is shown at its native size, so it
//      is crisp on both standard and retina screens.
//   2. Per-marker icons as DOM elements, positioned by web-mercator math (`pinPercent`) at the same
//      zoom, so they do not scale with the base image.
//
// Keep this module DOM-free and Node-free: it is imported by the browser (build tile srcs, place
// pins) and mirrored by the worker proxy that talks to maps.googleapis.com.

// Part of both the browser cache key and the edge cache key (sent as `?r=`), so bumping it busts
// both. Bump on ANY change to how tiles render — tile size math, zoom handling, or the map style in
// `map-style.ts` (which the worker bakes into the upstream request).
export const STATIC_MAP_RENDER_VERSION = '1'

/** Static Maps API hard cap: 640 logical px per side (`scale=2` doubles the device px, not the extent). */
export const MAX_STATIC_SIZE = 640

/** Google world tile size in px at zoom 0. */
const TILE_SIZE = 256

export type LatLng = { lat: number; lng: number }

export function isValidLatLng(lat: number, lng: number): boolean {
	return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}

// ~1 m of precision. Rounding keeps the tile URL canonical so every visitor of the same block hits
// the same cache entry instead of minting one per float tail.
const round5 = (n: number): number => Math.round(n * 1e5) / 1e5

// --- Web-mercator projection (forward + inverse) ---------------------------------------------

const lngToWorldX = (lng: number, worldPx: number): number => ((lng + 180) / 360) * worldPx

const latToWorldY = (lat: number, worldPx: number): number => {
	const s = Math.sin((lat * Math.PI) / 180)
	return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * worldPx
}

const worldXToLng = (x: number, worldPx: number): number => (x / worldPx) * 360 - 180

const worldYToLat = (y: number, worldPx: number): number => (Math.asin(Math.tanh(2 * Math.PI * (0.5 - y / worldPx))) * 180) / Math.PI

// --- Tile mosaic -----------------------------------------------------------------------------

export type MosaicTile = {
	center: LatLng
	zoom: number
	/** Logical px requested from Static Maps (= boxWidth). */
	reqWidth: number
	/** Logical px requested (= boxHeight + the attribution crop). */
	reqHeight: number
	/** Visible, clipped box size in CSS px. */
	boxWidth: number
	boxHeight: number
	/** CSS offset of the box inside the container. */
	leftPx: number
	topPx: number
}

// Every Static Maps image bakes a "Google" logo + "Map data ©" credit into its bottom rows. In a
// multi-tile mosaic those land mid-map at the seams, so each tile is requested this many logical px
// TALLER and that bottom strip is clipped off — removing the baked credit without losing any of the
// intended map area. A single credit is restored over the whole mosaic instead (Google's terms
// require the attribution to stay visible — see `StaticMap`).
const ATTRIBUTION_CROP = 24

/**
 * Lay out the smallest grid of tiles (each ≤ 640 logical px) that covers the container at `zoom`,
 * centered on `center`. 1 CSS px == 1 world px at the requested zoom, so each tile's CSS box size
 * equals its requested logical size and the mosaic reproduces the intended extent and detail exactly.
 * The grid is centered on `center` and may overspill the container by up to one tile fraction,
 * which the container clips.
 */
export function computeMosaic(cssWidth: number, cssHeight: number, center: LatLng, zoom: number): MosaicTile[] {
	const w = Math.max(1, cssWidth)
	const h = Math.max(1, cssHeight)
	const worldPx = TILE_SIZE * 2 ** zoom
	const cx = lngToWorldX(center.lng, worldPx)
	const cy = latToWorldY(center.lat, worldPx)

	const cols = Math.max(1, Math.ceil(w / MAX_STATIC_SIZE))
	// Leave room for the crop so the REQUESTED height stays within the 640 cap.
	const rows = Math.max(1, Math.ceil(h / (MAX_STATIC_SIZE - ATTRIBUTION_CROP)))
	const tileW = Math.min(MAX_STATIC_SIZE, Math.ceil(w / cols))
	const tileH = Math.min(MAX_STATIC_SIZE - ATTRIBUTION_CROP, Math.ceil(h / rows))
	const mosaicW = cols * tileW
	const mosaicH = rows * tileH
	const originX = cx - mosaicW / 2
	const originY = cy - mosaicH / 2

	const tiles: MosaicTile[] = []
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const displayCenterX = originX + col * tileW + tileW / 2
			const displayCenterY = originY + row * tileH + tileH / 2
			// Shift the requested center south by half the crop so the kept (top) strip stays centered
			// on the intended tile area once the bottom is clipped.
			const requestCenterY = displayCenterY + ATTRIBUTION_CROP / 2
			tiles.push({
				center: { lat: worldYToLat(requestCenterY, worldPx), lng: worldXToLng(displayCenterX, worldPx) },
				zoom,
				reqWidth: tileW,
				reqHeight: tileH + ATTRIBUTION_CROP,
				boxWidth: tileW,
				boxHeight: tileH,
				leftPx: Math.round(col * tileW - (mosaicW - w) / 2),
				topPx: Math.round(row * tileH - (mosaicH - h) / 2),
			})
		}
	}
	return tiles
}

/**
 * Snap a measured container size to a 16 px grid before laying out tiles. Feeding the raw pixel
 * width into tile URLs would mint one cache entry per pixel and fire a request storm while resizing.
 * Pins still use the exact measured size; the ≤ 16 px drift is absorbed by the container's clip.
 */
export const snapMapSize = (n: number): number => Math.round(n / 16) * 16

// --- Proxy URL ---------------------------------------------------------------------------------

/**
 * Build the proxy URL for one (markerless) tile. Fixed param order (c, z, w, h, r) keeps the URL
 * canonical and therefore cache-friendly. `endpoint` is host-supplied (see `MapsConfigProvider`)
 * because the proxy lives on the worker, which is a different origin than the public site.
 */
export function buildTileSrc(params: { endpoint: string; center: LatLng; zoom: number; width: number; height: number }): string {
	const { endpoint, center, zoom, width, height } = params
	const query = new URLSearchParams()
	query.set('c', `${round5(center.lat)},${round5(center.lng)}`)
	query.set('z', String(zoom))
	query.set('w', String(width))
	query.set('h', String(height))
	query.set('r', STATIC_MAP_RENDER_VERSION)
	return `${endpoint}?${query.toString()}`
}

// --- Marker projection -------------------------------------------------------------------------

/**
 * Position of a marker inside the panel, as CSS percentages, matching where Maps-JS draws it for a
 * map at `zoom` centered on `center` in a `paneW`×`paneH` (px) panel. The anchor is bottom-center,
 * so the pin element needs `transform: translate(-50%, -100%)`.
 */
export function pinPercent(pin: LatLng, center: LatLng, zoom: number, paneW: number, paneH: number): { left: number; top: number } {
	const worldPx = TILE_SIZE * 2 ** zoom
	const dx = lngToWorldX(pin.lng, worldPx) - lngToWorldX(center.lng, worldPx)
	const dy = latToWorldY(pin.lat, worldPx) - latToWorldY(center.lat, worldPx)
	return {
		left: Math.round((50 + (dx / paneW) * 100) * 1000) / 1000,
		top: Math.round((50 + (dy / paneH) * 100) * 1000) / 1000,
	}
}
