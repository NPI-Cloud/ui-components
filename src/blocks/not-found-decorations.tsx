'use client'

import type { NotFoundPageTheme } from './NotFoundPage'
import leftDigitalizace from '../illustrations/not-found/left-digitalizace.png'
import leftRevizeRvp from '../illustrations/not-found/left-revize-rvp.png'
import leftVedemeSkolu from '../illustrations/not-found/left-vedeme-skolu.png'
import leftZapojmeVsechny from '../illustrations/not-found/left-zapojme-vsechny.png'
import rightDigitalizace from '../illustrations/not-found/right-digitalizace.png'
import rightRevizeRvp from '../illustrations/not-found/right-revize-rvp.png'
import rightVedemeSkolu from '../illustrations/not-found/right-vedeme-skolu.png'
import rightZapojmeVsechny from '../illustrations/not-found/right-zapojme-vsechny.png'

/**
 * The 404 decoration clusters, exported per theme straight from Figma ("404" frame, NPI design file:
 * left = group "1934", right = group "1933"). They're masked, multi-shape compositions that don't survive
 * a browser/SVG reproduction, so we ship the exact Figma raster — one transparent 236×236 PNG per theme.
 * Picking by theme also keeps the per-theme accent colors exactly as the designer set them.
 */
const leftByTheme: Record<NotFoundPageTheme, string> = {
	'vedeme-skolu': leftVedemeSkolu,
	'zapojme-vsechny': leftZapojmeVsechny,
	'digitalizace': leftDigitalizace,
	'revize-rvp': leftRevizeRvp,
}

const rightByTheme: Record<NotFoundPageTheme, string> = {
	'vedeme-skolu': rightVedemeSkolu,
	'zapojme-vsechny': rightZapojmeVsechny,
	'digitalizace': rightDigitalizace,
	'revize-rvp': rightRevizeRvp,
}

/** Left decoration cluster — big blue blob, themed accent blob, and the blue dot field. */
export function LeftDecoration({ theme }: { theme: NotFoundPageTheme }) {
	return <img src={leftByTheme[theme]} alt="" aria-hidden="true" width={236} height={236} className="block size-[236px] shrink-0" />
}

/** Right decoration cluster — graph-paper grid, themed triangle, and the blue arch. */
export function RightDecoration({ theme }: { theme: NotFoundPageTheme }) {
	return <img src={rightByTheme[theme]} alt="" aria-hidden="true" width={236} height={236} className="block size-[236px] shrink-0" />
}
