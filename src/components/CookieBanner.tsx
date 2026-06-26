'use client'

import * as RadixAccordion from '@radix-ui/react-accordion'
import { clsx } from 'clsx'
import { forwardRef, type ReactNode, useId, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'
import { Button } from './Button'
import { Switch } from './Switch'

export const cookieBannerModes = ['banner', 'settings'] as const
export type CookieBannerMode = (typeof cookieBannerModes)[number]

export interface CookieCategory {
	/** Stable identifier used in the `accepted` array */
	id: string
	/** Visible category title (e.g. "Reklamní cookies") */
	label: string
	/** Long description rendered when the category accordion expands */
	description?: ReactNode
	/** Required categories are always on and cannot be toggled (rendered as a disabled, checked switch) */
	required?: boolean
}

export interface CookieBannerProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Controlled view — `banner` is the compact first-visit lišta, `settings` is the detailed preferences panel. When omitted the component manages the view itself (banner → settings on "Přizpůsobit", back on the close icon). */
	mode?: CookieBannerMode
	/** Initial view when uncontrolled (`mode` omitted). Defaults to `banner`. */
	defaultMode?: CookieBannerMode
	/** Card heading. Defaults to `Používáme cookies!` for banner, `Nastavení cookies` for settings. */
	title?: ReactNode
	/** Banner body copy explaining cookie usage. */
	description: ReactNode
	/** Settings-view intro paragraph under the title. Falls back to `description` when omitted. */
	settingsDescription?: ReactNode
	/** "Allow all" CTA — primary action in both modes */
	onAcceptAll?: () => void
	/** "Allow only required / necessary" CTA */
	onAcceptRequired?: () => void
	/** Banner mode only — opens the customize/settings UI (typically swaps to `mode="settings"`) */
	onCustomize?: () => void
	/** Settings mode only — saves the current `accepted` selection */
	onSaveSettings?: () => void
	/** Settings mode only — closes the panel via the X icon in the header */
	onClose?: () => void
	/** Settings mode only — list of cookie categories rendered as a switch + accordion list */
	categories?: CookieCategory[]
	/** Settings mode only — controlled list of accepted category ids */
	accepted?: string[]
	/** Settings mode only — fired when the user toggles a category switch */
	onAcceptedChange?: (accepted: string[]) => void
	/** Settings mode only — extra block under the categories (e.g. contact / "Více informací" copy) */
	footer?: ReactNode
	/** Override the primary "accept all" button label */
	acceptAllLabel?: string
	/** Override the "accept required" button label */
	acceptRequiredLabel?: string
	/** Override the "customize" button label (banner mode) */
	customizeLabel?: string
	/** Override the "save settings" button label (settings mode) */
	saveSettingsLabel?: string
	/** Override the close button aria-label (settings mode) */
	closeLabel?: string
}

// Card chrome — white surface, 16px radius (`npi-s`), drop-shadow `Shadow M` (#F0F0F0, 0 20 45 0).
// `drop-shadow-[...]` lets the shadow follow the rounded corners cleanly.
// Caps at the Figma 800px width and centers itself (`mx-auto`) so it sits in the middle of larger screens;
// full-width below that. Padding steps from 24px (mobile) to 40px (`npi-10`) at the tablet breakpoint.
// 800px isn't on the npi spacing scale (tops out at 200) — arbitrary value is the genuine design width.
const cardClass = 'mx-auto w-full max-w-[800px] bg-npi-white rounded-npi-s p-npi-6 npi-tablet:p-npi-10 drop-shadow-[0px_20px_22.5px_#F0F0F0]'

// Bitter Bold 18px / 1.2 — matches the Mobil/H7 token used for both card titles in Figma.
const cardTitleClass = 'font-npi-serif font-bold text-[1.125rem] leading-[1.2] text-npi-text-primary'

// Body copy — Noto Sans 16px / 1.5 (Text/Text L - regular). Text component uses 1.6 line-height so we
// inline the spec to match Figma exactly.
const bodyClass = 'font-npi-sans text-[1rem] leading-[1.5] text-npi-text-primary'

const dividerClass = 'h-px w-full shrink-0 bg-npi-gray-200'

// Accordion category title — Bitter Medium 20px / 1.2 (Desktop/H6).
const categoryTitleClass = 'flex-1 text-left font-npi-serif font-medium text-[1.25rem] leading-[1.2] text-npi-blue'

