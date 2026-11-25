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

describe('NavigationMenuBrand kicker', () => {
	const withKicker = renderToStaticMarkup(<NavigationMenuBrand logoSrc="/logo.svg" title="Rámcové vzdělávací programy" kicker="Národní pedagogický institut ČR" href="/" />)

	test('puts the kicker above the site name, next to the logo', () => {
		expect(withKicker.indexOf('Národní pedagogický institut ČR')).toBeLessThan(withKicker.indexOf('Rámcové vzdělávací programy'))
		expect(withKicker).toContain('gap-npi-4')
		expect(withKicker).not.toContain('npi-desktop:gap-npi-8')
	})

	test('a site without one keeps the single name at the usual distance', () => {
		const plain = brand('prohlednout')
		expect(plain).toContain('gap-npi-6')
		expect(plain).toContain('npi-desktop:gap-npi-8')
	})

	test('needs a title: a logo alone shows no kicker', () => {
		expect(renderToStaticMarkup(<NavigationMenuBrand logoSrc="/logo.svg" kicker="Národní pedagogický institut ČR" logoAlt="NPI" href="/" />))
			.not.toContain('Národní pedagogický institut ČR')
	})
})
