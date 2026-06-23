'use client'

import { Link } from '../components/ui-primitives'
import { clsx } from 'clsx'
import { Fragment, type ReactNode } from 'react'
import { Text, type TextSize } from '../components/Text'

type TextBlockVariant = TextSize

export interface TextBlockRichLeaf {
	text: string
	isBold?: boolean
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

export interface TextBlockRichContent {
	formatVersion?: number
	children: TextBlockRichParagraph[]
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
	const paragraphs = normalizeRichContent(content) ?? [FALLBACK_PARAGRAPH]
	return (
		<div className={clsx('flex flex-col gap-npi-6', boxed && 'rounded-npi-m bg-npi-bg-light px-npi-12 py-npi-10')}>
			{paragraphs.map((paragraph, index) => (
				<Text key={index} variant={variant ?? 'l'}>
					{renderRichInlines(paragraph.children)}
				</Text>
			))}
		</div>
	)
}

// Shared by every block that stores Slate rich text on `content.data` (Text, AccordionItem body).
// Returns null for empty/unusable content so each consumer picks its own fallback.
export function normalizeRichContent(content: TextBlockProps['content']): TextBlockRichParagraph[] | null {
	if (content === null || content === undefined || content === '') return null
	if (typeof content === 'string') return [{ type: 'paragraph', children: [{ text: content }] }]
	if (typeof content !== 'object' || !Array.isArray(content.children) || content.children.length === 0) return null
	if (isEffectivelyEmpty(content)) return null
	return content.children
}

function isEffectivelyEmpty(content: TextBlockRichContent): boolean {
	for (const paragraph of content.children) {
		for (const node of paragraph.children) {
			if ('type' in node) {
				if (node.children.some(leaf => (leaf.text ?? '').length > 0)) return false
			} else if ((node.text ?? '').length > 0) {
				return false
			}
		}
	}
	return true
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
	if (leaf.isBold) return <strong>{segments}</strong>
	return <>{segments}</>
}
