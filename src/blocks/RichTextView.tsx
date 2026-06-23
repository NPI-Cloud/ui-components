'use client'

import { Link } from '../components/ui-primitives'
import { Fragment, type ReactNode } from 'react'
import { DownloadButton, type DownloadVariant } from '../components/DownloadButton'
import { Heading, type HeadingLevel } from '../components/Heading'
import { BigNumberBlock } from './BigNumberBlock'
import { ButtonBlock, type ButtonBlockVariant } from './ButtonBlock'
import { CardBlock, type CardBlockAspect, cardBlockAspects } from './CardBlock'
import { MediaBlock, type MediaBlockAspect, mediaBlockAspects } from './MediaBlock'
import { ProfileCardBlock } from './ProfileCardBlock'
import { TestimonialBlock } from './TestimonialBlock'

// Renders the Slate-like rich text stored on `Content.data` (article/post bodies, formatVersion 2).
// This is the SINGLE renderer shared by the admin article preview AND the public website content
// page — they must look identical, so neither side hand-rolls its own. Block types beyond plain
// paragraphs (heading, lists, testimonial, media, card, …) all render here via the design system.

type SlateText = { text: string; isBold?: boolean; isItalic?: boolean; isUnderline?: boolean }
type SlateElement = { type: string; children: SlateNode[]; [attr: string]: unknown }
type SlateNode = SlateText | SlateElement

const asString = (v: unknown): string => (typeof v === 'string' ? v : '')
const BUTTON_VARIANTS = new Set<string>(['primary', 'secondary', 'tertiary', 'tertiarySmall', 'icon'])
const asButtonVariant = (v: unknown): ButtonBlockVariant => (typeof v === 'string' && BUTTON_VARIANTS.has(v) ? (v as ButtonBlockVariant) : 'primary')
const asMediaAspect = (v: unknown): MediaBlockAspect =>
	typeof v === 'string' && (mediaBlockAspects as readonly string[]).includes(v) ? (v as MediaBlockAspect) : '16:9'
const asCardAspect = (v: unknown): CardBlockAspect =>
	typeof v === 'string' && (cardBlockAspects as readonly string[]).includes(v) ? (v as CardBlockAspect) : 'aspect169'

// Inline `{ url, format }[]` on a download node → `DownloadVariant[]`, dropping rows without a URL.
function toDownloadVariants(raw: unknown): DownloadVariant[] {
	if (!Array.isArray(raw)) return []
	const out: DownloadVariant[] = []
	for (const item of raw) {
		if (!item || typeof item !== 'object') continue
		const rec = item as Record<string, unknown>
		const url = asString(rec.url).trim()
		if (!url) continue
		const format = asString(rec.format).trim()
		out.push({ url, format: format || undefined })
	}
	return out
}

/**
 * Resolved block references, keyed by `referenceId`. Reference-backed blocks (e.g. the testimonial
 * avatar) keep their relations out of the JSON, so the renderer needs the resolved values handed in
 * — `Content.references` mapped to `{ url, alt }` for the avatar `Image`.
 */
export type RichTextReferences = Record<string, { url?: string | null; alt?: string | null }>

const isText = (node: SlateNode): node is SlateText => typeof (node as SlateText).text === 'string'

function renderLeaf(leaf: SlateText, key: number): ReactNode {
	let content: ReactNode = (leaf.text ?? '').split('\n').map((part, i) => (
		<Fragment key={i}>
			{i > 0 && <br />}
			{part}
		</Fragment>
	))
	if (leaf.isBold) content = <strong>{content}</strong>
	if (leaf.isItalic) content = <em>{content}</em>
	if (leaf.isUnderline) content = <u>{content}</u>
	return <Fragment key={key}>{content}</Fragment>
}

