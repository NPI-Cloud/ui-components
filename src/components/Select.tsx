'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface SelectOption {
	/** Stable identifier written to `value` / `onChange`. */
	value: string
	/** Visible label rendered inside the dropdown and (when selected) inside the trigger. */
	label: ReactNode
	/** Disables the option in the dropdown — it stays visible but can't be picked. */
	disabled?: boolean
}

export const selectVariants = ['outlined', 'borderless'] as const
export type SelectVariant = (typeof selectVariants)[number]

export const selectSizes = ['m', 's'] as const
export type SelectSize = (typeof selectSizes)[number]

export interface SelectProps {
	/** Visual style. `outlined` is the bordered form-field trigger; `borderless` is a bare blue-text + chevron trigger for use outside complex forms (sorting, filtering). */
	variant?: SelectVariant
	/** Trigger size for the `borderless` variant — `m` is 16px bold blue, `s` is 14px regular navy. Ignored for `outlined`. */
	size?: SelectSize
	/** Label rendered above the trigger. */
	label?: ReactNode
	/** Renders a red asterisk after the label (purely visual; pair with `aria-required` if needed for semantics). */
	required?: boolean
	/** Tooltip text exposed via the info icon next to the label. */
	helperText?: string
	/** Error message rendered below the trigger. When set, the trigger gets a red border. */
	error?: ReactNode
	/** Placeholder shown inside an empty trigger (italic, secondary text). */
	placeholder?: string
	/** Available options. */
	options: SelectOption[]
	/** Selected value (single-select). Use the array form when `multiple` is `true`. */
	value?: string | string[]
	/** Selected value when uncontrolled. */
	defaultValue?: string | string[]
	/** Fires whenever the selection changes. Receives a string for single-select, a string array for multi-select. */
	onChange?: (value: string | string[]) => void
	/** When `true`, options render with checkboxes and multiple values can be selected. */
	multiple?: boolean
	/** Visually marks the trigger as disabled and blocks interaction. */
	disabled?: boolean
	/** Native `name` attribute mirrored to a hidden input — useful inside HTML forms. */
	name?: string
	/** Forwarded to the trigger button. */
	id?: string
	/** Extra classes applied to the outer wrapper (label + trigger + error). */
	className?: string
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>((props, ref) => {
	const {
		variant = 'outlined',
		size = 'm',
		label,
		required = false,
		helperText,
		error,
		placeholder = 'Vyberte hodnotu',
		options,
		value: controlledValue,
		defaultValue,
		onChange,
		multiple = false,
		disabled = false,
		name,
		id: idProp,
		className,
	} = props

	const reactId = useId()
	const id = idProp ?? `select-${reactId}`
	const listboxId = `${id}-listbox`

	const isControlled = controlledValue !== undefined
	const [uncontrolledValue, setUncontrolledValue] = useState<string | string[]>(() => {
		if (defaultValue !== undefined) return defaultValue
		return multiple ? [] : ''
	})
	const rawValue = isControlled ? controlledValue : uncontrolledValue
	const selectedValues: string[] = useMemo(() => {
		if (multiple) return Array.isArray(rawValue) ? rawValue : rawValue ? [String(rawValue)] : []
		if (Array.isArray(rawValue)) return rawValue.length > 0 ? [String(rawValue[0])] : []
		return rawValue ? [String(rawValue)] : []
	}, [rawValue, multiple])

	const [open, setOpen] = useState(false)
	const [activeIndex, setActiveIndex] = useState<number>(-1)
	const wrapperRef = useRef<HTMLDivElement | null>(null)
	const triggerRef = useRef<HTMLButtonElement | null>(null)
	const listRef = useRef<HTMLDivElement | null>(null)

	const setRefs = useCallback(
		(node: HTMLButtonElement | null) => {
			triggerRef.current = node
			if (typeof ref === 'function') ref(node)
			else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
		},
		[ref],
	)

	const hasError = error != null && error !== ''
	const enabledOptions = options.filter(o => !o.disabled)
	const firstSelectedIndex = useMemo(() => options.findIndex(o => selectedValues.includes(o.value) && !o.disabled), [options, selectedValues])

	const commit = useCallback(
		(next: string | string[]) => {
			if (!isControlled) setUncontrolledValue(next)
			onChange?.(next)
		},
		[isControlled, onChange],
	)

	const toggleValue = useCallback(
		(optionValue: string) => {
			if (multiple) {
				const current = Array.isArray(rawValue) ? rawValue : []
				const next = current.includes(optionValue) ? current.filter(v => v !== optionValue) : [...current, optionValue]
				commit(next)
			} else {
				commit(optionValue)
				setOpen(false)
				triggerRef.current?.focus()
			}
		},
		[multiple, rawValue, commit],
	)

	// Close on outside click / Escape
	useEffect(() => {
		if (!open) return
		const onDocClick = (event: MouseEvent) => {
			const target = event.target as Node
			if (wrapperRef.current && !wrapperRef.current.contains(target)) {
				setOpen(false)
			}
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false)
				triggerRef.current?.focus()
			}
		}
		// Use the owning document so click-outside/Escape work inside the showcase iframe (the
		// component JS runs in the parent window, but the DOM lives in the iframe).
		const doc = wrapperRef.current?.ownerDocument ?? document
		doc.addEventListener('mousedown', onDocClick)
		doc.addEventListener('keydown', onKey)
		return () => {
			doc.removeEventListener('mousedown', onDocClick)
			doc.removeEventListener('keydown', onKey)
		}
	}, [open])

