import { describe, expect, test } from 'bun:test'
import type { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { AccordionItemBlock } from './AccordionBlock'
import type { RichTextReferences } from './RichTextView'
import { TextBlock, type TextBlockRichContent } from './TextBlock'

// The web-builder's text renderer (its own, separate from `RichTextView`) resolves a link through
// the `ContentReference` row its node names: where the link goes now, and for a link to a library
// file that file's first format. The node's own `href` is the address stored when it was authored —
// what a link with no row, or a row that resolved to nothing, falls back to.

const linkedBody: TextBlockRichContent = {
	formatVersion: 2,
	children: [{
		type: 'paragraph',
		children: [
			{ text: 'Viz ' },
			{ type: 'anchor', href: '/stary', referenceId: 'ref-anchor', children: [{ text: 'stránku' }] },
			{ text: ' a ' },
			{ type: 'fileAnchor', href: 'https://files.test/stary.pdf', referenceId: 'ref-file', children: [{ text: 'dokument' }] },
		],
	}],
}

const references: RichTextReferences = {
	'ref-anchor': { href: '/o-nas' },
	'ref-file': { downloadVariants: [{ url: 'https://files.test/metodika.pdf', fileName: 'metodika.pdf', fileType: 'application/pdf' }] },
}

const render = (node: ReactElement): string => renderToStaticMarkup(node)

describe('TextBlock links', () => {
	test('resolves both kinds of link through their rows', () => {
		const html = render(<TextBlock content={linkedBody} references={references} />)
		expect(html).toContain('href="/o-nas"')
		expect(html).toContain('href="https://files.test/metodika.pdf"')
		// A file lives cross-origin and opens in a new tab, like every other download on the site.
		expect(html).toContain('target="_blank"')
		expect(html).toContain('rel="noopener noreferrer"')
		expect(html).not.toContain('/stary')
	})

	test('falls back to the stored address when the rows resolve to nothing (a deleted file, a link with no row)', () => {
		const html = render(<TextBlock content={linkedBody} references={{ 'ref-anchor': {}, 'ref-file': {} }} />)
		expect(html).toContain('href="/stary"')
		expect(html).toContain('href="https://files.test/stary.pdf"')
	})

	test('a link authored before rows existed keeps working untouched', () => {
		const legacy: TextBlockRichContent = { formatVersion: 2, children: [{ type: 'paragraph', children: [{ type: 'anchor', href: 'https://www.npi.cz/', children: [{ text: 'NPI' }] }] }] }
		const html = render(<TextBlock content={legacy} />)
		expect(html).toContain('href="https://www.npi.cz/"')
	})

	test('a link with neither a row nor an address renders as plain text', () => {
		const orphan: TextBlockRichContent = { formatVersion: 2, children: [{ type: 'paragraph', children: [{ type: 'fileAnchor', href: '', referenceId: 'ref-file', children: [{ text: 'dokument' }] }] }] }
		const html = render(<TextBlock content={orphan} references={{}} />)
		expect(html).toContain('dokument')
		expect(html).not.toContain('<a')
	})
})

describe('AccordionItemBlock links', () => {
	test('an accordion answer resolves its links the same way', () => {
		const html = render(<AccordionItemBlock question="Otázka" content={linkedBody} references={references} defaultOpen />)
		expect(html).toContain('href="/o-nas"')
		expect(html).toContain('href="https://files.test/metodika.pdf"')
	})

	test('without the rows the answer keeps the stored addresses', () => {
		const html = render(<AccordionItemBlock question="Otázka" content={linkedBody} defaultOpen />)
		expect(html).toContain('href="/stary"')
		expect(html).toContain('href="https://files.test/stary.pdf"')
	})
})
