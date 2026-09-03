import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { RichTextView } from './RichTextView'

// Migrated rvp.cz body shapes: table > tableRow > tableCell(header?) > blocks, plus the
// superscript/subscript leaf marks (plain names — not the `is*` prefix of bindx marks).
const tableDocument = {
	children: [
		{
			type: 'table',
			children: [
				{
					type: 'tableRow',
					children: [
						{ type: 'tableCell', header: true, children: [{ type: 'paragraph', children: [{ text: 'Veličina' }] }] },
						{ type: 'tableCell', header: true, children: [{ type: 'paragraph', children: [{ text: 'Jednotka' }] }] },
					],
				},
				{
					type: 'tableRow',
					children: [
						{ type: 'tableCell', children: [{ type: 'paragraph', children: [{ text: 'Plocha' }] }] },
						{ type: 'tableCell', children: [{ type: 'paragraph', children: [{ text: 'm' }, { text: '2', superscript: true }] }] },
					],
				},
			],
		},
	],
}

describe('RichTextView table rendering', () => {
	test('renders the migrated table as real table markup', () => {
		const html = renderToStaticMarkup(<RichTextView value={tableDocument} />)
		expect(html).toContain('<table')
		expect(html).toContain('<tbody>')
		// Two rows; the header row renders <th>, the body row <td>.
		expect(html.match(/<tr/g)?.length).toBe(2)
		expect(html.match(/<th/g)?.length).toBe(2)
		expect(html.match(/<td/g)?.length).toBe(2)
		expect(html).toContain('Veličina')
		expect(html).toContain('Plocha')
	})

	test('header cells are bold, rows zebra-tinted, no border classes (no-thin-borders rule)', () => {
		const html = renderToStaticMarkup(<RichTextView value={tableDocument} />)
		expect(html).toContain('font-bold')
		expect(html).toContain('odd:bg-npi-bg-light')
		// No 1px outlines or divider strips — `border-collapse` (layout, not a border) is the only
		// border-prefixed utility allowed.
		expect(html).not.toMatch(/[" ]border[" ]/)
		expect(html).not.toMatch(/border-[trblxy][ "-]/)
		expect(html).not.toContain('divide-')
	})

	test('wide tables scroll inside their own wrapper (page never scrolls horizontally)', () => {
		const html = renderToStaticMarkup(<RichTextView value={tableDocument} />)
		expect(html).toContain('overflow-x-auto')
	})

	test('superscript and subscript marks render as <sup>/<sub>, composable with bold', () => {
		const doc = {
			children: [
				{
					type: 'paragraph',
					children: [
						{ text: 'H' },
						{ text: '2', subscript: true },
						{ text: 'O a m' },
						{ text: '2', superscript: true, isBold: true },
					],
				},
			],
		}
		const html = renderToStaticMarkup(<RichTextView value={doc} />)
		expect(html).toContain('<sub>2</sub>')
		expect(html).toContain('<sup><strong>2</strong></sup>')
	})
})

// Editor-authored shape: inline cell text, a header row (`headerScope: 'table'`), a header
// column cell (`headerScope: 'row'`) and column alignment (`justify`).
const editorTableDocument = {
	children: [
		{
			type: 'table',
			children: [
				{
					type: 'tableRow',
					headerScope: 'table',
					children: [
						{ type: 'tableCell', children: [{ text: 'Veličina' }] },
						{ type: 'tableCell', justify: 'center', children: [{ text: 'Jednotka' }] },
					],
				},
				{
					type: 'tableRow',
					children: [
						{ type: 'tableCell', headerScope: 'row', children: [{ text: 'Obsah vody' }] },
						{ type: 'tableCell', justify: 'center', children: [{ text: 'm' }, { text: '2', superscript: true }] },
					],
				},
			],
		},
	],
}

describe('RichTextView editor-authored table', () => {
	test('header row and header column render as <th>, alignment as a text class, inline text as-is', () => {
		const html = renderToStaticMarkup(<RichTextView value={editorTableDocument} />)
		expect(html.match(/<th/g)?.length).toBe(3)
		expect(html.match(/<td/g)?.length).toBe(1)
		expect(html.match(/scope="col"/g)?.length).toBe(2)
		expect(html.match(/scope="row"/g)?.length).toBe(1)
		expect(html.match(/text-center/g)?.length).toBe(2)
		expect(html).toContain('m<sup>2</sup>')
		// A non-breaking space survives as the character itself.
		expect(html).toContain('Obsah vody')
	})
})
