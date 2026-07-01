'use client'

import { Link } from '../components/ui-primitives'
import { clsx } from 'clsx'
import { Fragment, type ReactNode } from 'react'
import { Text, type TextSize } from '../components/Text'

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
	children: TextBlockRichLeaf[]
}

export type TextBlockRichInline = TextBlockRichLeaf | TextBlockRichAnchor

export interface TextBlockRichParagraph {
	type: 'paragraph'
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
	/** Wrap in a soft grey rounded box (matches `<Testimonial boxed>`). */
	boxed?: boolean | null
}

const FALLBACK_PARAGRAPH: TextBlockRichParagraph = {
	type: 'paragraph',
	children: [{ text: 'Textový blok' }],
}

export function TextBlock({ variant, content, boxed }: TextBlockProps) {
	const blocks = normalizeRichContent(content) ?? [FALLBACK_PARAGRAPH]
	return (
		<div className={clsx('flex flex-col gap-npi-4', boxed && 'rounded-npi-m bg-npi-bg-light px-npi-12 py-npi-10')}>
			{renderRichBlocks(blocks, (children, key) => (
				<Text key={key} variant={variant ?? 'l'}>
					{renderRichInlines(children)}
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
	return content.children
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

// Renders the top-level rich nodes (paragraphs + bullet/numbered lists). `wrapInlines` frames a run
// of inline content — each caller styles it its own way (the text block wraps it in `<Text
// variant>`, the accordion in a spaced `<p>`) — and it's reused for both paragraph bodies and
// list-item bodies so list text matches body text. Lists render as real `<ul>`/`<ol>`.
export function renderRichBlocks(
	nodes: TextBlockRichBlock[],
	wrapInlines: (children: TextBlockRichInline[], key: number) => ReactNode,
): ReactNode[] {
	return nodes.map((node, index) => {
		if (node.type === 'paragraph') return wrapInlines(node.children, index)
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

export function renderRichInlines(children: TextBlockRichInline[]): ReactNode {
	return children.map((node, index) => {
		if ('type' in node && node.type === 'anchor') {
			return (
				<Link key={index} href={node.href} className="text-npi-blue underline">
					{renderLeaves(node.children)}
				</Link>
			)
		}
		// Richer bodies than the web-builder Text block (e.g. EduRevue article imports) can carry
		// element nodes — list items, headings, … — which have `children` instead of a `text` leaf.
		// Recurse into them so their text still renders (flattened) rather than crashing on
		// `leaf.text.split`. Proper list/heading formatting is a separate enhancement.
		const candidate = node as { text?: unknown; children?: unknown }
		if (typeof candidate.text !== 'string' && Array.isArray(candidate.children)) {
			return <Fragment key={index}>{renderRichInlines(candidate.children as TextBlockRichInline[])}</Fragment>
		}
		return <Fragment key={index}>{renderLeaf(node as TextBlockRichLeaf)}</Fragment>
	})
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
