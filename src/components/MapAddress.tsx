'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import type { LatLng } from '../utils/static-map'
import { MapPin } from './MapPin'
import { StaticMap, type StaticMapMarker } from './StaticMap'
import { Image, Link } from './ui-primitives'

/** Zoom of the static map. Street level: the block answers "where is this address". */
const DEFAULT_ZOOM = 15

/**
 * Google Maps destination for the pin. The documented Maps URLs API (`search/?api=1&query=`) drops a
 * marker on the coordinates and lets Google pick the zoom — it takes no zoom parameter, so the
 * block's zoom stays a property of the picture only.
 */
const googleMapsUrl = ({ lat, lng }: LatLng): string => `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`

export interface MapAddressLocation {
	/** Street and house number, e.g. "Senovážné náměstí 25". */
	street: string
	/** City line — typically "ZIP City" (e.g. "110 00 Praha 1"). When `zip` is given they're combined automatically. */
	city: string
	/** Optional postal code, prepended to the city line when supplied. */
	zip?: string
	/** Optional country line shown below the city. */
	country?: string
}

export interface MapAddressPhone {
	/** Phone number text, e.g. "245 001 124". */
	number: string
	/** Optional secondary line below the number, e.g. "sekretariát". */
	note?: string
}

export interface MapAddressProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
	/** Organisation / branch name shown as the bold lead-in above the address (Figma 368:9468). */
	name?: string
	/** Address block — street, city, optional ZIP and country. */
	address: MapAddressLocation
	/** Email address — rendered as a `mailto:` link in `npi-blue`, prefixed with the envelope icon. */
	email?: string
	/** Phone number (string or `{ number, note }`) — rendered with the receiver icon, link-coloured number. */
	phone?: string | MapAddressPhone
	/**
	 * Coordinates of the pin. With them the map box shows cached Google tiles and links to Google Maps
	 * in a new tab. Without them it stays a flat panel with a decorative centre pin — which is also
	 * what you get if the host injected no `MapsConfigProvider`.
	 */
	center?: LatLng | null
	/** Overrides the street-level default zoom (15) of the rendered picture. */
	zoom?: number | null
	/** Accessible name of the link that opens the pin in Google Maps. */
	mapLinkLabel?: string
	/**
	 * URL of a static map image rendered inside the map container as the background. An escape hatch
	 * for a map that is not Google's — ignored once `center` is set.
	 */
	mapImageSrc?: string
	/** Alt text for the map image. */
	mapAlt?: string
	/**
	 * Custom node rendered inside the map container — takes precedence over `center` and `mapImageSrc`.
	 * Use for a full custom map embed (`<iframe>`, Leaflet container, etc.).
	 */
	mapSlot?: ReactNode
	/**
	 * Optional content rendered as a footer row inside the address card — typically `<Button>`s
	 * such as "Get directions" or "Copy address".
	 */
	actions?: ReactNode
	/** Class applied to the outer `<section>` wrapper. */
	className?: string
	/** Class applied to the map container (the box that holds the image / slot). */
	mapClassName?: string
	/** Class applied to the address card. */
	cardClassName?: string
}

// Layout switches on the component's own width (it owns the `@container` below): the card is stacked
// below the map on narrow containers and overlaid on the map's left edge from the `@npi-tablet` (768px)
// container breakpoint up. No manual orientation — it adapts to the space it's given.
const wrapperClass = 'relative flex w-full flex-col items-stretch gap-npi-6 @npi-tablet:block'
// `relative` + a size that does not depend on children: the map fills this box absolutely, so tiles
// arriving (or failing) never reflow the page.
const mapClass = 'relative w-full overflow-hidden rounded-npi-s bg-npi-bg-light'
// Full-width in flow below the map when narrow; from @npi-tablet up it becomes an absolute overlay
// inset 24px from the map's top-left (Figma 7292:748 — 302px card), shrunk to its content so it stays
// left-aligned and never spans the map. The max-w cap is a safety net for very long content.
const cardClass = 'relative w-full @npi-tablet:absolute @npi-tablet:left-npi-6 @npi-tablet:top-npi-6 @npi-tablet:z-10 @npi-tablet:w-auto @npi-tablet:max-w-[calc(100%-48px)]'

