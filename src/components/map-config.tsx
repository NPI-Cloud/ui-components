'use client'

import { createContext, type ReactNode, useContext, useMemo } from 'react'

// Host-supplied Google Maps configuration for the (otherwise framework-agnostic) design system.
//
// The library cannot read `process.env` / `import.meta.env` — it is consumed by a Next app, a Vite
// SPA and the showcase, each of which names its variables differently. So the host injects the two
// values a map needs, mirroring how `UIPrimitivesProvider` injects Link/Image.
//
// Both are optional and the map degrades cleanly without them: no `staticMapEndpoint` and the facade
// draws its flat fallback background, no `apiKey` and the facade never activates into a live map.

export type MapsConfig = {
	/**
	 * URL of the static-map proxy that fronts the Maps Static API (`/api/static-map` on the worker).
	 * Absolute when the page is not served from the worker's origin. The proxy hides the server key,
	 * clamps the parameters and edge-caches the tiles.
	 */
	staticMapEndpoint?: string
	/**
	 * Browser key for the Maps JavaScript API, loaded only once a visitor activates the facade.
	 * Public by nature — restrict it by HTTP referrer in the Google Cloud console. Never put the
	 * server key (Static Maps / Geocoding) here; it would ship in the bundle.
	 */
	apiKey?: string
}

const MapsConfigContext = createContext<MapsConfig>({})

export function MapsConfigProvider({ staticMapEndpoint, apiKey, children }: MapsConfig & { children: ReactNode }) {
	const value = useMemo<MapsConfig>(() => ({ staticMapEndpoint, apiKey }), [staticMapEndpoint, apiKey])
	return <MapsConfigContext.Provider value={value}>{children}</MapsConfigContext.Provider>
}

export const useMapsConfig = (): MapsConfig => useContext(MapsConfigContext)
