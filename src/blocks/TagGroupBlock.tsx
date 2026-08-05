import { TagGroup, type TagGroupItem } from '../components/TagGroup'

export interface TagGroupBlockItem {
	/** Visible tag text, counts included ("Webinář (243)"). */
	label?: string | null
	href?: string | null
	/** Open the link in a new tab — external links by convention. */
	newTab?: boolean | null
}

export interface TagGroupBlockProps {
	items?: TagGroupBlockItem[] | null
}

// Editor-canvas placeholder shown when no items are supplied (`items == null`) — the live-data
// `formatTagGroup` canvas has no Typesense access, and a manual `tagGroup` with no rows yet
// previews the same representative sample instead of a blank block.
const placeholderItems: TagGroupItem[] = [
	{ label: 'Webinář (243)', href: '#' },
	{ label: 'Kurz (81)', href: '#' },
	{ label: 'E-learning (10)', href: '#' },
	{ label: 'Materiál do výuky (1209)', href: '#' },
	{ label: 'Podcast (368)', href: '#' },
]

export function TagGroupBlock({ items }: TagGroupBlockProps) {
	const resolved: TagGroupItem[] = (items ?? [])
		.filter((item): item is TagGroupBlockItem & { label: string } => Boolean(item.label))
		// A row without a link renders as a plain (non-anchor) tag rather than a dead `#` link.
		.map(item => ({ label: item.label, href: item.href || undefined, newTab: item.newTab ?? undefined }))

	if (items == null) return <TagGroup items={placeholderItems} />
	if (resolved.length === 0) return null
	return <TagGroup items={resolved} />
}
