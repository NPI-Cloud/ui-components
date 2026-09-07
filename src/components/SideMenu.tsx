'use client'

import { clsx } from 'clsx'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Heading } from './Heading'
import { Text } from './Text'
import { sideMenuFillHeightClass, sideMenuStickyClass } from './side-menu-placement'
import { Link } from './ui-primitives'

export const sideMenuBackgrounds = ['light', 'white'] as const
export type SideMenuBackground = (typeof sideMenuBackgrounds)[number]

export interface SideMenuChildLink {
	/** Stable key — falls back to the index. */
	id?: string
	label: string
	/** Page path, absolute URL or a same-page `#anchor`. Without one the row is plain text. */
	href?: string | null
	newTab?: boolean
	/** Forces the row into the selected state regardless of `currentPath` / scroll position. */
	active?: boolean
}

export interface SideMenuLinkItem extends SideMenuChildLink {
	kind: 'link'
	/** 16 px leading glyph (a `iconRegistryS` key; `m` glyphs scale down). */
	icon?: IconName | null
	/** Trailing pill text (a notification count); app-supplied, never authored content. */
	badge?: string | null
	/** Expandable submenu — one level. A row with children shows the chevron and can open/close. */
	children?: SideMenuChildLink[] | null
}

export type SideMenuItem =
	| SideMenuLinkItem
	/** Serif group title (Bitter 20). */
	| { kind: 'heading'; text: string }
	/** Small-caps serif label (`Text` variant `label`) with 16 px above it. */
	| { kind: 'label'; text: string }
	/** Plain 14 px paragraph. */
	| { kind: 'text'; text: string }
	/** Gap between groups; absorbs the free height when the menu fills the viewport. */
	| { kind: 'spacer' }
	/** App-supplied row (a checkbox, a toggle) — rendered verbatim, separated like a link row. */
	| { kind: 'custom'; id?: string; node: ReactNode }

export interface SideMenuProps {
	items: SideMenuItem[]
	/** `light` = flat light-gray rounded panel with padding, `white` = bare rows on the page. */
	background?: SideMenuBackground
	/**
	 * Path of the page the menu renders on (`/o-nas`). A link whose path equals it — or, for a row
	 * with children, is a prefix of it — is the current page. Same-page `#anchor` links are matched
	 * against the scroll position instead.
	 */
	currentPath?: string | null
	/**
	 * Pin the menu to the viewport top while its column scrolls (tablet and up). The nearest tall
	 * ancestor bounds the sticking — the parent must span the whole row for this to work.
	 */
	sticky?: boolean
	/** Stretch to the viewport height (tablet and up) so a `spacer` row pushes what follows to the bottom edge. */
	fillHeight?: boolean
	/** Accessible name of the `<nav>` landmark. */
	ariaLabel?: string
	className?: string
}

const backgroundClasses: Record<SideMenuBackground, string> = {
	light: 'rounded-npi-xs bg-npi-bg-light p-npi-6',
	white: '',
}

const Hairline = () => <span role="presentation" className="block h-px w-full shrink-0 bg-npi-gray-200" />

// 16 px chevron from the design (Icon / M / Arrow S — 1.5 px round stroke); points up when open.
const Chevron = ({ open, className }: { open?: boolean; className?: string }) => (
	<svg viewBox="0 0 16 16" fill="none" aria-hidden focusable={false} className={twMerge(clsx('size-npi-4 shrink-0 transition-transform', open && 'rotate-180', className))}>
		<path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
)

const LeadingIcon = ({ name }: { name: IconName }) => <Icon name={name} size="s" className="size-npi-4 shrink-0" />

// Row-level text: Noto Sans 14 bold on a 21 px line (design), link blue at rest, darker on hover,
// navy with a 2 px underline when current.
const linkTextClass = 'font-npi-sans text-[0.875rem] font-bold leading-[1.5] [word-break:break-word]'
const restColorClass = 'text-npi-text-link transition-colors hover:text-npi-text-link-hover'
const currentColorClass = 'text-npi-text-primary'
const currentUnderlineClass = 'shadow-[inset_0_-2px_0_currentColor]'
const focusClass = 'outline-none focus-visible:rounded-npi-xxs focus-visible:ring-4 focus-visible:ring-npi-blue-light'

const parseHref = (href: string): { path: string | null; fragment: string | null; external: boolean } => {
	if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return { path: null, fragment: null, external: true }
	const hashIndex = href.indexOf('#')
	const pathPart = hashIndex === -1 ? href : href.slice(0, hashIndex)
	const fragment = hashIndex === -1 ? null : href.slice(hashIndex + 1) || null
	const path = pathPart.split('?')[0] ?? ''
	return { path: path || null, fragment, external: false }
}

const normalizePath = (path: string): string => (path.length > 1 ? path.replace(/\/+$/, '') : path)

// A same-page anchor: `#x`, or `/current-page#x`.
const anchorOf = (href: string | null | undefined, currentPath: string | null | undefined): string | null => {
	if (!href) return null
	const { path, fragment, external } = parseHref(href)
	if (external || !fragment) return null
	if (path && (!currentPath || normalizePath(path) !== normalizePath(currentPath))) return null
	return fragment
}

