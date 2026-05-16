'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'

export const toastTones = ['info', 'success', 'warning', 'error'] as const
export type ToastTone = (typeof toastTones)[number]

export interface ToastProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
	/** Visual + semantic tone — drives color bar, icon, and aria-live politeness */
	tone?: ToastTone
	/** Main message rendered as the toast body */
	title: string
	/** Optional secondary content rendered below the title */
	description?: ReactNode
	/** Slot for an action button rendered next to the close icon */
	action?: ReactNode
	/** When provided, a close button is rendered and this fires on click */
	onDismiss?: () => void
	/** Override the close button aria-label (default: "Zavřít") */
	dismissLabel?: string
}

// Bar colors come straight from the Figma asset SVGs (see the per-tone bar fills).
// Warning uses #F1B53D = `npi-gold` (NOT `npi-status-warning` which is #F3D148).
const toneBarClass: Record<ToastTone, string> = {
	info: 'bg-npi-blue',
	success: 'bg-npi-status-success',
	warning: 'bg-npi-gold',
	error: 'bg-npi-status-error',
}

// Icon foreground per tone — matches the SVG fill colors fetched from Figma assets.
const toneIconClass: Record<ToastTone, string> = {
	info: 'text-npi-blue',
	success: 'text-npi-status-success',
	warning: 'text-npi-gold',
	error: 'text-npi-status-error',
}

const toneIconName: Record<ToastTone, IconName> = {
	info: 'info',
	success: 'check',
	warning: 'upozorneni',
	error: 'upozorneni',
}

// Polite for low-priority info/success, assertive for warning/error so AT interrupts the user.
const toneAriaLive: Record<ToastTone, 'polite' | 'assertive'> = {
	info: 'polite',
	success: 'polite',
	warning: 'assertive',
	error: 'assertive',
}

// `role="status"` for non-urgent (paired with aria-live=polite); `role="alert"` for urgent.
const toneRole: Record<ToastTone, 'status' | 'alert'> = {
	info: 'status',
	success: 'status',
	warning: 'alert',
	error: 'alert',
}

// Outer shell: 4px radius (`npi-xxs`), drop-shadow with the exact #E0E0E0 colour from Figma
// (= `npi-gray-200`). This shadow has different blur (25px) than `shadow-npi-m` (45px), so we
// use an arbitrary drop-shadow that matches the design 1:1.
const rootClass = 'flex w-full items-stretch rounded-npi-xxs drop-shadow-[0_20px_25px_var(--npi-gray-200)]'

// Left color bar: 4px wide, full height of the inner content row.
const barClass = 'w-npi-1 shrink-0 rounded-l-npi-xxs'

// Inner content — white surface, rounded only on the right edge so it tucks against the bar.
// Padding 16/24 px = `py-npi-4 px-npi-6`. Gap between icon, text, and trailing controls = 16 px.
const contentClass = 'flex flex-1 items-center gap-npi-4 rounded-r-npi-xxs bg-npi-white py-npi-4 px-npi-6'

// Body text — Figma spec is Noto Sans 16/1.5 in `npi-blue-dark`. The `Text` variant `l` uses
// 1.6 line-height, so we hand-author the typography here to match the design exactly.
const textClass = 'min-w-0 flex-1 font-npi-sans text-[1rem] leading-[1.5] font-normal text-npi-text-primary'

const closeButtonClass = 'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center text-npi-blue '
	+ 'outline-none transition-colors hover:text-npi-blue-hover '
	+ 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light'

export const Toast = forwardRef<HTMLDivElement, ToastProps>(({
	tone = 'info',
	title,
	description,
	action,
	onDismiss,
	dismissLabel = 'Zavřít',
	className,
	...props
}, ref) => {
	return (
		<div
			ref={ref}
			role={toneRole[tone]}
			aria-live={toneAriaLive[tone]}
			className={twMerge(clsx(rootClass, className))}
			{...props}
		>
			<span aria-hidden="true" className={clsx(barClass, toneBarClass[tone])} />
			<div className={contentClass}>
				<Icon name={toneIconName[tone]} aria-hidden="true" className={clsx('size-6 shrink-0', toneIconClass[tone])} />
				<div className={textClass}>
					<p>{title}</p>
					{description && <div className="mt-npi-1">{description}</div>}
				</div>
				{action && <div className="shrink-0">{action}</div>}
				{onDismiss && (
					<button type="button" onClick={onDismiss} aria-label={dismissLabel} className={closeButtonClass}>
						<Icon name="zavrit" aria-hidden="true" className="size-6" />
					</button>
				)}
			</div>
		</div>
	)
})
Toast.displayName = 'Toast'
