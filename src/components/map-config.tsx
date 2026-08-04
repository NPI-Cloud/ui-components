'use client'

import { createContext, type ReactNode, useContext, useMemo } from 'react'

// Host-supplied Google Maps configuration for the (otherwise framework-agnostic) design system.
//
// The library cannot read `process.env` / `import.meta.env` — it is consumed by a Next app, a Vite
// SPA and the showcase, each of which names its variables differently. So the host injects what a
// map needs, mirroring how `UIPrimitivesProvider` injects Link/Image.
//
// It is optional and the map degrades cleanly without it: no `staticMapEndpoint` and `StaticMap`
// draws its flat fallback background.

export type MapsConfig = {
	/**
	 * URL of the static-map proxy that fronts the Maps Static API (`/api/static-map` on the worker).
	 * Absolute when the page is not served from the worker's origin. The proxy hides the server key,
	 * clamps the parameters and edge-caches the tiles.
	 */
	staticMapEndpoint?: string
}

const MapsConfigContext = createContext<MapsConfig>({})

export function MapsConfigProvider({ staticMapEndpoint, children }: MapsConfig & { children: ReactNode }) {
	const value = useMemo<MapsConfig>(() => ({ staticMapEndpoint }), [staticMapEndpoint])
	return <MapsConfigContext.Provider value={value}>{children}</MapsConfigContext.Provider>
}

export const useMapsConfig = (): MapsConfig => useContext(MapsConfigContext)
