import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { OrgEmployeesBlock } from './OrgEmployeesBlock'

// The one shape all three staff surfaces share (the block on a page, the org-structure accordion
// and the contact-search results), so the portrait is tested once for all of them.
describe('OrgEmployeesBlock', () => {
	test('renders the uploaded portrait as the avatar', () => {
		const html = renderToStaticMarkup(
			<OrgEmployeesBlock items={[{ name: 'Mgr. Jan Novák', position: 'Metodik', photoUrl: 'https://example.test/jan.jpg' }]} />,
		)
		expect(html).toContain('src="https://example.test/jan.jpg"')
		expect(html).toContain('alt="Mgr. Jan Novák"')
	})

	test('falls back to the initials avatar for a person with no photo', () => {
		const html = renderToStaticMarkup(
			<OrgEmployeesBlock items={[{ name: 'Mgr. Jan Novák', position: 'Metodik', photoUrl: null }]} />,
		)
		expect(html).not.toContain('<img')
		expect(html).toContain('JN')
	})
})
