// Cross-cutting block layout: vertical spacing applied above each block in a list.
// Schema mirror: matches the BlockSpacing enum in packages/api/model/website-block.ts.
// Tailwind needs literal class names, so the lookup table holds string literals — do not
// build them dynamically.

export type BlockSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const BLOCK_SPACING_DEFAULT: BlockSpacing = 'md'

const SPACINGS: Record<BlockSpacing, { px: number; topClass: string }> = {
	none: { px: 0, topClass: '' },
	xs: { px: 8, topClass: 'mt-npi-2' },
	sm: { px: 16, topClass: 'mt-npi-4' },
	md: { px: 32, topClass: 'mt-npi-8' },
	lg: { px: 64, topClass: 'mt-npi-16' },
	xl: { px: 100, topClass: 'mt-npi-25' },
}

const mapSpacings = <T>(fn: (entry: { px: number; topClass: string }) => T): Record<BlockSpacing, T> => {
	const out = {} as Record<BlockSpacing, T>
	for (const key of Object.keys(SPACINGS) as BlockSpacing[]) {
		out[key] = fn(SPACINGS[key])
	}
	return out
}

export const BLOCK_SPACING_TOP_CLASS = mapSpacings(s => s.topClass)
export const BLOCK_SPACING_LABELS = mapSpacings(s => `${s.px} px`)
