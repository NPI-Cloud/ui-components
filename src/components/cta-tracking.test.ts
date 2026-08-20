import { afterEach, describe, expect, test } from 'bun:test'
import { pushCtaClick, resolveCtaTracking } from './cta-tracking'

describe('resolveCtaTracking', () => {
	test('null input means tracking is off', () => {
		expect(resolveCtaTracking(null, 'Stáhnout', 'download')).toBeNull()
		expect(resolveCtaTracking(undefined, 'Stáhnout', 'download')).toBeNull()
	})

	test('empty overrides fall back to the visible label and the CTA kind', () => {
		expect(resolveCtaTracking({}, 'Stáhnout', 'download')).toEqual({ text: 'Stáhnout', type: 'download' })
		expect(resolveCtaTracking({ type: null, text: null }, 'Tlačítko', 'button')).toEqual({ text: 'Tlačítko', type: 'button' })
	})

	test('authored overrides win over the fallbacks', () => {
		expect(resolveCtaTracking({ type: 'newsletter', text: 'Přihlásit' }, 'Odeslat', 'button')).toEqual({ text: 'Přihlásit', type: 'newsletter' })
	})

	test('whitespace-only overrides count as unset', () => {
		expect(resolveCtaTracking({ type: '  ', text: '  ' }, 'Odeslat', 'button')).toEqual({ text: 'Odeslat', type: 'button' })
	})

	test('a missing label resolves to an empty text rather than crashing', () => {
		expect(resolveCtaTracking({}, null, 'button')).toEqual({ text: '', type: 'button' })
	})
})

describe('pushCtaClick', () => {
	afterEach(() => {
		delete window.dataLayer
	})

	test('pushes the cta_click event to an existing dataLayer', () => {
		const layer: unknown[] = []
		window.dataLayer = layer
		pushCtaClick({ text: 'Stáhnout', type: 'download' })
		expect(layer).toEqual([{ event: 'cta_click', cta: { text: 'Stáhnout', type: 'download' } }])
	})

	test('is a no-op without a dataLayer (no GTM loaded)', () => {
		expect(() => pushCtaClick({ text: 'x', type: 'button' })).not.toThrow()
	})

	test('is a no-op when tracking is off', () => {
		const layer: unknown[] = []
		window.dataLayer = layer
		pushCtaClick(null)
		expect(layer).toEqual([])
	})
})