	// When opening, initialise activeIndex to the first selected (or first enabled) option
	useEffect(() => {
		if (!open) return
		if (firstSelectedIndex >= 0) {
			setActiveIndex(firstSelectedIndex)
			return
		}
		const firstEnabled = options.findIndex(o => !o.disabled)
		setActiveIndex(firstEnabled)
	}, [open, firstSelectedIndex, options])

	const moveActive = useCallback(
		(direction: 1 | -1) => {
			if (enabledOptions.length === 0) return
			setActiveIndex(prev => {
				const start = prev
				const len = options.length
				let next = start
				for (let i = 0; i < len; i++) {
					next = (next + direction + len) % len
					if (!options[next]?.disabled) return next
				}
				return start
			})
		},
		[enabledOptions.length, options],
	)

	const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (disabled) return
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			if (!open) {
				setOpen(true)
			} else if (event.key === 'ArrowDown') {
				moveActive(1)
			} else if (event.key === 'ArrowUp') {
				moveActive(-1)
			} else if (event.key === 'Enter' || event.key === ' ') {
				const candidate = options[activeIndex]
				if (candidate && !candidate.disabled) toggleValue(candidate.value)
			}
		}
	}

	const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			moveActive(1)
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			moveActive(-1)
		} else if (event.key === 'Home') {
			event.preventDefault()
			const first = options.findIndex(o => !o.disabled)
			if (first >= 0) setActiveIndex(first)
		} else if (event.key === 'End') {
			event.preventDefault()
			for (let i = options.length - 1; i >= 0; i--) {
				if (!options[i]?.disabled) {
					setActiveIndex(i)
					break
				}
			}
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			const candidate = options[activeIndex]
			if (candidate && !candidate.disabled) toggleValue(candidate.value)
		} else if (event.key === 'Tab') {
			setOpen(false)
		}
	}

	const triggerLabel: ReactNode = (() => {
		if (selectedValues.length === 0) return null
		const selectedOptions = options.filter(o => selectedValues.includes(o.value))
		if (multiple) {
			if (selectedOptions.length === 1) return selectedOptions[0]?.label
			return `${selectedOptions.length} vybráno`
		}
		return selectedOptions[0]?.label ?? null
	})()

	const showPlaceholder = triggerLabel === null || triggerLabel === undefined || triggerLabel === ''

	const arrowColorClass = disabled ? 'text-npi-gray-700' : 'text-npi-blue'

	return (
		<div
			ref={wrapperRef}
			className={twMerge(clsx('relative flex flex-col gap-npi-2 font-npi-sans', variant === 'borderless' ? 'w-fit' : 'w-full', className))}
		>
			{label && (
				<label
					htmlFor={id}
					className={clsx(
						'flex items-center gap-npi-2 font-npi-sans text-[1rem] leading-[1.5]',
						disabled ? 'text-npi-text-secondary' : 'text-npi-text-primary',
					)}
				>
					<span>
						{label}
						{required && <span className="ml-[0.25em] text-npi-status-error">*</span>}
					</span>
					{helperText && (
						<span
							className="inline-flex shrink-0 cursor-help text-npi-text-primary"
							role="img"
							aria-label={helperText}
							title={helperText}
						>
							<Icon name="info" size="s" className="size-4" />
						</span>
					)}
				</label>
			)}
			<button
				ref={setRefs}
				id={id}
				type="button"
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-controls={listboxId}
				aria-invalid={hasError || undefined}
				onClick={() => !disabled && setOpen(o => !o)}
				onKeyDown={onTriggerKeyDown}
				className={
					variant === 'borderless'
						? clsx(
								'group inline-flex items-center gap-npi-2 text-left transition-colors focus-visible:outline-none',
								disabled ? 'cursor-not-allowed' : 'cursor-pointer',
						  )
						: clsx(
								'group flex h-npi-12 w-full items-center gap-npi-3 rounded-npi-xxs border bg-npi-bg-white px-npi-4 text-left transition-colors',
								'focus-visible:outline-4 focus-visible:outline-npi-blue-light',
								hasError
									? 'border-npi-status-error'
									: disabled
									? 'border-npi-gray-300 bg-npi-gray-50 cursor-not-allowed'
									: 'border-npi-gray-300 hover:border-npi-blue cursor-pointer',
						  )
				}
			>
				{variant === 'borderless' ? (
					<span
						className={clsx(
							'truncate border-b-[3px] border-transparent transition-colors',
							size === 's' ? 'text-[0.875rem] font-normal leading-[1.3]' : 'text-[1rem] font-bold leading-[1.5]',
							disabled
								? 'text-npi-text-secondary'
								: clsx(
										size === 's' ? 'text-npi-text-primary' : open ? 'text-npi-blue-hover' : 'text-npi-blue group-hover:text-npi-blue-hover',
										'group-focus-visible:border-npi-blue-light',
								  ),
						)}
					>
						{showPlaceholder ? placeholder : triggerLabel}
					</span>
				) : (
					<span
						className={clsx(
							'min-w-0 flex-1 truncate text-[1rem] leading-[1.3]',
							showPlaceholder
								? clsx('font-normal italic', disabled ? 'text-npi-text-secondary' : 'text-npi-text-secondary')
								: clsx('font-normal', disabled ? 'text-npi-text-secondary' : 'text-npi-text-primary'),
						)}
					>
						{showPlaceholder ? placeholder : triggerLabel}
					</span>
				)}
				<span
					aria-hidden
					className={clsx(
						'inline-flex shrink-0 items-center justify-center transition-transform',
						variant === 'borderless'
							? disabled
								? 'text-npi-text-secondary'
								: open
								? 'text-npi-blue-hover'
								: 'text-npi-blue group-hover:text-npi-blue-hover'
							: arrowColorClass,
						open && 'rotate-180',
					)}
				>
					<ChevronDown />
				</span>
			</button>
			{name && (
				multiple
					// One hidden input per value, so a native form submit yields repeated `name=…` pairs
					// (standard multi-value form semantics) rather than a single JSON blob to parse.
					? selectedValues.map(v => <input key={v} type="hidden" name={name} value={v} />)
					: <input type="hidden" name={name} value={selectedValues[0] ?? ''} />
			)}
			{open && !disabled && (
				<div
					ref={listRef}
					role="listbox"
					id={listboxId}
					aria-multiselectable={multiple || undefined}
					tabIndex={-1}
					onKeyDown={onListKeyDown}
					className={clsx(
						'absolute top-full z-50 mt-npi-1 flex max-h-80 flex-col overflow-y-auto rounded-npi-xs bg-npi-bg-white py-npi-2 shadow-npi-m',
						variant === 'borderless' ? 'left-0 w-max min-w-full' : 'left-0 right-0',
					)}
				>
					{options.map((option, index) => {
						const selected = selectedValues.includes(option.value)
						const active = index === activeIndex
						return (
							<div
								key={option.value}
								role="option"
								aria-selected={selected}
								aria-disabled={option.disabled || undefined}
								onMouseEnter={() => !option.disabled && setActiveIndex(index)}
								onMouseDown={event => {
									// Prevent the trigger from losing focus before our click handler runs.
									event.preventDefault()
								}}
								onClick={() => !option.disabled && toggleValue(option.value)}
								className={clsx(
									'flex cursor-pointer items-center gap-npi-3 px-npi-4 py-npi-3 text-[1rem] leading-[1.5] text-npi-text-primary transition-colors',
									option.disabled && 'cursor-not-allowed text-npi-text-secondary',
									!option.disabled && active && 'bg-npi-gray-50',
									!option.disabled && active ? 'font-bold' : 'font-normal',
								)}
							>
								{multiple && (
									<span className="relative inline-flex size-6 shrink-0 items-center justify-center">
										<span
											className={clsx(
												'block size-6 rounded-npi-xxs border transition-colors',
												selected ? 'border-npi-blue bg-npi-blue' : 'border-npi-blue bg-npi-bg-white',
											)}
										/>
										{selected && (
											<svg
												aria-hidden
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth={2.5}
												className="pointer-events-none absolute inset-0 size-full text-npi-white"
											>
												<path d="M7 12.5 L10.5 16 L17 8.5" strokeLinecap="round" strokeLinejoin="round" />
											</svg>
										)}
									</span>
								)}
								<span className="min-w-0 flex-1 truncate">{option.label}</span>
							</div>
						)
					})}
				</div>
			)}
			{hasError && (
				<p className="text-right font-npi-sans text-[0.875rem] leading-[1.3] text-npi-status-error">
					{error}
				</p>
			)}
		</div>
	)
})
Select.displayName = 'Select'

const ChevronDown = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className="size-6"
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M4.25687 8.33087C4.62643 7.92044 5.25873 7.88732 5.66915 8.25687L12 13.9574L18.3309 8.25687C18.7413 7.88732 19.3736 7.92044 19.7431 8.33087C20.1127 8.74129 20.0796 9.37359 19.6692 9.74314L12.6692 16.0462C12.2888 16.3887 11.7112 16.3887 11.3309 16.0462L4.33087 9.74314C3.92044 9.37359 3.88732 8.74129 4.25687 8.33087Z"
			fill="currentColor"
		/>
	</svg>
)