function renderNode(node: SlateNode, key: number, references: RichTextReferences): ReactNode {
	if (isText(node)) return renderLeaf(node, key)
	const children = node.children.map((child, i) => renderNode(child, i, references))
	switch (node.type) {
		case 'paragraph':
			return <p key={key} className="my-npi-4 leading-relaxed">{children}</p>
		case 'heading': {
			// Body headings are H2–H4; render with the design-system `Heading` (matches the editor and ui-components).
			// Spacing per Figma article rhythm: a heading starts a section — 48px above, 16px down to its body.
			const level = Math.min(Math.max((node.level as number | undefined) ?? 3, 2), 4) as HeadingLevel
			return <Heading key={key} level={level} className="mt-npi-12 mb-npi-4">{children}</Heading>
		}
		case 'unorderedList':
			return <ul key={key} className="list-disc pl-5 my-npi-4 space-y-npi-1">{children}</ul>
		case 'orderedList':
			return <ol key={key} className="list-decimal pl-5 my-npi-4 space-y-npi-1">{children}</ol>
		case 'listItem':
			return <li key={key}>{children}</li>
		case 'anchor': {
			// An anchor with no href would render a dead `#` link, so fall back to plain text.
			const href = node.href as string | undefined
			if (!href) return <Fragment key={key}>{children}</Fragment>
			return (
				<Link key={key} href={href} className="text-npi-blue underline">
					{children}
				</Link>
			)
		}
		case 'calloutBox':
			// "Kam dál"-style tinted box: children are ordinary rich-text blocks, the box only paints
			// the surface — 40px padding, 24px radius per design. First/last child margins are zeroed
			// so the padding alone frames the content (headings carry a 48px section margin).
			return <div key={key} className="rounded-npi-m bg-npi-bg-light p-npi-10 [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
		case 'testimonial': {
			// Text rides inline on the node; the avatar is resolved from the referenced Image.
			const avatar = typeof node.referenceId === 'string' ? references[node.referenceId] : undefined
			return (
				<TestimonialBlock
					key={key}
					quote={typeof node.quote === 'string' ? node.quote : ''}
					authorName={typeof node.authorName === 'string' ? node.authorName : ''}
					authorRole={typeof node.authorRole === 'string' ? node.authorRole : undefined}
					authorAvatarSrc={avatar?.url ?? undefined}
					authorAvatarAlt={avatar?.alt ?? undefined}
					size={node.size === 's' ? 's' : 'm'}
					withQuoteIcon={Boolean(node.withQuoteIcon)}
					boxed={Boolean(node.boxed)}
				/>
			)
		}
		case 'media': {
			// Image rides on the referenced Image; video URL / caption / framing stay inline.
			const img = typeof node.referenceId === 'string' ? references[node.referenceId] : undefined
			return (
				<MediaBlock
					key={key}
					imageUrl={img?.url ?? undefined}
					imageAlt={img?.alt ?? undefined}
					videoUrl={asString(node.videoUrl) || undefined}
					caption={asString(node.caption) || undefined}
					aspect={asMediaAspect(node.aspect)}
					fit={node.fit === 'contain' ? 'contain' : 'cover'}
				/>
			)
		}
		case 'profileCard': {
			const img = typeof node.referenceId === 'string' ? references[node.referenceId] : undefined
			return (
				<ProfileCardBlock
					key={key}
					name={asString(node.name)}
					role={asString(node.role) || undefined}
					avatarSrc={img?.url ?? undefined}
					avatarAlt={img?.alt ?? undefined}
					email={asString(node.email) || undefined}
					phone={asString(node.phone) || undefined}
					size={node.size === 's' ? 's' : 'm'}
					orientation={node.orientation === 'vertical' ? 'vertical' : 'horizontal'}
				/>
			)
		}
		case 'card': {
			const img = typeof node.referenceId === 'string' ? references[node.referenceId] : undefined
			return (
				<CardBlock
					key={key}
					title={asString(node.title)}
					eyebrow={asString(node.eyebrow) || undefined}
					description={asString(node.description) || undefined}
					metaDate={asString(node.metaDate) || undefined}
					metaText={asString(node.metaText) || undefined}
					imageUrl={img?.url ?? undefined}
					imageAlt={img?.alt ?? undefined}
					aspect={asCardAspect(node.aspect)}
					href={asString(node.href) || undefined}
					ctaLabel={asString(node.ctaLabel) || undefined}
					ctaUrl={asString(node.ctaUrl) || undefined}
				/>
			)
		}
		case 'bigNumber':
			return <BigNumberBlock key={key} value={asString(node.value)} label={asString(node.label)} size={node.size === 'm' ? 'm' : 'l'} />
		case 'button':
			return (
				<ButtonBlock
					key={key}
					label={asString(node.label)}
					url={asString(node.url) || undefined}
					variant={asButtonVariant(node.variant)}
					inverted={Boolean(node.inverted)}
				/>
			)
		case 'download': {
			const variants = toDownloadVariants(node.variants)
			if (variants.length === 0) return null
			return <DownloadButton key={key} label={asString(node.label) || 'Stáhnout'} variants={variants} />
		}
		default:
			return <Fragment key={key}>{children}</Fragment>
	}
}

// Embedded media/widget blocks sit at the 48px article rhythm (`npi-12`) from their neighbours.
// Text elements (paragraph / heading / list) carry their own collapsing margins; these don't, so
// the top-level map frames them. The gap collapses with adjacent text margins to the larger value.
const SPACED_BLOCK_TYPES = new Set(['testimonial', 'media', 'profileCard', 'card', 'bigNumber', 'button', 'download', 'calloutBox'])

export function RichTextView({ value, references = {} }: { value: unknown; references?: RichTextReferences }) {
	const parsed: unknown = typeof value === 'string' ? safeJsonParse(value) : value
	if (!parsed || typeof parsed !== 'object') return null
	const children = (parsed as { children?: unknown }).children
	if (!Array.isArray(children)) return null
	return (
		<>
			{(children as SlateNode[]).map((node, i) => {
				const rendered = renderNode(node, i, references)
				if (rendered !== null && !isText(node) && SPACED_BLOCK_TYPES.has(node.type)) {
					return <div key={i} className="my-npi-12">{rendered}</div>
				}
				return rendered
			})}
		</>
	)
}

function safeJsonParse(value: string): unknown {
	try {
		return JSON.parse(value)
	} catch {
		return null
	}
}
