/**
 * How many lines a card description may occupy before it ends in an ellipsis. The clamp exists to
 * stop one long text from stretching a card past its neighbours in a grid, so the count is an
 * authoring choice rather than a fixed design value.
 */
export const descriptionClampLines = [1, 2, 3, 4, 5, 6] as const
export type DescriptionClampLines = typeof descriptionClampLines[number]

// Tailwind scans source for literal class names, so the map is spelled out — `line-clamp-${n}`
// would compile but produce no CSS.
const classByLines: Record<DescriptionClampLines, string> = {
	1: 'line-clamp-1',
	2: 'line-clamp-2',
	3: 'line-clamp-3',
	4: 'line-clamp-4',
	5: 'line-clamp-5',
	6: 'line-clamp-6',
}

/**
 * The clamp class for a stored line count, or `undefined` when the text should flow at full length.
 * The stored value is a plain integer column, so a count outside the supported range renders
 * unclamped rather than silently picking a different one.
 */
export const descriptionClampClass = (lines: number | null | undefined): string | undefined =>
	lines != null && lines in classByLines ? classByLines[lines as DescriptionClampLines] : undefined

/** Narrows a stored line count to the supported range; anything else means "do not clamp". */
export const toDescriptionClampLines = (lines: number | null | undefined): DescriptionClampLines | undefined =>
	lines != null && lines in classByLines ? lines as DescriptionClampLines : undefined