export const MapAddress = forwardRef<HTMLElement, MapAddressProps>((props, ref) => {
	const {
		name,
		address,
		email,
		phone,
		center,
		zoom,
		mapLinkLabel = 'Otevřít v Mapách Google (nové okno)',
		mapImageSrc,
		mapAlt = '',
		mapSlot,
		actions,
		className,
		mapClassName,
		cardClassName,
		...rest
	} = props

	const phoneObj: MapAddressPhone | undefined = typeof phone === 'string' ? { number: phone } : phone

	const cityLine = address.zip ? `${address.zip} ${address.city}` : address.city

	const mapZoom = zoom ?? DEFAULT_ZOOM
	// One pin, on the address itself.
	const markers: StaticMapMarker[] = center ? [{ id: 'address', lat: center.lat, lng: center.lng }] : []

	// The picture is inert; the coordinates are what makes it clickable, and they take the visitor to
	// Google Maps in a new tab rather than booting a pannable map here.
	const mapNode = mapSlot ?? (center
		? (
			<Link
				href={googleMapsUrl(center)}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={mapLinkLabel}
				className="absolute inset-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-npi-blue"
			>
				<StaticMap center={center} zoom={mapZoom} markers={markers} />
			</Link>
		)
		: mapImageSrc
		? (
			<Image
				src={mapImageSrc}
				alt={mapAlt}
				fill
				sizes="(min-width: 768px) 50vw, 100vw"
				className="absolute inset-0 size-full object-cover"
			/>
		)
		: null)

	return (
		<div className="@container w-full">
			<section
				ref={ref}
				className={twMerge(clsx(wrapperClass, className))}
				{...rest}
			>
				<div
					className={twMerge(
						clsx(
							mapClass,
							// 696×400 in the Figma exemplar; consumers can override via mapClassName.
							'aspect-[696/400] min-h-[240px]',
							mapClassName,
						),
					)}
				>
					{mapNode}
					{/* Decorative centre pin for the map-less panel. A real map draws its own pin at the
					    actual coordinates, so it must not be doubled here. */}
					{!mapSlot && !center && (
						<MapPin className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-npi-blue" />
					)}
				</div>

				<article
					className={twMerge(
						clsx(
							'flex flex-col items-start gap-npi-4 rounded-npi-s bg-npi-white p-npi-10 shadow-npi-m',
							cardClass,
							cardClassName,
						),
					)}
				>
					{name && (
						<p className="font-npi-serif font-bold text-[1rem] leading-[1.2] text-npi-blue-dark">
							{name}
						</p>
					)}

					<address className="font-npi-sans font-normal text-[1rem] not-italic leading-[1.5] text-npi-blue-dark whitespace-pre-line">
						{address.street}
						{'\n'}
						{cityLine}
						{address.country && (
							<>
								{'\n'}
								{address.country}
							</>
						)}
					</address>

					{email && (
						<div className="flex items-start gap-npi-2">
							<Icon name="dopis" size="m" className="size-npi-6 shrink-0 text-npi-blue" aria-hidden />
							<Link
								href={`mailto:${email}`}
								className="font-npi-sans font-normal text-[1rem] leading-[1.5] text-npi-blue no-underline hover:underline focus-visible:rounded-npi-xxs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light"
							>
								{email}
							</Link>
						</div>
					)}

					{phoneObj && (
						<div className="flex items-start gap-npi-2">
							<Icon name="telefon" size="m" className="size-npi-6 shrink-0 text-npi-blue" aria-hidden />
							<div className="flex flex-col items-start">
								<Link
									href={`tel:${phoneObj.number.replace(/\s+/g, '')}`}
									className="font-npi-sans font-normal text-[1rem] leading-[1.5] text-npi-blue no-underline hover:underline focus-visible:rounded-npi-xxs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light"
								>
									{phoneObj.number}
								</Link>
								{phoneObj.note && (
									<span className="font-npi-sans font-normal text-[0.75rem] leading-[1.3] text-npi-gray-700">
										{phoneObj.note}
									</span>
								)}
							</div>
						</div>
					)}

					{actions && (
						<div className="mt-npi-2 flex flex-wrap items-center gap-npi-3">
							{actions}
						</div>
					)}
				</article>
			</section>
		</div>
	)
})
MapAddress.displayName = 'MapAddress'
