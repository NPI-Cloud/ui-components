'use client'

import { clsx } from 'clsx'
import { useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { NPI_MAP_LAND_COLOR } from '../utils/map-style'
import { buildTileSrc, computeMosaic, type LatLng, pinPercent, snapMapSize } from '../utils/static-map'
import { MAP_PIN_DATA_URI, MAP_PIN_HEIGHT, MAP_PIN_WIDTH } from './MapPin'
import { useMapsConfig } from './map-config'

export type StaticMapMarker = { id: string; lat: number; lng: number; iconUrl?: string | null }

export interface StaticMapProps {
	center: LatLng
	/** Zoom the tiles are rendered at and the markers are projected at — the two must agree or the pins sit off their addresses. */
	zoom: number
	markers: readonly StaticMapMarker[]
	className?: string
}

/**
 * A map as a picture: a mosaic of cached Static Maps tiles with DOM markers on top.
 *
 * It carries no Maps JS and never becomes pannable — a visitor who wants to explore is sent to
 * Google Maps in a new tab instead. That keeps the Dynamic Maps SKU off the bill entirely and
 * ~500 kB of Maps JS out of the page.
 */
export function StaticMap({ center, zoom, markers, className }: StaticMapProps) {
	const { staticMapEndpoint } = useMapsConfig()
	const ref = useRef<HTMLDivElement | null>(null)
	const [size, setSize] = useState<{ width: number; height: number } | null>(null)
	const [failed, setFailed] = useState(false)

	// useLayoutEffect, not useEffect: measure before paint so the tiles are requested in the same
	// frame the box appears, otherwise the map flashes empty on first render.
	useLayoutEffect(() => {
		const element = ref.current
		if (!element) return

		const measure = (): void => {
			// Layout size, not getBoundingClientRect: the box can sit inside a CSS `zoom`ed (or
			// transform-scaled) ancestor — the web-builder canvas shrinks itself that way — where the
			// rect reports the smaller on-screen size. Tiles are laid out in layout px inside the box,
			// so measuring the rect there covers only the zoom-fraction and leaves bare strips.
			const width = element.offsetWidth
			const height = element.offsetHeight
			if (!width || !height) return
			setSize(previous => (previous && previous.width === width && previous.height === height ? previous : { width, height }))
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
		? computeMosaic(snapMapSize(size.width), snapMapSize(size.height), center, zoom).map(tile => ({
			...tile,
			src: buildTileSrc({ endpoint: staticMapEndpoint, center: tile.center, zoom: tile.zoom, width: tile.reqWidth, height: tile.reqHeight }),
		}))
		: []

	return (
		<div
			ref={ref}
			className={twMerge(clsx('absolute inset-0 size-full overflow-hidden', className))}
			style={{ background: NPI_MAP_LAND_COLOR }}
		>
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
			    restore exactly one over the whole mosaic, styled like Google's own credit. */}
			{tiles.length > 0 && (
				<span className="pointer-events-none absolute bottom-0 right-0 whitespace-nowrap bg-white/70 px-1 py-px font-npi-sans text-[10px] leading-[1.2] text-npi-gray-700">
					Map data ©Google
				</span>
			)}

			{size
				&& markers.map(marker => {
					const position = pinPercent({ lat: marker.lat, lng: marker.lng }, center, zoom, size.width, size.height)
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
		</div>
	)
}
