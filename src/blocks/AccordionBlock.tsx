'use client'

import { Image } from '../components/ui-primitives'
import type { ReactNode } from 'react'
import { Accordion, AccordionItem } from '../components/Accordion'
import { clsx } from 'clsx'
import { normalizeRichContent, renderRichBlocks, renderRichInlines, textBlockAlignClass, type TextBlockRichContent } from './TextBlock'

export type AccordionBlockSize = 's' | 'm'

// Group wrapper around consecutive `accordionItem` blocks. The head block carries the knobs:
// shared `boxed` maps to the Accordion `boxed`/`plain` variant, shared `compactSize` to its size.
export interface AccordionBlockProps {
	boxed?: boolean | null
	size?: AccordionBlockSize | null
	children: ReactNode
}

export function AccordionBlock({ boxed, size, children }: AccordionBlockProps) {
	return (
		<Accordion variant={boxed ? 'boxed' : 'plain'} size={size ?? 'm'}>
			{children}
		</Accordion>
	)
}

export interface AccordionItemBlockProps {
	/** Question / title — stored on shared `heading`. */
	question?: string | null
	/** Secondary line under the title — stored on shared `subtitle`. */
	description?: string | null
	/** Avatar image URL — from `imageAsset.image.url`. Presence switches the item to the medallion layout. */
	avatarSrc?: string | null
	avatarAlt?: string | null
	/** Rich-text answer — `content.data`, same Slate shape as the text block. */
	content?: TextBlockRichContent | string | null
	/** Render expanded initially — the editor canvas opens items so their answers are visible. */
	defaultOpen?: boolean
}

export function AccordionItemBlock({ question, description, avatarSrc, avatarAlt, content, defaultOpen }: AccordionItemBlockProps) {
	const blocks = normalizeRichContent(content)
	return (
		<AccordionItem
			title={question || 'Titulek'}
			description={description || undefined}
			avatar={avatarSrc
				? (
					<Image
						src={avatarSrc}
						alt={avatarAlt ?? ''}
						className="size-npi-14 shrink-0 rounded-full object-cover"
						width={56}
						height={56}
					/>
				)
				: undefined}
			defaultOpen={defaultOpen}
		>
			{blocks
				? renderRichBlocks(blocks, (children, key, align) => (
					<p key={key} className={clsx('[&:not(:last-child)]:mb-npi-4', textBlockAlignClass(align))}>
						{renderRichInlines(children)}
					</p>
				))
				: <p className="text-npi-text-secondary">Obsah…</p>}
		</AccordionItem>
	)
}

// Editor-only marker bar for the `accordion` head block on the canvas — same treatment as
// FlexStartBlock. Produces no output on the live website (the group renderer consumes the head).
export function AccordionStartBlock({ itemCount }: { itemCount?: number }) {
	return (
		<div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-slate-400">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="11"
				height="11"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.75"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect x="3" y="3" width="18" height="18" rx="2" />
				<line x1="3" y1="9" x2="21" y2="9" />
				<line x1="3" y1="15" x2="21" y2="15" />
			</svg>
			<span>{itemCount === undefined ? 'Akordeon' : `Akordeon · ${itemCount} ${pluralizeItems(itemCount)}`}</span>
		</div>
	)
}

function pluralizeItems(count: number): string {
	if (count === 1) return 'položka'
	if (count >= 2 && count <= 4) return 'položky'
	return 'položek'
}
