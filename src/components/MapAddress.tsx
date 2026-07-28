'use client'

import { clsx } from 'clsx'
import { forwardRef, lazy, type ReactNode, Suspense, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import type { LatLng } from '../utils/static-map'
import { type FacadeMarker, MapFacade } from './MapFacade'
import { MapPin } from './MapPin'
import { useMapsConfig } from './map-config'
import { Image, Link } from './ui-primitives'

// Lazy so neither the Maps JS loader nor the canvas code lands in the initial bundle — a pageview
// that never activates the map must not pay for it in bytes or in Dynamic Maps loads.
const GoogleMapCanvas = lazy(() => import('./GoogleMapCanvas'))

/** Zoom of the live map, and therefore of the static facade that stands in for it. Street level: the block answers "where is this address". */
const LIVE_ZOOM = 15

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
	 * Coordinates of the pin. With them the map box becomes a real Google map: a cached static preview
	 * that boots the live, pannable map on click. Without them it stays a flat panel with a decorative
	 * centre pin — which is also what you get if the host injected no `MapsConfigProvider`.
	 */
	center?: LatLng | null
	/** Overrides the street-level default zoom (15). Applies to the preview and the live map alike. */
	zoom?: number | null
	/**
	 * Set false to render the map as a picture that never activates — the editor canvas uses this so a
	 * click selects the block instead of booting (and billing) a live map.
	 */
	interactive?: boolean
	/** Accessible name of the activation control. */
	activateLabel?: string
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
// `relative` + a size that does not depend on children is what makes the facade → live-map swap
// seamless: both layers are absolutely positioned inside this box, so activating one cannot reflow
// the page.
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
		interactive = true,
		activateLabel = 'Zobrazit mapu',
		mapImageSrc,
		mapAlt = '',
		mapSlot,
		actions,
		className,
		mapClassName,
		cardClassName,
		...rest
	} = props

	const { apiKey } = useMapsConfig()
	const [isLive, setIsLive] = useState(false)

	const phoneObj: MapAddressPhone | undefined = typeof phone === 'string' ? { number: phone } : phone

	const cityLine = address.zip ? `${address.zip} ${address.city}` : address.city

	const liveZoom = zoom ?? LIVE_ZOOM
	// One pin, on the address itself. `id` is stable so the live map does not rebuild on re-render.
	const markers: FacadeMarker[] = center ? [{ id: 'address', lat: center.lat, lng: center.lng }] : []
	// Activating costs a Dynamic Maps load, so only offer it when there is a key to load with and the
	// host actually wants interaction (the editor canvas does not).
	const canActivate = Boolean(center && apiKey && interactive)

	const mapNode = mapSlot ?? (center
		? (
			<>
				{/* The facade deliberately stays mounted UNDER the live map: the Maps canvas is opaque once
				    painted, so during its ~300–800 ms load the visitor keeps seeing the preview instead of
				    a blank box. */}
				<MapFacade
					center={center}
					liveZoom={liveZoom}
					markers={markers}
					active={isLive}
					onActivate={canActivate ? () => setIsLive(true) : undefined}
					label={activateLabel}
				/>
				{isLive && apiKey && (
					<Suspense fallback={null}>
						<GoogleMapCanvas center={center} zoom={liveZoom} markers={markers} apiKey={apiKey} className="absolute inset-0 size-full" />
					</Suspense>
				)}
			</>
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