// A page link is current when its path is the current one; a parent row also when it is an ancestor
// of it (`/skoly` on `/skoly/materske`). The site root only matches exactly.
const pathMatches = (href: string | null | undefined, currentPath: string | null | undefined, allowPrefix: boolean): boolean => {
	if (!href || !currentPath) return false
	const { path, fragment, external } = parseHref(href)
	if (external || fragment || !path) return false
	const target = normalizePath(path)
	const current = normalizePath(currentPath)
	if (target === current) return true
	return allowPrefix && target !== '/' && current.startsWith(`${target}/`)
}

/**
 * Tracks which same-page anchor target is "current" — the last one whose top edge has scrolled past
 * the site's `scroll-padding-top` line, or the first target while the page sits above them all.
 * Returns `null` when there are no anchor targets on the page.
 */
const useActiveAnchor = (anchorIds: string[]): string | null => {
	const [active, setActive] = useState<string | null>(null)
	// The list is compared by value — callers rebuild the array every render.
	const key = anchorIds.join(' ')
	useEffect(() => {
		const fragments = key ? key.split(' ') : []
		if (fragments.length === 0) {
			setActive(null)
			return
		}
		const targets = fragments.map(id => ({ id, el: document.getElementById(id) })).filter((t): t is { id: string; el: HTMLElement } => t.el !== null)
		if (targets.length === 0) {
			setActive(null)
			return
		}
		let frame = 0
		const measure = () => {
			frame = 0
			const offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
			// 1 px of slack so a target scrolled exactly to the padding line counts as reached.
			const line = offset + 1
			let current = targets[0]!.id
			for (const target of targets) {
				if (target.el.getBoundingClientRect().top <= line) current = target.id
			}
			setActive(current)
		}
		const schedule = () => {
			if (frame === 0) frame = requestAnimationFrame(measure)
		}
		measure()
		window.addEventListener('scroll', schedule, { passive: true })
		window.addEventListener('resize', schedule)
		window.addEventListener('hashchange', schedule)
		return () => {
			if (frame !== 0) cancelAnimationFrame(frame)
			window.removeEventListener('scroll', schedule)
			window.removeEventListener('resize', schedule)
			window.removeEventListener('hashchange', schedule)
		}
	}, [key])
	return active
}

interface RowState {
	current: boolean
	/** `page` for a path match, `location` for an anchor match — the `aria-current` token. */
	token: 'page' | 'location'
}

const rowState = (row: SideMenuChildLink, currentPath: string | null | undefined, activeAnchor: string | null, allowPrefix: boolean): RowState => {
	if (row.active) return { current: true, token: anchorOf(row.href, currentPath) ? 'location' : 'page' }
	const anchor = anchorOf(row.href, currentPath)
	if (anchor) return { current: activeAnchor === anchor, token: 'location' }
	return { current: pathMatches(row.href, currentPath, allowPrefix), token: 'page' }
}

const linkTarget = (row: SideMenuChildLink) => (row.newTab ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {})

const ChildRow = ({ row, state }: { row: SideMenuChildLink; state: RowState }) => {
	const className = clsx('font-npi-sans text-[0.875rem] font-normal leading-5 [word-break:break-word]', state.current ? clsx(currentColorClass, currentUnderlineClass) : restColorClass)
	if (!row.href) return <span className={className}>{row.label}</span>
	return (
		<Link href={row.href} aria-current={state.current ? state.token : undefined} className={twMerge(clsx(className, focusClass))} {...linkTarget(row)}>
			{row.label}
		</Link>
	)
}

