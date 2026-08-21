import type { CtaTracking } from '../components/cta-tracking'
import { type IconName, iconRegistryM } from '../icons'
import type { ButtonBlockVariant } from './ButtonBlock'

/**
 * An authored call to action on a content block (banner, hero, offer card). Mirrors the settings of
 * the standalone button block, so the same authoring surface serves both; each block renders it in
 * its own visual vocabulary and ignores what it cannot draw.
 */
export interface BlockCta {
	label?: string | null
	url?: string | null
	variant?: ButtonBlockVariant | null
	/** Icon keys — resolved against `iconRegistryM`; an unknown key draws no icon. */
	iconBefore?: string | null
	iconAfter?: string | null
	/** Open the destination in a new browser tab. */
	newTab?: boolean | null
	/** Authored `cta_click` measurement — when set, a click pushes it to the GTM dataLayer. */
	tracking?: CtaTracking | null
}

export const toIconName = (raw: string | null | undefined): IconName | undefined => (raw && raw in iconRegistryM ? (raw as IconName) : undefined)
