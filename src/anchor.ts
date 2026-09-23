/**
 * Normalize a user-typed anchor into a URL-fragment-safe slug. Applied identically where a block
 * renders its `id` and where a link builds its `#fragment`, so `#Ceny` matches a block whose anchor
 * was typed "Ceny". Strips a leading `#`, lowercases, and collapses any run of non-letter/digit
 * characters into a single hyphen. Returns `null` for empty / whitespace-only input.
 */
export function normalizeAnchor(value: string | null | undefined): string | null {
	if (!value) return null
	const slug = value
		.trim()
		.replace(/^#+/, '')
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-+|-+$/g, '')
	return slug || null
}

/**
 * Appends a link's stored anchor to a resolved address: `#` plus the normalized slug, so the link
 * lands on the block whose `id` normalizes the same way. An address that already carries a fragment
 * keeps it, and an empty anchor leaves the address alone.
 */
export function withAnchor(href: string, anchor: string | null | undefined): string {
	const fragment = normalizeAnchor(anchor)
	return fragment && !href.includes('#') ? `${href}#${fragment}` : href
}
