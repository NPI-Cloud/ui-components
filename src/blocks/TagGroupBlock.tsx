import { TagGroup, type TagGroupItem } from '../components/TagGroup'

export interface TagGroupBlockItem {
	/** Visible tag text, counts included ("Webinář (243)"). */
	label?: string | null
	href?: string | null
}

export interface TagGroupBlockProps {
	items?: TagGroupBlockItem[] | null
}

// Editor-canvas placeholder shown when no items are supplied — the admin has no Typesense access,
// so the live-data block previews with a representative sample instead of the real facet counts.
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
		.map(item => ({ label: item.label, href: item.href || '#' }))

	if (items == null) return <TagGroup items={placeholderItems} />
	if (resolved.length === 0) return null
	return <TagGroup items={resolved} />
}
