// The NPI map look — Snazzy Maps "Ultra Light with Labels" (https://snazzymaps.com/style/151).
// A near-white basemap with legible labels and no POI icons, so the npi-blue pin and the address
// card stay the only things that carry colour.
//
// The style itself is applied server-side by the worker's static-map proxy (`packages/worker/src/
// routes/website/static-map-route.ts`), which bakes it into the upstream Static Maps request. Only
// the land colour is needed in the browser, as the fallback background.

/**
 * The style's landscape colour. Used as `StaticMap`'s flat fallback background so a failed tile load
 * (proxy down, quota exhausted) degrades to something that still reads as this map, not as a hole.
 */
export const NPI_MAP_LAND_COLOR = '#f5f5f5'
