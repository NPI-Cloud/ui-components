import { Fragment, type ReactNode } from 'react'
import { Text, type TextSize } from '../components/Text.js'

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
}

const FALLBACK_PARAGRAPH: TextBlockRichParagraph = {
	type: 'paragraph',
	children: [{ text: 'Textový blok' }],
}

export function TextBlock({ variant, content }: TextBlockProps) {
	const paragraphs = normalizeContent(content)
	return (
		<div className="flex flex-col gap-npi-6">
			{paragraphs.map((paragraph, index) => (
				<Text key={index} variant={variant ?? 'l'}>
					{renderInlines(paragraph.children)}
				</Text>
			))}
		</div>
	)
}

function normalizeContent(content: TextBlockProps['content']): TextBlockRichParagraph[] {
	if (content === null || content === undefined || content === '') return [FALLBACK_PARAGRAPH]
	if (typeof content === 'string') return [{ type: 'paragraph', children: [{ text: content }] }]
	if (typeof content !== 'object' || !Array.isArray(content.children) || content.children.length === 0) return [FALLBACK_PARAGRAPH]
	if (isEffectivelyEmpty(content)) return [FALLBACK_PARAGRAPH]
	return content.children
}

function isEffectivelyEmpty(content: TextBlockRichContent): boolean {
	for (const paragraph of content.children) {
		for (const node of paragraph.children) {
			if ('type' in node) {
				if (node.children.some(leaf => leaf.text.length > 0)) return false
			} else if (node.text.length > 0) {
				return false
			}
		}
	}
	return true
}

function renderInlines(children: TextBlockRichInline[]): ReactNode {
	return children.map((node, index) => {
		if ('type' in node && node.type === 'anchor') {
			return (
				<a key={index} href={node.href} className="text-npi-blue underline">
					{renderLeaves(node.children)}
				</a>
			)
		}
		const leaf = node as TextBlockRichLeaf
		return <Fragment key={index}>{renderLeaf(leaf)}</Fragment>
	})
}

function renderLeaves(leaves: TextBlockRichLeaf[]): ReactNode {
	return leaves.map((leaf, index) => <Fragment key={index}>{renderLeaf(leaf)}</Fragment>)
}

function renderLeaf(leaf: TextBlockRichLeaf): ReactNode {
	const segments: ReactNode[] = []
	const parts = leaf.text.split('\n')
	parts.forEach((part, index) => {
		if (index > 0) segments.push(<br key={`br-${index}`} />)
		if (part.length > 0) segments.push(part)
	})
	if (leaf.isBold) return <strong>{segments}</strong>
	return <>{segments}</>
}
