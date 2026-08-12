import { describe, expect, test } from 'bun:test'
import { deriveInitials } from './ProfileCard'

describe('deriveInitials', () => {
	test('takes the first and last word of a plain name', () => {
		expect(deriveInitials('Jan Novák')).toBe('JN')
		expect(deriveInitials('Jana Marie Nováková')).toBe('JN')
	})

	test('ignores prefix titles', () => {
		expect(deriveInitials('Mgr. Jan Novák')).toBe('JN')
		expect(deriveInitials('doc. PhDr. Jan Novák')).toBe('JN')
		expect(deriveInitials('prof. Ing. Jana Nováková')).toBe('JN')
	})

	test('ignores suffix titles after a comma', () => {
		expect(deriveInitials('Jan Novák, Ph.D.')).toBe('JN')
		expect(deriveInitials('Jana Nováková, MBA')).toBe('JN')
	})

	test('ignores prefix and suffix titles at once', () => {
		expect(deriveInitials('Mgr. Jan Novák, Ph.D.')).toBe('JN')
		expect(deriveInitials('doc. Mgr. Jana Marie Nováková, Ph.D., MBA')).toBe('JN')
	})

	test('uses the single letter of a one-word name', () => {
		expect(deriveInitials('Jan')).toBe('J')
		expect(deriveInitials('Mgr. Jan')).toBe('J')
	})

	test('keeps title tokens when the name is nothing but titles', () => {
		expect(deriveInitials('Mgr.')).toBe('M')
	})

	test('returns an empty string for a name with no letters', () => {
		expect(deriveInitials('   ')).toBe('')
		expect(deriveInitials('123')).toBe('')
	})
})
