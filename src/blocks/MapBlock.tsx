'use client'

import { useState } from 'react'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Map, type MapRegionCode, mapRegionCodes, mapRegions } from '../components/Map'
import { Text } from '../components/Text'

/** `numbered` — badge numbers, regions are plain links. `tooltip` — regions select, a content card anchors above the selected one. */
export type MapBlockMode = 'numbered' | 'tooltip'

export interface MapBlockRegion {
	/** 3-letter region code (`PHA`, `STC`, …). Unknown/null codes are ignored so stale rows never crash the render. */
	region?: string | null
	/** Numbered mode — badge text drawn on the region's centre (e.g. "12", "12+"). Null/empty renders no badge. */
	badgeValue?: string | null
	/** Resolved click target — the region link (numbered) or the tooltip card's CTA destination (tooltip). */
	href?: string | null
	/** Tooltip mode — the card's body text under the region-name heading. */
	tooltipText?: string | null
	/** Tooltip mode — the CTA button label; the CTA renders only when `href` is set too. */
	ctaLabel?: string | null
}

export interface MapBlockProps {
	mode?: MapBlockMode | null
	regions?: readonly MapBlockRegion[] | null
	/**
	 * When false the map renders as a static picture — no region links, no selection. The admin
	 * canvas uses this so clicking a region selects the block instead of navigating/selecting;
	 * the first configured region stays preselected there so the tooltip card is still visible.
	 */
	interactive?: boolean
}

const isRegionCode = (code: string): code is MapRegionCode => (mapRegionCodes as readonly string[]).includes(code)

const byRegionCode = (regions: MapBlockProps['regions']): globalThis.Map<MapRegionCode, MapBlockRegion> => {
	const byCode = new globalThis.Map<MapRegionCode, MapBlockRegion>()
	for (const row of regions ?? []) {
		if (row.region && isRegionCode(row.region)) byCode.set(row.region, row)
	}
	return byCode
}

// The anchored card of the tooltip variant — region name, optional body text, optional CTA.
// Mirrors the Figma tooltip exemplar (see ui-showcase Map story).
function RegionTooltipCard({ code, row }: { code: MapRegionCode; row: MapBlockRegion }) {
	return (
		<div className="flex w-full flex-col gap-npi-4 rounded-npi-xs bg-npi-white p-npi-10 shadow-npi-m">
			<Heading level={6}>{mapRegions[code].label}</Heading>
			{row.tooltipText && (
				<Text variant="m" className="text-npi-blue-dark">
					{row.tooltipText}
				</Text>
			)}
			{row.href && <Button variant="primary" label={row.ctaLabel || 'Zobrazit'} href={row.href} />}
		</div>
	)
}

function TooltipMap({ byCode, interactive }: { byCode: globalThis.Map<MapRegionCode, MapBlockRegion>; interactive: boolean }) {
	const [selected, setSelected] = useState<MapRegionCode | undefined>(undefined)
	const configured = mapRegionCodes.filter(code => byCode.has(code))
	// Only configured regions are selectable — an empty tooltip card would be a dead end. With no
	// configured region at all the map stays a plain idle picture (nothing disabled, nothing selectable).
	const disabled = configured.length > 0 ? mapRegionCodes.filter(code => !byCode.has(code)) : undefined
	const value = interactive ? selected : configured[0]
	return (
		<Map
			value={value}
			onChange={interactive && configured.length > 0 ? next => setSelected(typeof next === 'string' ? next : undefined) : undefined}
			disabled={disabled}
			renderTooltip={code => {
				const row = byCode.get(code)
				return row ? <RegionTooltipCard code={code} row={row} /> : null
			}}
		/>
	)
}

export function MapBlock({ mode, regions, interactive = true }: MapBlockProps) {
	const byCode = byRegionCode(regions)

	if (mode === 'tooltip') return <TooltipMap byCode={byCode} interactive={interactive} />

	const getRegionNumber = (code: MapRegionCode): string | undefined => byCode.get(code)?.badgeValue || undefined
	const getRegionHref = (code: MapRegionCode): string | undefined => (interactive && byCode.get(code)?.href) || undefined

	return <Map getRegionNumber={getRegionNumber} getRegionHref={getRegionHref} />
}
