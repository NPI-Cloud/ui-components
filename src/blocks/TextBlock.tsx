'use client'

import { Link } from '../components/ui-primitives'
import { clsx } from 'clsx'
import { Fragment, type ReactNode } from 'react'
import { Text, type TextSize } from '../components/Text'
import { TooltipInfo } from '../components/Tooltip'
import type { RichTextReferences } from './RichTextView'

type TextBlockVariant = TextSize

export interface TextBlockRichLeaf {
	text: string
	isBold?: boolean
	isItalic?: boolean
	// Slate's underline mark key is `isUnderlined` (the bindx-editor default) — keep it as-is so the
	// renderer reads exactly what the editor writes.
	isUnderlined?: boolean
}

export interface TextBlockRichAnchor {
	type: 'anchor'
	href: string
	/** The `ContentReference` row saying where the link really goes; absent on a link authored before rows existed. */
	referenceId?: string
	children: TextBlockRichLeaf[]
}

/** A link to a document of the shared file library. Its row (`fileAnchor`) names the file. */
export interface TextBlockRichFileAnchor {
	type: 'fileAnchor'
	href: string
	referenceId?: string
	children: TextBlockRichLeaf[]
}

// A run of text carrying an explanatory note, revealed on hover/focus of the run itself.
export interface TextBlockRichTooltip {
	type: 'tooltip'
	content: string
	children: TextBlockRichInline[]
}

export type TextBlockRichInline = TextBlockRichLeaf | TextBlockRichAnchor | TextBlockRichFileAnchor | TextBlockRichTooltip

// Block text alignment, stored on the paragraph node (bindx-editor's `align` attribute). `start` is
// the default (left) so an unset paragraph and an explicit `start` render identically.
export type TextBlockAlign = 'start' | 'center' | 'end' | 'justify'

export interface TextBlockRichParagraph {
	type: 'paragraph'
	align?: TextBlockAlign
	children: TextBlockRichInline[]
}

export interface TextBlockRichListItem {
	type: 'listItem'
	children: TextBlockRichInline[]
}

export interface TextBlockRichList {
	type: 'orderedList' | 'unorderedList'
	children: TextBlockRichListItem[]
}

// A top-level node in the rich document: a paragraph or a bullet/numbered list.
export type TextBlockRichBlock = TextBlockRichParagraph | TextBlockRichList

export interface TextBlockRichContent {
	formatVersion?: number
	children: TextBlockRichBlock[]
}

export interface TextBlockProps {
	variant?: TextBlockVariant | null
	content?: TextBlockRichContent | string | null
	/**
	 * The block content's resolved reference rows, keyed by the link node's `referenceId` — where a
	 * link really goes now (`href`) and, for a link to a library file, that file's formats
	 * (`downloadVariants`). Omitted (or a row that resolves to nothing) leaves every link on the
	 * address stored on its node.
	 */
	references?: RichTextReferences
	/** Wrap in a soft grey rounded box (matches `<Testimonial boxed>`). */
	boxed?: boolean | null
}

const FALLBACK_PARAGRAPH: TextBlockRichParagraph = {
	type: 'paragraph',
	children: [{ text: 'Textový blok' }],
}

export function TextBlock({ variant, content, references, boxed }: TextBlockProps) {
	const blocks = normalizeRichContent(content) ?? [FALLBACK_PARAGRAPH]
	return (
		<div className={clsx('flex flex-col gap-npi-4', boxed && 'rounded-npi-m bg-npi-bg-light px-npi-12 py-npi-10')}>
			{renderRichBlocks(blocks, (children, key, align) => (
				<Text key={key} variant={variant ?? 'l'} className={textBlockAlignClass(align)}>
					{renderRichInlines(children, references)}
				</Text>
			))}
		</div>
	)
}

// Shared by every block that stores Slate rich text on `content.data` (Text, AccordionItem body).
// Returns null for empty/unusable content so each consumer picks its own fallback.
export function normalizeRichContent(content: TextBlockProps['content']): TextBlockRichBlock[] | null {
	if (content === null || content === undefined || content === '') return null
	if (typeof content === 'string') return [{ type: 'paragraph', children: [{ text: content }] }]
	if (typeof content !== 'object' || !Array.isArray(content.children) || content.children.length === 0) return null
	if (isEffectivelyEmpty(content)) return null
	return content.children.map(sanitizeBlock)
}

// Stored documents are free-form JSON, so a node can arrive without its `children` array even
// though the types declare it required (seen in prod: a list item saved without children took down
// the whole page-editor route). Coerce every level to the declared shape so the renderers can
// trust it — a malformed node renders empty instead of crashing.
function sanitizeBlock(node: TextBlockRichBlock): TextBlockRichBlock {
	if (node.type !== 'paragraph') {
		const items = Array.isArray(node.children) ? node.children : []
		return { ...node, children: items.map(item => (Array.isArray(item.children) ? item : { ...item, children: [] })) }
	}
	return Array.isArray(node.children) ? node : { ...node, children: [] }
}

// True when the document carries no visible text anywhere — walks paragraphs, anchors and list
// items uniformly so a document of empty list rows still counts as empty.
function nodeHasText(node: unknown): boolean {
	if (!node || typeof node !== 'object') return false
	const rec = node as { text?: unknown; children?: unknown }
	if (typeof rec.text === 'string' && rec.text.length > 0) return true
	return Array.isArray(rec.children) && rec.children.some(nodeHasText)
}