const LinkRow = ({ item, currentPath, activeAnchor }: { item: SideMenuLinkItem; currentPath: string | null | undefined; activeAnchor: string | null }) => {
	const children = item.children ?? []
	const expandable = children.length > 0
	const childStates = children.map(child => rowState(child, currentPath, activeAnchor, false))
	const own = rowState(item, currentPath, activeAnchor, expandable)
	const containsCurrent = childStates.some(s => s.current)
	const current = own.current || containsCurrent
	// A submenu opens when its parent is current or holds the current row (the design's "Open"
	// state is the selected row with its children shown); the chevron toggles it from there.
	const [open, setOpen] = useState(current)
	useEffect(() => {
		if (current) setOpen(true)
	}, [current])

	// The colour sits on the row element so the leading icon (fill: currentColor) and the label
	// share it, including the hover shade; the label span only adds the current-row underline.
	const rowColorClass = current ? currentColorClass : restColorClass
	const labelClass = clsx(linkTextClass, current && currentUnderlineClass)
	const chevronClass = rowColorClass
	const labelContent = (
		<>
			{item.icon && <LeadingIcon name={item.icon} />}
			<span className={labelClass}>{item.label}</span>
			{item.badge && (
				<span className="ml-npi-1 inline-flex h-npi-4 min-w-npi-4 shrink-0 items-center justify-center rounded-full bg-npi-blue px-npi-1 font-npi-sans text-[0.75rem] font-bold leading-none text-npi-white">
					{item.badge}
				</span>
			)}
		</>
	)
	const label = item.href
		? (
			<Link href={item.href} aria-current={own.current ? own.token : undefined} className={twMerge(clsx('flex min-w-0 flex-1 items-center gap-npi-2 no-underline', rowColorClass, focusClass))} {...linkTarget(item)}>
				{labelContent}
			</Link>
		)
		: expandable
		? (
			<button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} className={twMerge(clsx('flex min-w-0 flex-1 cursor-pointer items-center gap-npi-2 text-left', rowColorClass, focusClass))}>
				{labelContent}
			</button>
		)
		: <span className={clsx('flex min-w-0 flex-1 items-center gap-npi-2', rowColorClass)}>{labelContent}</span>

	return (
		<div className="flex w-full flex-col gap-npi-3">
			<div className="flex w-full items-start gap-npi-2">
				{label}
				{/* The chevron slot is always reserved so labels line up across rows with and without a submenu. */}
				<span className="flex h-[21px] w-npi-4 shrink-0 items-center justify-center">
					{expandable && (
						<button
							type="button"
							aria-expanded={open}
							aria-label={open ? `Sbalit ${item.label}` : `Rozbalit ${item.label}`}
							onClick={() => setOpen(o => !o)}
							className={twMerge(clsx('flex size-npi-4 cursor-pointer items-center justify-center', chevronClass, focusClass))}
						>
							<Chevron open={open} />
						</button>
					)}
				</span>
			</div>
			{expandable && open && (
				<ul className="flex w-full flex-col gap-npi-3 py-npi-2 pl-npi-6">
					{children.map((child, i) => (
						<li key={child.id ?? i} className="flex">
							<ChildRow row={child} state={childStates[i]!} />
						</li>
					))}
				</ul>
			)}
		</div>
	)
}

// Which rows draw the 1 px hairline under them — every navigation-ish row and a group gap (so the
// group after a spacer opens with a line); titles and paragraphs sit directly on the next row.
const hasHairlineBelow = (item: SideMenuItem): boolean => item.kind === 'link' || item.kind === 'label' || item.kind === 'custom' || item.kind === 'spacer'

const collectAnchors = (items: SideMenuItem[], currentPath: string | null | undefined): string[] => {
	const anchors: string[] = []
	for (const item of items) {
		if (item.kind !== 'link') continue
		const own = anchorOf(item.href, currentPath)
		if (own) anchors.push(own)
		for (const child of item.children ?? []) {
			const anchor = anchorOf(child.href, currentPath)
			if (anchor) anchors.push(anchor)
		}
	}
	return anchors
}

/**
 * Secondary navigation panel — an ordered list of link rows (page links, same-page anchors, one
 * level of expandable child links) interleaved with group titles, labels, paragraphs and spacers.
 * Highlights the current page (`currentPath`) or the section scrolled into view (anchor links) and
 * announces it through `aria-current`.
 */
export function SideMenu({ items, background = 'light', currentPath, sticky, fillHeight, ariaLabel = 'Navigace v sekci', className }: SideMenuProps) {
	const anchors = useMemo(() => collectAnchors(items, currentPath), [items, currentPath])
	const activeAnchor = useActiveAnchor(anchors)
	const rows = items.map((item, i) => {
		const trailing = hasHairlineBelow(item) && (i < items.length - 1 || item.kind === 'link')
		return { item, key: itemKey(item, i), trailing }
	})
	return (
		<nav
			aria-label={ariaLabel}
			className={twMerge(
				clsx('flex w-full flex-col gap-npi-3', backgroundClasses[background], sticky && sideMenuStickyClass, fillHeight && sideMenuFillHeightClass, className),
			)}
		>
			{rows.map(({ item, key, trailing }) => (
				<div key={key} className="contents">
					{renderRow(item, currentPath, activeAnchor)}
					{trailing && <Hairline />}
				</div>
			))}
		</nav>
	)
}

const itemKey = (item: SideMenuItem, index: number): string => {
	if (item.kind === 'link' || item.kind === 'custom') return item.id ?? `${item.kind}-${index}`
	return `${item.kind}-${index}`
}

function renderRow(item: SideMenuItem, currentPath: string | null | undefined, activeAnchor: string | null): ReactNode {
	switch (item.kind) {
		case 'link':
			return <LinkRow item={item} currentPath={currentPath} activeAnchor={activeAnchor} />
		case 'heading':
			return <Heading level={6} className="w-full">{item.text}</Heading>
		case 'label':
			return <Text variant="label" className="w-full pt-npi-4 text-npi-text-primary">{item.text}</Text>
		case 'text':
			return <Text variant="m" className="w-full leading-5 text-npi-text-primary">{item.text}</Text>
		case 'spacer':
			// Grows only while the panel has spare height (fillHeight); otherwise a fixed 16 px gap.
			return <span role="presentation" className="block min-h-npi-4 w-full flex-1" />
		case 'custom':
			return <div className="w-full py-npi-2">{item.node}</div>
	}
}
