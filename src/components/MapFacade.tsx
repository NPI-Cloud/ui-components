'use client'

import { clsx } from 'clsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { NPI_MAP_LAND_COLOR } from '../utils/map-style'
import { buildTileSrc, computeMosaic, type LatLng, pinPercent, snapMapSize } from '../utils/static-map'
import { MAP_PIN_DATA_URI, MAP_PIN_HEIGHT, MAP_PIN_WIDTH } from './MapPin'
import { useMapsConfig } from './map-config'

export type FacadeMarker = { id: string; lat: number; lng: number; iconUrl?: string | null }

export interface MapFacadeProps {
	center: LatLng
	/**
	 * Zoom of the live map this facade stands in for. The base is rendered at this zoom (full detail)
	 * and markers are projected at it, so activating the live map changes nothing on screen. A
	 * mismatch here is the single most visible porting bug — the pins jump on click.
	 */
	liveZoom: number
	markers: readonly FacadeMarker[]
	/** True once the live map is mounted on top: the facade stays rendered underneath but stops taking clicks. */
	active: boolean
	/** Called on click / Enter. Omit to render a non-interactive picture (editor canvas, no API key). */
	onActivate?: () => void
	/** Accessible name of the activation button. */
	label: string
	className?: string
}

/**
 * The static stand-in for a live Google map: a mosaic of cached Static Maps tiles with DOM markers
 * on top, rendered as a `<button>` so keyboard and screen-reader activation come for free.
 *
 * It exists to keep the Dynamic Maps SKU off the bill for the overwhelming majority of visitors who
 * never touch the map, and to keep ~500 kB of Maps JS out of the critical path. See
 * `docs/map-facade-inspiration.md` for the full cost model.
 */
export function MapFacade({ center, liveZoom, markers, active, onActivate, label, className }: MapFacadeProps) {
	const { staticMapEndpoint } = useMapsConfig()
	const ref = useRef<HTMLElement | null>(null)
	const [size, setSize] = useState<{ width: number; height: number } | null>(null)
	const [failed, setFailed] = useState(false)

	// useLayoutEffect, not useEffect: measure before paint so the tiles are requested in the same
	// frame the box appears, otherwise the facade flashes empty on first render.
	useLayoutEffect(() => {
		const element = ref.current
		if (!element) return

		const measure = (): void => {
			const rect = element.getBoundingClientRect()
			if (!rect.width || !rect.height) return
			setSize(previous => {
				const width = Math.round(rect.width)
				const height = Math.round(rect.height)
				return previous && previous.width === width && previous.height === height ? previous : { width, height }
			})
		}

		measure()
		const observer = new ResizeObserver(measure)
		observer.observe(element)
		return () => observer.disconnect()
	}, [])

	// Tiles are laid out on the SNAPPED size (bounded number of cache entries); pins use the exact
	// measured size. The ≤ 16 px difference is absorbed by the container's clip. The src is built
	// here, inside the guard, so there is no "what if there's no endpoint" branch further down.
	const tiles = size && staticMapEndpoint && !failed
		? computeMosaic(snapMapSize(size.width), snapMapSize(size.height), center, liveZoom).map(tile => ({
			...tile,
			src: buildTileSrc({ endpoint: staticMapEndpoint, center: tile.center, zoom: tile.zoom, width: tile.reqWidth, height: tile.reqHeight }),
		}))
		: []

	const content = (
		<>
			{tiles.map(tile => (
				<span
					key={`${tile.leftPx}:${tile.topPx}`}
					// Clip box — shows only the top part of the taller tile image, cropping the baked
					// Google credit off its bottom edge (see ATTRIBUTION_CROP in static-map.ts).
					className="absolute block overflow-hidden"
					style={{ left: `${tile.leftPx}px`, top: `${tile.topPx}px`, width: `${tile.boxWidth}px`, height: `${tile.boxHeight}px` }}
				>
					{/* Deliberately a plain <img>, not the `Image` primitive: these are already-optimized
					    PNGs that must render at exactly their requested pixel size, and the proxy origin
					    is not in the host's image-optimizer allow-list. */}
					<img
						src={tile.src}
						alt=""
						className="absolute left-0 top-0 block max-w-none"
						style={{ width: `${tile.reqWidth}px`, height: `${tile.reqHeight}px` }}
						onError={() => setFailed(true)}
					/>
				</span>
			))}

			{/* Google's terms require the attribution to stay visible. It is clipped off every tile, so
			    restore exactly one over the whole mosaic, styled like the live map's own credit. */}
			{tiles.length > 0 && (
				<span className="pointer-events-none absolute bottom-0 right-0 whitespace-nowrap bg-white/70 px-1 py-px font-npi-sans text-[10px] leading-[1.2] text-npi-gray-700">
					Map data ©Google
				</span>
			)}

			{size
				&& markers.map(marker => {
					const position = pinPercent({ lat: marker.lat, lng: marker.lng }, center, liveZoom, size.width, size.height)
					return (
						<img
							key={marker.id}
							src={marker.iconUrl || MAP_PIN_DATA_URI}
							alt=""
							width={MAP_PIN_WIDTH}
							height={MAP_PIN_HEIGHT}
							// Anchored bottom-center, matching Google's default anchor for custom icons.
							className="pointer-events-none absolute max-w-none -translate-x-1/2 -translate-y-full"
							style={{ left: `${position.left}%`, top: `${position.top}%` }}
						/>
					)
				})}
		</>
	)

	const boxClass = twMerge(clsx('absolute inset-0 size-full overflow-hidden border-none p-0', active && 'pointer-events-none', className))

	// Without `onActivate` there is nothing to activate, so render a plain box rather than a button
	// that announces itself as interactive to assistive tech and then does nothing.
	if (!onActivate) {
		return (
			<div ref={ref as React.Ref<HTMLDivElement>} className={boxClass} style={{ background: NPI_MAP_LAND_COLOR }}>
				{content}
			</div>
		)
	}

	return (
		<button
			ref={ref as React.Ref<HTMLButtonElement>}
			type="button"
			onClick={onActivate}
			disabled={active}
			aria-label={label}
			className={twMerge(boxClass, 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-npi-blue')}
			style={{ background: NPI_MAP_LAND_COLOR }}
		>
			{content}
		</button>
	)
}