function isEffectivelyEmpty(content: TextBlockRichContent): boolean {
	return !content.children.some(nodeHasText)
}

// Tailwind text-align utility for a stored alignment. `undefined` (no alignment) inherits the
// default left/start, so callers only add a class when an alignment is actually set.
const ALIGN_CLASS: Record<TextBlockAlign, string> = {
	start: 'text-start',
	center: 'text-center',
	end: 'text-end',
	justify: 'text-justify',
}

export function textBlockAlignClass(align: TextBlockAlign | undefined): string | undefined {
	return align ? ALIGN_CLASS[align] : undefined
}

// Renders the top-level rich nodes (paragraphs + bullet/numbered lists). `wrapInlines` frames a run
// of inline content — each caller styles it its own way (the text block wraps it in `<Text
// variant>`, the accordion in a spaced `<p>`) — and it's reused for both paragraph bodies and
// list-item bodies so list text matches body text. Paragraphs pass their alignment through; list
// items inherit the list's default. Lists render as real `<ul>`/`<ol>`.
export function renderRichBlocks(
	nodes: TextBlockRichBlock[],
	wrapInlines: (children: TextBlockRichInline[], key: number, align?: TextBlockAlign) => ReactNode,
): ReactNode[] {
	return nodes.map((node, index) => {
		if (node.type === 'paragraph') return wrapInlines(node.children, index, node.align)
		const ListTag = node.type === 'orderedList' ? 'ol' : 'ul'
		return (
			<ListTag
				key={index}
				className={clsx('flex flex-col gap-npi-1 pl-5', node.type === 'orderedList' ? 'list-decimal' : 'list-disc')}
			>
				{node.children.map((item, itemIndex) => (
					<li key={itemIndex}>{wrapInlines(item.children, itemIndex)}</li>
				))}
			</ListTag>
		)
	})
}

export function renderRichInlines(children: TextBlockRichInline[], references?: RichTextReferences): ReactNode {
	return children.map((node, index) => {
		if ('type' in node && node.type === 'tooltip') {
			// The run itself stays plain — the info glyph placed after it is the only trigger.
			// A tooltip with no body has nothing to reveal, so it renders as text alone.
			const wrapped = renderRichInlines(Array.isArray(node.children) ? node.children : [], references)
			return (
				<Fragment key={index}>
					{wrapped}
					{node.content && <TooltipInfo content={node.content} className="ml-npi-1" />}
				</Fragment>
			)
		}
		if ('type' in node && node.type === 'anchor') {
			// The row is the truth about where the link goes; `href` is the address stored when it was
			// authored. A link with neither would be a dead `#`, so it falls back to plain text.
			const href = referenceHref(node.referenceId, references) || node.href
			if (!href) return <Fragment key={index}>{renderLeaves(Array.isArray(node.children) ? node.children : [])}</Fragment>
			return (
				<Link key={index} href={href} className="text-npi-blue underline">
					{renderLeaves(Array.isArray(node.children) ? node.children : [])}
				</Link>
			)
		}
		if ('type' in node && node.type === 'fileAnchor') {
			// A link to a library file goes to that file's first format as it is now, and opens in a new
			// tab (files live cross-origin). Its node's `href` covers a file since deleted.
			const file = node.referenceId ? references?.[node.referenceId]?.downloadVariants?.[0] : undefined
			const href = file?.url || node.href
			if (!href) return <Fragment key={index}>{renderLeaves(Array.isArray(node.children) ? node.children : [])}</Fragment>
			return (
				<Link key={index} href={href} target="_blank" rel="noopener noreferrer" className="text-npi-blue underline">
					{renderLeaves(Array.isArray(node.children) ? node.children : [])}
				</Link>
			)
		}
		// Richer bodies than the web-builder Text block (e.g. EduRevue article imports) can carry
		// element nodes — list items, headings, … — which have `children` instead of a `text` leaf.
		// Recurse into them so their text still renders (flattened) rather than crashing on
		// `leaf.text.split`. Proper list/heading formatting is a separate enhancement.
		const candidate = node as { text?: unknown; children?: unknown }
		if (typeof candidate.text !== 'string' && Array.isArray(candidate.children)) {
			return <Fragment key={index}>{renderRichInlines(candidate.children as TextBlockRichInline[], references)}</Fragment>
		}
		return <Fragment key={index}>{renderLeaf(node as TextBlockRichLeaf)}</Fragment>
	})
}

// Where a link's row says it goes, `null` when there is no row, no reference map, or the row
// resolved to nothing (a deleted target).
function referenceHref(referenceId: string | undefined, references: RichTextReferences | undefined): string | null {
	if (!referenceId) return null
	return references?.[referenceId]?.href ?? null
}

function renderLeaves(leaves: TextBlockRichLeaf[]): ReactNode {
	return leaves.map((leaf, index) => <Fragment key={index}>{renderLeaf(leaf)}</Fragment>)
}

function renderLeaf(leaf: TextBlockRichLeaf): ReactNode {
	const segments: ReactNode[] = []
	const parts = (leaf.text ?? '').split('\n')
	parts.forEach((part, index) => {
		if (index > 0) segments.push(<br key={`br-${index}`} />)
		if (part.length > 0) segments.push(part)
	})
	let content: ReactNode = <>{segments}</>
	if (leaf.isBold) content = <strong>{content}</strong>
	if (leaf.isItalic) content = <em>{content}</em>
	if (leaf.isUnderlined) content = <u>{content}</u>
	return content
}
