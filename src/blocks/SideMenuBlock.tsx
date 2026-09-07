'use client'

import { type IconName, iconRegistryM } from '../icons'
import { SideMenu, type SideMenuBackground, type SideMenuChildLink, type SideMenuItem } from '../components/SideMenu'

export type SideMenuBlockBackground = 'light' | 'white'
export type SideMenuBlockItemKind = 'link' | 'heading' | 'label' | 'text' | 'spacer'

export interface SideMenuBlockChild {
	id?: string
	title?: string | null
	href?: string | null
	/** Open in a new tab — set by the data layer for external links (the block's convention). */
	newTab?: boolean
}

export interface SideMenuBlockItem extends SideMenuBlockChild {
	/** An unset kind renders as a `link` row. */
	kind?: SideMenuBlockItemKind | null
	/** iconRegistryM key as stored on the row — unknown/empty keys render no glyph. */
	icon?: string | null
	children?: SideMenuBlockChild[] | null
}

export interface SideMenuBlockProps {
	items?: SideMenuBlockItem[] | null
	background?: SideMenuBlockBackground | null
	/** Stretch to the viewport height on the public site so a spacer pushes the rows after it down. */
	fillHeight?: boolean | null
	/** Path of the page the block renders on — drives the current-page highlight. */
	currentPath?: string | null
}

const toIconName = (raw: string | null | undefined): IconName | undefined => raw && raw in iconRegistryM ? raw as IconName : undefined

const backgroundMap: Record<SideMenuBlockBackground, SideMenuBackground> = { light: 'light', white: 'white' }

const untitled = 'Položka'

const toChild = (row: SideMenuBlockChild, index: number): SideMenuChildLink => ({
	id: row.id ?? `child-${index}`,
	label: row.title?.trim() || untitled,
	href: row.href ?? null,
	newTab: row.newTab,
})

export const toSideMenuItems = (rows: SideMenuBlockItem[]): SideMenuItem[] =>
	rows.map((row, index): SideMenuItem => {
		const kind = row.kind ?? 'link'
		switch (kind) {
			case 'heading':
				return { kind, text: row.title?.trim() || 'Nadpis' }
			case 'label':
				return { kind, text: row.title?.trim() || 'Popisek' }
			case 'text':
				return { kind, text: row.title?.trim() || 'Text' }
			case 'spacer':
				return { kind }
			case 'link':
				return {
					kind,
					id: row.id ?? `row-${index}`,
					label: row.title?.trim() || untitled,
					href: row.href ?? null,
					newTab: row.newTab,
					icon: toIconName(row.icon) ?? null,
					children: (row.children ?? []).map(toChild),
				}
		}
	})

// Editor-canvas placeholder shown while the block has no rows yet — the public renderer skips a
// rowless block, so this only ever stands in on the canvas.
const placeholderItems: SideMenuItem[] = [
	{ kind: 'heading', text: 'Postranní menu' },
	{ kind: 'link', id: 'p1', label: 'První položka', href: '#' },
	{ kind: 'link', id: 'p2', label: 'Druhá položka', href: '#', children: [{ id: 'p2a', label: 'Podpoložka', href: '#' }] },
	{ kind: 'link', id: 'p3', label: 'Třetí položka', href: '#' },
]

/**
 * Web-builder adapter over `SideMenu`: maps the block's ordered `WebsiteBlockItem` rows (kind +
 * title + resolved href + optional icon, one level of child links) onto the component's items.
 * Sticky placement is the host wrapper's business (`sideMenuStickyClass`), not the block's.
 */
export function SideMenuBlock({ items, background, fillHeight, currentPath }: SideMenuBlockProps) {
	const rows = items ?? []
	return (
		<SideMenu
			items={rows.length === 0 ? placeholderItems : toSideMenuItems(rows)}
			background={background ? backgroundMap[background] : 'light'}
			fillHeight={fillHeight ?? false}
			currentPath={currentPath}
		/>
	)
}
