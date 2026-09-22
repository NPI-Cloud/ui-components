import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { NavigationMenuBrand } from './NavigationMenu'

const brand = (title: string) => renderToStaticMarkup(<NavigationMenuBrand logoSrc="/logo.svg" title={title} href="/" />)

describe('NavigationMenuBrand site name', () => {
	test('renders a name without non-breaking spaces as plain text', () => {
		const markup = brand('Národní pedagogický institut České republiky')
		expect(markup).toContain('>Národní pedagogický institut České republiky</h')
		expect(markup).not.toContain('inline-block')
	})

	// A run is a width-capped inline-block: the line breaks between runs while they fit, and a run
	// wider than the heading wraps inside rather than pushing the name under the mobile toggle.
	test('wraps each non-breaking run in a width-capped inline block', () => {
		const markup = brand('Národní pedagogický institut České republiky')
		expect(markup).toContain(
			'<span class="inline-block max-w-full">Národní pedagogický institut</span> <span class="inline-block max-w-full">České republiky</span>',
		)
		expect(markup).not.toContain(' ')
		expect(markup).not.toContain('&nbsp;')
	})

	test('leaves single words outside any span', () => {
		const markup = brand('We Lead Schools')
		expect(markup).toContain('<span class="inline-block max-w-full">We Lead</span> Schools</h')
	})
})
