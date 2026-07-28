// The NPI map look — Snazzy Maps "Ultra Light with Labels" (https://snazzymaps.com/style/151).
// A near-white basemap with legible labels and no POI icons, so the npi-blue pin and the address
// card stay the only things that carry colour.
//
// ⚠️ This array is MIRRORED in the worker's static-map proxy (`packages/worker/src/routes/website/
// static-map-route.ts`), which translates it into the Static Maps API's `style=` parameters — the
// two Google APIs take the same design in two different encodings and neither can read the other's.
// The facade and the live map must look identical or the swap on click visibly flashes, so change
// BOTH files together and bump `STATIC_MAP_RENDER_VERSION` in `static-map.ts` to bust the caches.

/** One styler entry — the subset of Google's styler keys this design uses. */
export type MapStyler = {
	color?: string
	lightness?: number
	saturation?: number
	weight?: number
	visibility?: 'on' | 'off' | 'simplified'
}

/** Structurally compatible with `google.maps.MapTypeStyle`, declared locally so the design system carries no Google types. */
export type MapStyleRule = {
	featureType?: string
	elementType?: string
	stylers: MapStyler[]
}

export const NPI_MAP_STYLE: readonly MapStyleRule[] = [
	{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }, { lightness: 17 }] },
	{ featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] },
	{ featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }, { lightness: 17 }] },
	{ featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }] },
	{ featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 18 }] },
	{ featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 16 }] },
	{ featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 21 }] },
	{ featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dedede' }, { lightness: 21 }] },
	{ elementType: 'labels.text.stroke', stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }] },
	{ elementType: 'labels.text.fill', stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }] },
	{ elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
	{ featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f2f2f2' }, { lightness: 19 }] },
	{ featureType: 'administrative', elementType: 'geometry.fill', stylers: [{ color: '#fefefe' }, { lightness: 20 }] },
	{ featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }] },
]

/**
 * The style's landscape colour. Used as the facade's flat fallback background so a failed tile load
 * (proxy down, quota exhausted) degrades to something that still reads as this map, not as a hole.
 */
export const NPI_MAP_LAND_COLOR = '#f5f5f5'
