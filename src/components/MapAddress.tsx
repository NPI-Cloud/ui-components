import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export const mapAddressOrientations = ['horizontal', 'vertical'] as const
export type MapAddressOrientation = (typeof mapAddressOrientations)[number]

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
	 * URL of a static map image rendered inside the map container as the background.
	 * The component is a layout shell — supply your own static map (Mapy.cz / OSM / Google Static Maps).
	 */
	mapImageSrc?: string
	/** Alt text for the map image. */
	mapAlt?: string
	/**
	 * Custom node rendered inside the map container — takes precedence over `mapImageSrc`.
	 * Use for a full custom map embed (`<iframe>`, Leaflet container, etc.).
	 */
	mapSlot?: ReactNode
	/**
	 * Optional content rendered as a footer row inside the address card — typically `<Button>`s
	 * such as "Get directions" or "Copy address".
	 */
	actions?: ReactNode
	/**
	 * Layout orientation.
	 * - `horizontal` (default) — address card overlays the left side of the map (Figma 368:9459 desktop layout).
	 * - `vertical` — address card stacks below the map (consumer-side responsive escape hatch).
	 */
	orientation?: MapAddressOrientation
	/** Class applied to the outer `<section>` wrapper. */
	className?: string
	/** Class applied to the map container (the box that holds the image / slot). */
	mapClassName?: string
	/** Class applied to the address card. */
	cardClassName?: string
}

// Pin marker — npi-blue droplet with a hollow white circle (Figma 368:9478 "Pin").
// The original SVG path has the point at the top — rotate the group 180° so the point hangs down.
// Rendered absolutely inside the map container with the tip at the visual anchor (use `-translate-y-full`).
function MapPin({ className }: { className?: string }): React.ReactElement {
	return (
		<svg
			aria-hidden
			width="30"
			height="40"
			viewBox="0 0 29.5072 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<g transform="rotate(180 14.7536 20)">
				<path
					d="M25.8012 14.264C23.0442 10.189 14.7536 0 14.7536 0C14.7536 0 6.46299 10.189 3.70609 14.264C-1.72364 22.2896 -0.988334 30.1982 4.61257 35.7992C7.41305 38.5999 11.0833 40 14.7536 40C18.4239 40 22.0942 38.5999 24.8946 35.7992C30.4956 30.1982 31.2309 22.2896 25.8012 14.264Z"
					fill="currentColor"
				/>
				<circle cx="14.7536" cy="14.4076" r="5.4533" fill="white" />
			</g>
		</svg>
	)
}

const orientationWrapperClass: Record<MapAddressOrientation, string> = {
	// Card overlays the left edge of the map, vertically centered.
	horizontal: 'relative w-full',
	// Card sits below the map, stacked.
	vertical: 'flex w-full flex-col items-stretch gap-npi-6',
}

const orientationMapClass: Record<MapAddressOrientation, string> = {
	horizontal: 'relative w-full overflow-hidden rounded-npi-m bg-npi-bg-light',
	vertical: 'relative w-full overflow-hidden rounded-npi-m bg-npi-bg-light',
}

const orientationCardClass: Record<MapAddressOrientation, string> = {
	// 24px inset from the map's top-left corner (Figma 368:9467 left:144,top:443 vs map left:120,top:419).
	horizontal: 'absolute left-npi-6 top-npi-6 z-10 max-w-[calc(100%-48px)]',
	vertical: 'relative w-full',
}

export const MapAddress = forwardRef<HTMLElement, MapAddressProps>((props, ref) => {
	const {
		name,
		address,
		email,
		phone,
		mapImageSrc,
		mapAlt = '',
		mapSlot,
		actions,
		orientation = 'horizontal',
		className,
		mapClassName,
		cardClassName,
		...rest
	} = props

	const phoneObj: MapAddressPhone | undefined = typeof phone === 'string' ? { number: phone } : phone

	const cityLine = address.zip ? `${address.zip} ${address.city}` : address.city

	const mapNode = mapSlot ?? (mapImageSrc
		? (
			<img
				src={mapImageSrc}
				alt={mapAlt}
				className="absolute inset-0 size-full object-cover"
				loading="lazy"
			/>
		)
		: null)

	return (
		<section
			ref={ref}
			className={twMerge(clsx(orientationWrapperClass[orientation], className))}
			{...rest}
		>
			<div
				className={twMerge(
					clsx(
						orientationMapClass[orientation],
						// 696×400 in the Figma exemplar; consumers can override via mapClassName.
						'aspect-[696/400] min-h-[240px]',
						mapClassName,
					),
				)}
			>
				{mapNode}
				{/* Pin overlay — centered on the map. Hidden when a custom mapSlot owns the visual. */}
				{!mapSlot && <MapPin className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-npi-blue" />}
			</div>

			<article
				className={twMerge(
					clsx(
						'flex flex-col items-start gap-npi-4 rounded-npi-m bg-npi-white p-npi-10 shadow-npi-m',
						orientationCardClass[orientation],
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
						<a
							href={`mailto:${email}`}
							className="font-npi-sans font-normal text-[1rem] leading-[1.5] text-npi-blue no-underline hover:underline focus-visible:rounded-npi-xxs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light"
						>
							{email}
						</a>
					</div>
				)}

				{phoneObj && (
					<div className="flex items-start gap-npi-2">
						<Icon name="telefon" size="m" className="size-npi-6 shrink-0 text-npi-blue" aria-hidden />
						<div className="flex flex-col items-start">
							<a
								href={`tel:${phoneObj.number.replace(/\s+/g, '')}`}
								className="font-npi-sans font-normal text-[1rem] leading-[1.5] text-npi-blue no-underline hover:underline focus-visible:rounded-npi-xxs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light"
							>
								{phoneObj.number}
							</a>
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
	)
})
MapAddress.displayName = 'MapAddress'
