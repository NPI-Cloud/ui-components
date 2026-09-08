import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { CardOffer } from './CardOffer'

const description = 'Dlouhý popis nabídky, který je natolik dlouhý, že se do čtyř řádků nevejde.'

// Every element that carries the description, with its class list.
const descriptionNodes = (markup: string): string[] =>
	Array.from(markup.matchAll(/<p class="([^"]*)"[^>]*>Dlouhý popis/g)).map(m => m[1] ?? '')

describe('CardOffer description clamp', () => {
	test('clamps to the requested line count', () => {
		for (const lines of [1, 2, 3, 4, 5, 6] as const) {
			const nodes = descriptionNodes(renderToStaticMarkup(<CardOffer title="Nabídka" description={description} clampDescription={lines} />))
			expect(nodes.length).toBeGreaterThan(0)
			for (const cls of nodes) expect(cls.split(/\s+/)).toContain(`line-clamp-${lines}`)
		}
	})

	test('flows at full length when no count is given', () => {
		const nodes = descriptionNodes(renderToStaticMarkup(<CardOffer title="Nabídka" description={description} />))
		expect(nodes.length).toBeGreaterThan(0)
		for (const cls of nodes) expect(cls).not.toContain('line-clamp')
	})

	// `line-clamp-*` works by setting `display: -webkit-box`. A `block` / `hidden` / `contents`
	// utility on the same element wins the cascade and silently drops the ellipsis, so the
	// responsive show/hide has to live on a wrapper.
	test('never puts a display utility on the clamped element', () => {
		const markup = renderToStaticMarkup(<CardOffer title="Nabídka" description={description} clampDescription={4} />)
		for (const cls of descriptionNodes(markup)) {
			expect(cls.split(/\s+/).filter(c => /(^|:)(block|hidden|flex|grid|inline|contents|flow-root|table)$/.test(c))).toEqual([])
		}
	})
})
