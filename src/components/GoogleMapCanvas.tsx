'use client'

import { importLibrary, setOptions } from '@googlemaps/js-api-loader'
import { useEffect, useRef } from 'react'
import { NPI_MAP_STYLE } from '../utils/map-style'
import type { LatLng } from '../utils/static-map'
import type { FacadeMarker } from './MapFacade'
import { MAP_PIN_DATA_URI, MAP_PIN_HEIGHT, MAP_PIN_WIDTH } from './MapPin'

export interface GoogleMapCanvasProps {
	center: LatLng
	/** Must equal the facade's `liveZoom`, or the pins visibly jump the moment this mounts. */
	zoom: number
	markers: readonly FacadeMarker[]
	/** Browser key for the Maps JavaScript API — see `MapsConfigProvider`. */
	apiKey: string
	className?: string
}

/** Identity of the rendered map, as a primitive. Keeps the effect off object identity, which changes on every render of the editor form. */
const mapIdentity = (center: LatLng, zoom: number, markers: readonly FacadeMarker[]): string =>
	`${center.lat},${center.lng}@${zoom}|${markers.map(m => `${m.id}:${m.lat}:${m.lng}:${m.iconUrl ?? ''}`).join(';')}`

/**
 * The real Google map, mounted only after the visitor activates the facade. Loading it is what bills
 * the Dynamic Maps SKU, so nothing here may run on a plain pageview — the module is `React.lazy`-d by
 * `MapAddress` so even its code (and the Maps loader) downloads on demand.
 *
 * Markers are `google.maps.Marker` rather than `AdvancedMarkerElement` on purpose: advanced markers
 * require the map to carry a cloud `mapId`, and setting a `mapId` makes Google IGNORE the inline
 * `styles` array — which is where our Ultra-Light design lives (`utils/map-style.ts`). Cloud styling
 * would move the design out of the repo into console configuration that has to be repeated per
 * environment and could silently drift from the static tiles. `Marker` is deprecated but explicitly
 * not scheduled for removal (Google commits to 12 months' notice), so the trade is worth it.
 */
export default function GoogleMapCanvas({ center, zoom, markers, apiKey, className }: GoogleMapCanvasProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	// The boot below is async, so it must read the props of the render that COMPLETED, not the ones
	// captured when it started. Declared before the boot effect so it has always run first.
	const latest = useRef({ center, zoom, markers })
	useEffect(() => {
		latest.current = { center, zoom, markers }
	})

	const identity = mapIdentity(center, zoom, markers)

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		let cancelled = false
		// Set once the markers exist. Deliberately a closure rather than an array of
		// `google.maps.Marker`: this file is also compiled by consumer projects that do not pull in the
		// ambient Google namespace, and naming the type there would break their build.
		let disposeMarkers = (): void => {}

		// Safe to call repeatedly — it only configures the bootstrap; the first `importLibrary` is what
		// actually fetches the API, and subsequent calls reuse the same load.
		setOptions({ key: apiKey, v: 'weekly' })

		void Promise.all([importLibrary('maps'), importLibrary('marker'), importLibrary('core')])
			.then(([{ Map }, { Marker }, { Point, Size }]) => {
				if (cancelled) return
				const current = latest.current
				const map = new Map(container, {
					center: current.center,
					zoom: current.zoom,
					styles: [...NPI_MAP_STYLE],
					// A contact map is for orientation, not exploration: keep zoom only, drop the map-type
					// switch, Street View peg and fullscreen. POI icons are already off via the style, so
					// there is nothing clickable to accidentally hijack the click.
					disableDefaultUI: true,
					zoomControl: true,
					clickableIcons: false,
				})
				const placed = current.markers.map(marker =>
					new Marker({
						map,
						position: { lat: marker.lat, lng: marker.lng },
						icon: {
							url: marker.iconUrl || MAP_PIN_DATA_URI,
							scaledSize: new Size(MAP_PIN_WIDTH, MAP_PIN_HEIGHT),
							// Bottom-center — the same anchor the facade applies via translate(-50%, -100%).
							anchor: new Point(MAP_PIN_WIDTH / 2, MAP_PIN_HEIGHT),
						},
					}))
				disposeMarkers = () => {
					for (const marker of placed) marker.setMap(null)
				}
			})
			.catch(() => {
				// Network failure, blocked script, bad key, exhausted quota — the facade is still mounted
				// underneath and stays visible, so the visitor keeps a usable map picture either way.
			})

		return () => {
			cancelled = true
			disposeMarkers()
			// Google offers no map destructor; dropping its DOM is what releases the instance. React
			// would only do this when the whole canvas unmounts, not when `identity` changes.
			container.replaceChildren()
		}
	}, [apiKey, identity])

	return <div ref={containerRef} className={className} />
}
