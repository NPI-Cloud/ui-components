'use client'

import { clsx } from 'clsx'
import { type FormEvent, forwardRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import { Button } from './Button'

export interface SearchBarProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'role' | 'method'> {
	/** Accessible label for the input — not visually shown (placeholder handles the visible prompt). */
	label: string
	placeholder?: string
	/** Initial query value (e.g. the current `?q=` on a results page). */
	defaultValue?: string
	/** Query-param name the form submits under. Defaults to `q`. */
	name?: string
	/** Label of the submit button. Defaults to "Hledat". */
	submitLabel?: string
	/** `aria-label` of the clear (×) control. Defaults to "Vymazat". */
	clearLabel?: string
	/**
	 * When set (e.g. `/vyhledavani`), the form submits as a plain GET navigation —
	 * works without any JavaScript. `onSubmit` (when also given) takes precedence.
	 */
	action?: string
	/** Intercepts submit with the current query value instead of the native GET navigation. */
	onSubmit?: (value: string) => void
}

/**
 * Search form of the search-results page: bordered text field with a clear (×)
 * control and a primary submit button. Distinct from `NavigationMenuSearch`
 * (the compact pill inside the navbar) — this is the page-level variant.
 */
export const SearchBar = forwardRef<HTMLFormElement, SearchBarProps>(
	(
		{
			label,
			placeholder,
			defaultValue,
			name = 'q',
			submitLabel = 'Hledat',
			clearLabel = 'Vymazat',
			action,
			onSubmit,
			className,
			...props
		},
		ref,
	) => {
		const [value, setValue] = useState(defaultValue ?? '')

		const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
			if (!onSubmit) return
			event.preventDefault()
			onSubmit(value)
		}

		return (
			<form
				ref={ref}
				role="search"
				method="get"
				action={action}
				onSubmit={handleSubmit}
				className={twMerge('flex w-full items-stretch', className)}
				{...props}
			>
				{/* Input and button form one joined control: only the outer corners are
				    rounded and the input's right border tucks under the button. */}
				<div
					className={clsx(
						'-mr-px flex h-npi-12 min-w-0 flex-1 items-center gap-npi-3 rounded-l-npi-xxs border bg-npi-bg-white px-npi-4 transition-colors',
						// Figma's Fill variant: the border is blue whenever a value is present, not only while focused.
						value !== ''
							? 'border-npi-blue'
							: 'border-npi-gray-300 [&:hover:not(:focus-within)]:border-npi-text-primary focus-within:border-npi-blue',
					)}
				>
					<input
						type="search"
						name={name}
						aria-label={label}
						placeholder={placeholder}
						value={value}
						onChange={event => setValue(event.target.value)}
						className={clsx(
							'peer h-full min-w-0 flex-1 bg-transparent font-npi-sans text-[1rem] leading-[1.5] font-bold text-npi-text-primary outline-none',
							'placeholder:font-normal placeholder:italic placeholder:text-npi-gray-700',
							// The native WebKit clear button would double the custom × below.
							'[&::-webkit-search-cancel-button]:hidden',
						)}
					/>
					{value !== '' && (
						<button
							type="button"
							aria-label={clearLabel}
							onClick={() => setValue('')}
							className={clsx(
								'inline-flex shrink-0 items-center justify-center rounded-npi-xxs text-npi-blue transition-colors hover:text-npi-blue-hover',
								'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-npi-blue-light',
							)}
						>
							<Icon name="zavrit" size="m" className="size-6" aria-hidden="true" />
						</button>
					)}
				</div>
				<Button type="submit" variant="primary" label={submitLabel} className="h-npi-12 w-auto rounded-l-none py-0" />
			</form>
		)
	},
)
SearchBar.displayName = 'SearchBar'