function CookieBannerCompact({
	title,
	description,
	onAcceptAll,
	onAcceptRequired,
	onCustomize,
	acceptAllLabel,
	acceptRequiredLabel,
	customizeLabel,
}: Pick<
	CookieBannerProps,
	'title' | 'description' | 'onAcceptAll' | 'onAcceptRequired' | 'onCustomize' | 'acceptAllLabel' | 'acceptRequiredLabel' | 'customizeLabel'
>) {
	return (
		<div className="flex flex-col gap-npi-6 npi-tablet:flex-row npi-tablet:items-start npi-tablet:gap-npi-10">
			<div className="flex min-w-0 flex-1 flex-col gap-npi-3">
				<h2 className={cardTitleClass}>{title ?? 'Používáme cookies!'}</h2>
				<div className={bodyClass}>{description}</div>
			</div>
			{
				/* Action stack — full-width below the copy on mobile, fixed 197px column from the tablet
			    breakpoint up to match Figma's CTA frame. `whitespace-nowrap` keeps "Povolit nezbytné" on one line. */
			}
			<div className="flex w-full shrink-0 flex-col gap-npi-3 npi-tablet:w-[197px]">
				<Button
					label={acceptAllLabel ?? 'Souhlasím'}
					onClick={onAcceptAll}
					className="!w-full whitespace-nowrap"
				/>
				<Button
					variant="secondary"
					label={customizeLabel ?? 'Přizpůsobit'}
					onClick={onCustomize}
					className="!w-full whitespace-nowrap"
				/>
				<Button
					variant="secondary"
					label={acceptRequiredLabel ?? 'Povolit nezbytné'}
					onClick={onAcceptRequired}
					className="!w-full whitespace-nowrap"
				/>
			</div>
		</div>
	)
}

interface CategoryItemProps {
	category: CookieCategory
	value: string
	checked: boolean
	onCheckedChange: (next: boolean) => void
}

function CategoryItem({ category, value, checked, onCheckedChange }: CategoryItemProps) {
	const switchId = useId()
	const isExpandable = Boolean(category.description)

	const trigger = (
		<div className="flex min-h-[72px] items-center gap-npi-6 py-npi-6">
			<div className="flex min-w-0 flex-1 items-center gap-npi-4">
				{/* Switch sits outside the accordion trigger so toggling it does not expand the row */}
				<Switch
					id={switchId}
					checked={checked}
					disabled={category.required}
					onChange={(e) => onCheckedChange(e.currentTarget.checked)}
					onClick={(e) => e.stopPropagation()}
					aria-label={category.label}
				/>
				{isExpandable
					? (
						<RadixAccordion.Trigger asChild>
							<button
								type="button"
								className={clsx(
									categoryTitleClass,
									'cursor-pointer outline-none focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light',
								)}
							>
								{category.label}
							</button>
						</RadixAccordion.Trigger>
					)
					: (
						<label htmlFor={switchId} className={clsx(categoryTitleClass, 'cursor-pointer')}>
							{category.label}
						</label>
					)}
			</div>
			{isExpandable
				? (
					<RadixAccordion.Trigger
						className="group flex size-6 shrink-0 cursor-pointer items-center justify-center text-npi-blue outline-none focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light"
						aria-label={category.label}
					>
						<Icon
							name="arrowDolu"
							className="size-6 transition-transform duration-200 group-data-[state=open]:rotate-180"
							aria-hidden="true"
						/>
					</RadixAccordion.Trigger>
				)
				: <span aria-hidden className="size-6 shrink-0" />}
		</div>
	)

	if (!isExpandable) {
		return (
			<>
				<div className={dividerClass} />
				<div className="w-full">
					<RadixAccordion.Header className="flex">
						{trigger}
					</RadixAccordion.Header>
				</div>
			</>
		)
	}

	return (
		<>
			<div className={dividerClass} />
			<RadixAccordion.Item value={value} className="w-full">
				<RadixAccordion.Header className="flex">
					{trigger}
				</RadixAccordion.Header>
				<RadixAccordion.Content
					className={clsx(
						'overflow-hidden',
						'data-[state=open]:animate-npi-accordion-down',
						'data-[state=closed]:animate-npi-accordion-up',
					)}
				>
					{/* 58px left indent (42px switch + 16px gap) so description aligns under the title text */}
					<div className={clsx(bodyClass, 'pb-npi-6 pl-[58px]')}>
						{category.description}
					</div>
				</RadixAccordion.Content>
			</RadixAccordion.Item>
		</>
	)
}

