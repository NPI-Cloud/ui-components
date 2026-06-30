'use client'

import { clsx } from 'clsx'
import { type FocusEvent, forwardRef, type InputHTMLAttributes, type PointerEvent, type ReactNode, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	/** Label rendered above the input. */
	label?: ReactNode
	/** Renders a red asterisk after the label (purely visual; pair with the native `required` attribute for semantics). */
	required?: boolean
	/** Tooltip text exposed via the info icon next to the label. */
	helperText?: string
	/** Error message rendered below the input. When set, the input gets a red border. */
	error?: ReactNode
	/** Right-side icon. For `type="password"` the eye toggle is rendered automatically — `iconAfter` is ignored. */
	iconAfter?: IconName
	/** Visually marks the input as disabled and prevents interaction. */
	disabled?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
	const {
		label,
		required = false,
		helperText,
		error,
		iconAfter,
		disabled = false,
		className,
		type = 'text',
		id,
		onFocus,
		onBlur,
		onPointerDown,
		...rest
	} = props

	const isPassword = type === 'password'
	const [revealed, setRevealed] = useState(false)
	const effectiveType = isPassword ? (revealed ? 'text' : 'password') : type

	const hasError = error != null && error !== ''
	const errorId = id ? `${id}-error` : undefined
	const trailingIcon: IconName | undefined = isPassword ? (revealed ? 'schovat' : 'ukazat') : iconAfter

	// Modality tracking: show the 4px focus ring only when focus arrived from the keyboard.
	// Browsers match :focus-visible on text-input clicks (per spec), so we cannot use a CSS-only
	// approach — fall back to a tiny JS-tracked flag. A pointerdown anywhere inside the field
	// (input or trailing button) marks the upcoming focus as mouse/touch-initiated.
	const [keyboardFocus, setKeyboardFocus] = useState(false)
	const pointerInitiatedRef = useRef(false)

	const handleWrapperPointerDown = (event: PointerEvent<HTMLDivElement>) => {
		pointerInitiatedRef.current = true
	}

	const handleInputFocus = (event: FocusEvent<HTMLInputElement>) => {
		setKeyboardFocus(!pointerInitiatedRef.current)
		pointerInitiatedRef.current = false
		onFocus?.(event)
	}

	const handleInputBlur = (event: FocusEvent<HTMLInputElement>) => {
		setKeyboardFocus(false)
		pointerInitiatedRef.current = false
		onBlur?.(event)
	}

	const handleInputPointerDown = (event: PointerEvent<HTMLInputElement>) => {
		pointerInitiatedRef.current = true
		onPointerDown?.(event)
	}

	return (
		<div className={twMerge(clsx('flex w-full flex-col gap-npi-2 font-npi-sans', className))}>
			{label && (
				<label
					className={clsx(
						'flex items-center gap-npi-2 font-npi-sans text-[1rem] leading-[1.5]',
						disabled ? 'text-npi-text-secondary' : 'text-npi-text-primary',
					)}
					htmlFor={id}
				>
					<span>
						{label}
						{required && <span className={clsx('ml-[0.25em]', disabled ? 'text-npi-text-secondary' : 'text-npi-status-error')}>*</span>}
					</span>
					{helperText && (
						<span
							className={clsx(
								'inline-flex shrink-0 cursor-help',
								disabled ? 'text-npi-text-secondary' : 'text-npi-text-primary',
							)}
							role="img"
							aria-label={helperText}
							title={helperText}
						>
							<Icon name="info" size="s" className="size-4" />
						</span>
					)}
				</label>
			)}
			<div
				onPointerDown={handleWrapperPointerDown}
				className={clsx(
					'group relative flex h-npi-12 w-full items-center gap-npi-3 rounded-npi-xxs border bg-npi-bg-white px-npi-4 outline outline-0 outline-npi-blue transition-[outline-width,border-color]',
					// The 4px ring shows ONLY when focus arrived via keyboard (Tab / Shift+Tab) —
					// the Figma "Focus" state. Mouse/touch focus is the "Active" state: no ring,
					// but the border turns npi-blue via focus-within.
					keyboardFocus && 'outline-4',
					hasError
						? 'border-npi-status-error'
						: disabled
						? 'border-npi-gray-300 bg-npi-gray-50'
						: 'border-npi-gray-300 hover:border-npi-text-primary focus-within:border-npi-blue',
				)}
			>
				<input
					ref={ref}
					id={id}
					type={effectiveType}
					disabled={disabled}
					aria-invalid={hasError || undefined}
					aria-describedby={hasError && errorId ? errorId : undefined}
					className={clsx(
						'peer h-full min-w-0 flex-1 bg-transparent font-npi-sans text-[1rem] leading-[1.5] outline-none',
						'placeholder:font-normal placeholder:text-npi-text-secondary',
						'font-bold text-npi-text-primary',
						'disabled:cursor-not-allowed disabled:text-npi-text-secondary',
					)}
					onFocus={handleInputFocus}
					onBlur={handleInputBlur}
					onPointerDown={handleInputPointerDown}
					{...rest}
				/>
				{isPassword
					? (
						<button
							type="button"
							onClick={() => setRevealed(v => !v)}
							disabled={disabled}
							aria-label={revealed ? 'Skrýt heslo' : 'Zobrazit heslo'}
							aria-pressed={revealed}
							className={clsx(
								'inline-flex shrink-0 items-center justify-center rounded-npi-xxs text-npi-blue transition-colors hover:text-npi-blue-hover',
								'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-npi-blue-light',
								'disabled:cursor-not-allowed disabled:text-npi-text-secondary',
							)}
						>
							<Icon name={trailingIcon as IconName} size="m" className="size-6" />
						</button>
					)
					: trailingIcon
					? (
						<span aria-hidden className="inline-flex shrink-0 items-center justify-center text-npi-text-primary">
							<Icon name={trailingIcon} size="m" className="size-6" />
						</span>
					)
					: null}
			</div>
			{hasError && (
				<p
					id={errorId}
					role="alert"
					className="font-npi-sans text-[0.875rem] leading-[1.3] text-right text-npi-status-error"
				>
					{error}
				</p>
			)}
		</div>
	)
})
Input.displayName = 'Input'
