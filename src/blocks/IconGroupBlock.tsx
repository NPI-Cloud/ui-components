import { IconGroup, type IconGroupItem } from '../components/IconGroup'
import { type IconName, iconRegistryM } from '../icons'

export interface IconGroupBlockItem {
	/** iconRegistryM key as stored on the block item — unknown/empty keys are skipped. */
	icon?: string | null
	href?: string | null
	/** Open in a new tab — set by the data layer for external links (the block's convention). */
	newTab?: boolean
}

export interface IconGroupBlockProps {
	/** Optional leading text label (e.g. `Sdílet`, `Přehrát`). */
	label?: string | null
	items?: IconGroupBlockItem[] | null
}

const toIconName = (raw: string | null | undefined): IconName | undefined => raw && raw in iconRegistryM ? raw as IconName : undefined

// Editor-canvas placeholder shown while the block has no item rows yet. Rendered ONLY for a
// zero-row input — a public page's renderer skips rowless icon groups anyway, and rows that
// don't resolve (icon not picked / unknown key) render nothing rather than fake icons.
const placeholderItems: IconGroupItem[] = [
	{ icon: 'facebook', href: '#' },
	{ icon: 'instagram', href: '#' },
	{ icon: 'x', href: '#' },
]

export function IconGroupBlock({ label, items }: IconGroupBlockProps) {
	const rows = items ?? []
	const resolved: IconGroupItem[] = rows
		.map((item): IconGroupItem | null => {
			const icon = toIconName(item.icon)
			if (!icon) return null
			return { icon, href: item.href || '#', target: item.newTab ? '_blank' : undefined }
		})
		.filter((item): item is IconGroupItem => item !== null)
		// The design caps the group at 4 icons; the form stops offering "add" there, this guards data
		// that slipped past it.
		.slice(0, 4)

	if (rows.length === 0) return <IconGroup label={label || undefined} items={placeholderItems} />
	if (resolved.length === 0) return null
	return <IconGroup label={label || undefined} items={resolved} />
}
