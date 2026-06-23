'use client'

import { useCallback, useState } from 'react'

// Standard controlled/uncontrolled state helper. When `controlled` is defined the component is
// controlled and the returned value mirrors the prop; otherwise the hook owns internal state seeded
// from `defaultValue`. The setter always invokes `onChange`, so a controlled parent stays in sync and
// an uncontrolled consumer can still observe changes.
export function useControllableState<T>(
	controlled: T | undefined,
	defaultValue: T,
	onChange?: (value: T) => void,
): [T, (next: T) => void] {
	const isControlled = controlled !== undefined
	const [internal, setInternal] = useState<T>(defaultValue)
	const value = isControlled ? controlled : internal
	const setValue = useCallback(
		(next: T) => {
			if (!isControlled) setInternal(next)
			onChange?.(next)
		},
		[isControlled, onChange],
	)
	return [value, setValue]
}
