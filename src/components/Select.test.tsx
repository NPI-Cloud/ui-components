import { afterEach, describe, expect, test } from 'bun:test'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { Select } from './Select'

afterEach(cleanup)

const longLabel = 'Workshop s velmi dlouhým názvem, který se na jeden řádek seznamu nevejde'

describe('Select option status', () => {
	test('a long label truncates, its status sits outside the truncated part', () => {
		const { getByRole } = render(<Select options={[{ value: 'a', label: longLabel, status: '(obsazeno)', disabled: true }]} />)
		fireEvent.click(getByRole('button'))
		const option = getByRole('option')
		expect(option.textContent).toBe(`${longLabel} (obsazeno)`)
		const truncated = option.querySelector('.truncate')
		expect(truncated?.textContent).toBe(longLabel)
		expect(truncated?.textContent).not.toContain('(obsazeno)')
	})

	test('an option without a status renders as one truncated label', () => {
		const { getByRole } = render(<Select options={[{ value: 'a', label: longLabel }]} />)
		fireEvent.click(getByRole('button'))
		const option = getByRole('option')
		expect(option.querySelectorAll('span').length).toBe(1)
		expect(option.querySelector('.truncate')?.textContent).toBe(longLabel)
	})

	test('the trigger shows the selected option with its status', () => {
		const { getByRole } = render(<Select value="a" options={[{ value: 'a', label: 'Workshop A', status: '(volná místa: 3)' }]} />)
		expect(getByRole('button').textContent).toContain('Workshop A (volná místa: 3)')
	})
})
