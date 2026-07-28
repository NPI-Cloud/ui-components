import { MapAddress, type MapAddressPhone } from '../components/MapAddress'

export interface MapAddressBlockProps {
	/** Organisation / branch name — the bold lead-in above the address. */
	name?: string | null
	street?: string | null
	city?: string | null
	zip?: string | null
	country?: string | null
	email?: string | null
	phone?: string | null
	/** Secondary line under the phone number, e.g. "sekretariát". */
	phoneNote?: string | null
	/** Pin position. Both are needed for a map — either one missing leaves the flat panel with a decorative pin. */
	latitude?: number | null
	longitude?: number | null
	/** Null = the component's street-level default. */
	zoom?: number | null
	/**
	 * False in the editor canvas: the map renders as a picture, so a click selects the block instead
	 * of booting (and billing) a live Google map.
	 */
	interactive?: boolean
}

// Placeholder address, shown while the editor has not filled the block in yet — a blank card would
// read as a broken block on the canvas.
const PLACEHOLDER_STREET = 'Senovážné náměstí 872/25'
const PLACEHOLDER_CITY = 'Praha 1'

/** Maps the sparse `WebsiteBlock` columns onto `MapAddress`. Every input is nullable — the form enforces nothing. */
export function MapAddressBlock({ name, street, city, zip, country, email, phone, phoneNote, latitude, longitude, zoom, interactive }: MapAddressBlockProps) {
	// A pin needs both halves; one alone would silently place the map in the Gulf of Guinea.
	const center = typeof latitude === 'number' && typeof longitude === 'number' ? { lat: latitude, lng: longitude } : null

	const phoneProp: MapAddressPhone | undefined = phone ? { number: phone, ...(phoneNote ? { note: phoneNote } : {}) } : undefined

	return (
		<MapAddress
			name={name || undefined}
			address={{
				street: street || PLACEHOLDER_STREET,
				city: city || PLACEHOLDER_CITY,
				...(zip ? { zip } : {}),
				...(country ? { country } : {}),
			}}
			email={email || undefined}
			phone={phoneProp}
			center={center}
			zoom={zoom}
			interactive={interactive}
		/>
	)
}
