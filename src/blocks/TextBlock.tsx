import type { ReactNode } from 'react'
import type { TextVariant } from '../types.js'

export interface TextBlockProps {
	textVariant: TextVariant
	content: string
}

interface SlateText {
	text: string
	bold?: boolean
	italic?: boolean
}

interface SlateElement {
	type?: string
	href?: string
	children: (SlateText | SlateElement)[]
}

type SlateNode = SlateText | SlateElement

function isTextNode(node: SlateNode): node is SlateText {
	return 'text' in node
}

function renderSlateLeaf(node: SlateText, key: number): ReactNode {
	let el: ReactNode = node.text
	if (node.bold) el = <strong key={key}>{el}</strong>
	if (node.italic) el = <em key={key}>{el}</em>
	if (!node.bold && !node.italic) return <span key={key}>{el}</span>
	return el
}

function renderSlateNode(node: SlateNode, key: number): ReactNode {
	if (isTextNode(node)) {
		return renderSlateLeaf(node, key)
	}
	const children = node.children.map((child, i) => renderSlateNode(child, i))
	if (node.type === 'anchor' && node.href) {
		return <a key={key} href={node.href} className="text-npi-blue underline">{children}</a>
	}
	return <span key={key}>{children}</span>
}

function renderRichText(content: string): ReactNode[] {
	try {
		const nodes: SlateNode[] = JSON.parse(content)
		if (!Array.isArray(nodes)) return [content]
		return nodes.map((node, i) => {
			if (isTextNode(node)) return renderSlateLeaf(node, i)
			const children = node.children.map((child, j) => renderSlateNode(child, j))
			return <span key={i}>{children}</span>
		})
	} catch {
		return [content]
	}
}

export function TextBlock({ textVariant, content }: TextBlockProps) {
	const rendered = renderRichText(content)

	switch (textVariant) {
		case 'heading':
			return (
				<h2 className="font-npi-sans text-[length:var(--npi-font-size-3xl)] font-bold leading-tight text-npi-gray-900">
					{rendered}
				</h2>
			)
		case 'list':
			return (
				<ul className="font-npi-sans text-[length:var(--npi-font-size-base)] leading-relaxed text-npi-gray-700 list-disc pl-6 space-y-1">
					{rendered.map((node, i) => <li key={i}>{node}</li>)}
				</ul>
			)
		case 'paragraph':
		default:
			return (
				<p className="font-npi-sans text-[length:var(--npi-font-size-base)] leading-relaxed text-npi-gray-700">
					{rendered}
				</p>
			)
	}
}
