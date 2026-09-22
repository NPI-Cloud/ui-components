import { describe, expect, test } from 'bun:test'
import { hasNonBreakingSpace, splitNonBreakingRuns } from './non-breaking-runs'

describe('splitNonBreakingRuns', () => {
	test('keeps the words a non-breaking space joins in one run, as plain text', () => {
		expect(splitNonBreakingRuns('Národní pedagogický institut České republiky')).toEqual([
			'Národní pedagogický institut',
			'České republiky',
		])
	})

	test('splits on every ordinary whitespace when no non-breaking space is present', () => {
		expect(splitNonBreakingRuns('Národní pedagogický institut')).toEqual(['Národní', 'pedagogický', 'institut'])
	})

	test('ignores surrounding whitespace and collapses repeated non-breaking spaces', () => {
		expect(splitNonBreakingRuns('  We  Lead   Schools ')).toEqual(['We Lead', 'Schools'])
	})

	test('hasNonBreakingSpace tells the two apart', () => {
		expect(hasNonBreakingSpace('a b')).toBe(true)
		expect(hasNonBreakingSpace('a b')).toBe(false)
	})
})
