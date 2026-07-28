// The NPI map pin — npi-blue teardrop with a hollow white circle in the bulb (Figma 7295:3234 "Pin").
//
// Three surfaces have to draw the SAME pin or the swap from the static facade to the live Google map
// visibly jumps: the decorative pin on a map-less `MapAddress`, the facade's projected marker, and
// the live map's `google.maps.Marker` icon. The React component covers the first; the baked data URI
// covers the other two (both need a plain image URL, not a component).

/** Teardrop body. Copied verbatim from Figma; the flip transform below hangs the point downwards. */
const PIN_PATH_D =
	'M25.8012 14.264C23.0442 10.189 14.7536 0 14.7536 0C14.7536 0 6.46299 10.189 3.70609 14.264C-1.72364 22.2896 -0.988334 30.1982 4.61257 35.7992C7.41305 38.5999 11.0833 40 14.7536 40C18.4239 40 22.0942 38.5999 24.8946 35.7992C30.4956 30.1982 31.2309 22.2896 25.8012 14.264Z'

/** Intrinsic pin size in CSS px. The anchor is bottom-center — the tip sits on the projected point. */
export const MAP_PIN_WIDTH = 30
export const MAP_PIN_HEIGHT = 40

// `--npi-blue`, resolved at author time: an image URL cannot inherit `currentColor`.
const NPI_BLUE = '#3566FC'

const pinSvg = (fill: string): string =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="${MAP_PIN_WIDTH}" height="${MAP_PIN_HEIGHT}" viewBox="0 0 29.5072 40" fill="none">`
	+ `<path transform="matrix(1 0 0 -1 0 40)" d="${PIN_PATH_D}" fill="${fill}"/>`
	+ `<circle cx="14.7536" cy="14.7531" r="8.6305" fill="white"/>`
	+ `</svg>`

/** The pin as an inline SVG data URI, for surfaces that take an image URL (facade markers, Maps-JS marker icons). */
export const MAP_PIN_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(pinSvg(NPI_BLUE))}`

/**
 * The pin as a React element. Colour follows `currentColor`, so a wrapper's text colour drives it —
 * used for the decorative centre pin on a `MapAddress` that has no coordinates yet.
 */
export function MapPin({ className }: { className?: string }): React.ReactElement {
	return (
		<svg aria-hidden width={MAP_PIN_WIDTH} height={MAP_PIN_HEIGHT} viewBox="0 0 29.5072 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
			<path transform="matrix(1 0 0 -1 0 40)" d={PIN_PATH_D} fill="currentColor" />
			<circle cx="14.7536" cy="14.7531" r="8.6305" fill="white" />
		</svg>
	)
}