function CookieBannerSettings({
	title,
	settingsDescription,
	description,
	categories = [],
	accepted = [],
	onAcceptedChange,
	onAcceptAll,
	onAcceptRequired,
	onSaveSettings,
	onClose,
	footer,
	acceptAllLabel,
	acceptRequiredLabel,
	saveSettingsLabel,
	closeLabel,
}: Pick<
	CookieBannerProps,
	| 'title'
	| 'settingsDescription'
	| 'description'
	| 'categories'
	| 'accepted'
	| 'onAcceptedChange'
	| 'onAcceptAll'
	| 'onAcceptRequired'
	| 'onSaveSettings'
	| 'onClose'
	| 'footer'
	| 'acceptAllLabel'
	| 'acceptRequiredLabel'
	| 'saveSettingsLabel'
	| 'closeLabel'
>) {
	const acceptedSet = new Set([
		...accepted,
		// Required categories are always conceptually accepted regardless of `accepted` array
		...categories.filter(c => c.required).map(c => c.id),
	])

	function toggleCategory(id: string, next: boolean) {
		if (!onAcceptedChange) return
		const filtered = accepted.filter(x => x !== id)
		onAcceptedChange(next ? [...filtered, id] : filtered)
	}

	return (
		<div className="flex flex-col gap-npi-10">
			{/* Header row: title + close button. 24px gap; min 24px height (matches the icon) but grows if the title wraps. */}
			<div className="flex min-h-6 items-start gap-npi-6">
				<h2 className={clsx(cardTitleClass, 'flex flex-1 items-center')}>
					{title ?? 'Nastavení cookies'}
				</h2>
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						aria-label={closeLabel ?? 'Zavřít'}
						className="flex size-6 shrink-0 cursor-pointer items-center justify-center text-npi-blue outline-none transition-colors hover:text-npi-blue-hover focus-visible:outline-4 focus-visible:outline-offset-0 focus-visible:outline-npi-blue-light"
					>
						<Icon name="zavritHranate" className="size-6" aria-hidden="true" />
					</button>
				)}
			</div>

			{/* Intro block: bold sub-heading + body. 4px gap matches Figma. */}
			<div className="flex flex-col gap-npi-1">
				<p className={clsx(bodyClass, 'font-bold')}>Použití cookies</p>
				<div className={bodyClass}>{settingsDescription ?? description}</div>
			</div>

			{categories.length > 0 && (
				<RadixAccordion.Root type="single" collapsible className="flex flex-col">
					{categories.map(category => (
						<CategoryItem
							key={category.id}
							category={category}
							value={category.id}
							checked={acceptedSet.has(category.id)}
							onCheckedChange={(next) => toggleCategory(category.id, next)}
						/>
					))}
					<div className={dividerClass} />
				</RadixAccordion.Root>
			)}

			{footer && (
				<div className="flex flex-col gap-npi-1">
					<p className={clsx(bodyClass, 'font-bold')}>Více informací</p>
					<div className={bodyClass}>{footer}</div>
				</div>
			)}

			{/* Footer actions: left group (allow all + allow required) + right (save). On mobile everything stacks
			    full-width; from the tablet breakpoint the left group sits inline and save floats right (justify-between).
			    Buttons are `w-full md:w-auto` by default, so they fill the width when stacked and shrink when inline. */}
			<div className="flex flex-col gap-npi-4 npi-tablet:flex-row npi-tablet:items-center npi-tablet:justify-between">
				<div className="flex flex-col gap-npi-4 npi-tablet:flex-row npi-tablet:items-center">
					<Button label={acceptAllLabel ?? 'Povolit vše'} onClick={onAcceptAll} />
					<Button variant="secondary" label={acceptRequiredLabel ?? 'Povolit nezbytné'} onClick={onAcceptRequired} />
				</div>
				<Button variant="secondary" label={saveSettingsLabel ?? 'Uložit nastavení'} onClick={onSaveSettings} />
			</div>
		</div>
	)
}

export const CookieBanner = forwardRef<HTMLDivElement, CookieBannerProps>(({
	mode: modeProp,
	defaultMode = 'banner',
	title,
	description,
	settingsDescription,
	onAcceptAll,
	onAcceptRequired,
	onCustomize,
	onSaveSettings,
	onClose,
	categories,
	accepted,
	onAcceptedChange,
	footer,
	acceptAllLabel,
	acceptRequiredLabel,
	customizeLabel,
	saveSettingsLabel,
	closeLabel,
	className,
	...props
}, ref) => {
	// Self-managed view when `mode` is not supplied; `mode` overrides for controlled usage.
	const [internalMode, setInternalMode] = useState<CookieBannerMode>(defaultMode)
	const isControlled = modeProp !== undefined
	const mode = isControlled ? modeProp : internalMode

	// "Přizpůsobit" reveals the settings view in-place; the close icon returns to the banner.
	// Consumer callbacks still fire so controlled usage can drive the transition itself.
	const handleCustomize = () => {
		if (!isControlled) setInternalMode('settings')
		onCustomize?.()
	}
	const handleClose = () => {
		if (!isControlled) setInternalMode('banner')
		onClose?.()
	}

	return (
		<div
			ref={ref}
			role="dialog"
			aria-label={typeof title === 'string' ? title : 'Cookies'}
			className={twMerge(clsx(cardClass, 'font-npi-sans', className))}
			{...props}
		>
			{mode === 'banner'
				? (
					<CookieBannerCompact
						title={title}
						description={description}
						onAcceptAll={onAcceptAll}
						onAcceptRequired={onAcceptRequired}
						onCustomize={handleCustomize}
						acceptAllLabel={acceptAllLabel}
						acceptRequiredLabel={acceptRequiredLabel}
						customizeLabel={customizeLabel}
					/>
				)
				: (
					<CookieBannerSettings
						title={title}
						settingsDescription={settingsDescription}
						description={description}
						categories={categories}
						accepted={accepted}
						onAcceptedChange={onAcceptedChange}
						onAcceptAll={onAcceptAll}
						onAcceptRequired={onAcceptRequired}
						onSaveSettings={onSaveSettings}
						onClose={!isControlled || onClose ? handleClose : undefined}
						footer={footer}
						acceptAllLabel={acceptAllLabel}
						acceptRequiredLabel={acceptRequiredLabel}
						saveSettingsLabel={saveSettingsLabel}
						closeLabel={closeLabel}
					/>
				)}
		</div>
	)
})
CookieBanner.displayName = 'CookieBanner'
