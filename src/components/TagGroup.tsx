'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'
import { Tag, type TagSize } from './Tag'

export interface TagGroupItem {
	/** Visible label — counts belong in the text itself, e.g. `'Webinář (243)'` */
	label: string
	/** Link target — renders the tag as an anchor */
	href?: string
	/** Click handler when the tag acts as a button (ignored when `href` is set) */
	onClick?: () => void
}

export interface TagGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/** Tags to render, in order */
	items: TagGroupItem[]
	/** Size of all tags in the group */
	size?: TagSize
	/** Render for dark backgrounds */
	inverted?: boolean
}

/**
 * Wrapping list of `Tag`s with an 8px gap — e.g. an overview of formats or topics
 * with counts baked into the labels (`'Webinář (243)'`).
 */
export const TagGroup = forwardRef<HTMLUListElement, TagGroupProps>(({ items, size = 'M', inverted = false, className, ...props }, ref) => {
	if (items.length === 0) return null

	return (
		<ul ref={ref} role="list" className={twMerge(clsx('flex flex-wrap items-start gap-npi-2', className))} {...props}>
			{items.map((item, i) => (
				<li key={i} className="flex">
					<Tag label={item.label} size={size} inverted={inverted} href={item.href} onClick={item.onClick} />
				</li>
			))}
		</ul>
	)
})
TagGroup.displayName = 'TagGroup'
