'use client'

import { Link } from './ui-primitives'
import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Button } from './Button'
import { Heading } from './Heading'
import { Text } from './Text'

export const cardOfferDisplays = ['card', 'row'] as const
export type CardOfferDisplay = (typeof cardOfferDisplays)[number]

export interface CardOfferMetaItem {
	/** Small icon rendered before the text (e.g. `'kalendar'`, `'lokace'`, `'stitek'`, `'profil'`) */
	icon: IconName
	text: string
}

export interface CardOfferAction {
	/** Visible label */
	label: string
	/** Icon rendered before the label (defaults to `'stahnout'`) */
	iconBefore?: IconName
	/** Navigation target — renders the CTA as `<Link>` */
	href?: string
	/** Click handler */
	onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export interface CardOfferProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Small caps category label above the title */
	label?: string
	/** Main heading — Bitter Medium 20px in npi-blue, clamped to 4 lines (Figma: ~100 chars, then …) */
	title: string
	/**
	 * Body text — rendered instead of (or, on wide layouts, alongside) the metadata rows.
	 * Clamped to 4 lines (Figma: ~150 chars, then …).
	 */
	description?: string
	/** Status tag (course availability / fullness). Non-interactive, gray outline per Figma "Tag - statusový". */
	statusTag?: string
	/** Icon + text metadata rows (date, place, price, person, … — Figma caps at ~4 stacked items) */
	meta?: CardOfferMetaItem[]
	/**
	 * Tertiary CTAs. One for the standard listing (e.g. material download); up to three (plus the
	 * status tag) when the card manages an offer inside the user account.
	 */
	actions?: CardOfferAction[]
	/**
	 * Cover visual for the wide (L) layout — e.g. a publication cover or video still. Shown from
	 * @md up in place of the navy rule; narrow cards keep the rule (Figma S has no cover variant).
	 */
	visual?: ReactNode
	/** If provided, the whole card is clickable; CTAs keep their own independent click targets. */
	href?: string
	/** `card` (white surface + shadow, default) or `row` — the "řádkový výpis" list line without card chrome. */
	display?: CardOfferDisplay
}

// Container-query driven layout matching the three Figma sizes:
//  - base (< @md / 448px): "S" — vertical stack, navy rule on top, 24/32px padding
//  - @md (≥ 448px):        "M" — horizontal, rule/visual on the left, metadata in a 240px right column
//  - @4xl (≥ 896px):       "L" — same shape with 40px padding and a 280px metadata column
// `@container` lives on the wrapper because container queries can't self-reference.
const cardChromeClass = 'bg-npi-white rounded-npi-s shadow-npi-m hover:shadow-npi-m-hover transition-shadow '
	+ 'px-npi-6 py-npi-8 @md:p-npi-8 @4xl:p-npi-10'

// Horizontal gaps per Figma: M (≥ @md) 32px, L (≥ @4xl) 40px.
const rootClass = 'group relative flex w-full flex-col gap-npi-8 @md:flex-row @md:gap-npi-8 @4xl:gap-npi-10'

// 4px navy rule. Rendered twice: horizontally at the top of the main column on narrow cards
// (16px above the label, per the Figma S "top" group), vertically as a self-stretching sibling
// column from @md up.
const topRuleClass = 'h-npi-1 w-full shrink-0 bg-npi-blue-dark @md:hidden'
const sideRuleClass = 'hidden w-npi-1 shrink-0 self-stretch bg-npi-blue-dark @md:block'

// Status tag — same shape as Tag size S, but gray and non-interactive (Figma "Tag - statusový").
const statusTagClass = 'inline-flex items-center self-start rounded-npi-xxs border-2 border-npi-gray-400 bg-npi-white '
	+ 'px-[10px] py-npi-1 font-npi-sans text-[0.75rem] leading-[1.3] font-semibold text-npi-gray-700'

// Title scales with the card: H6 (20px medium) at S/M, 28px regular at L — same step as Card.
// The row-list line keeps the 20px title at every width (Figma "řádkový výpis").
const titleClass = 'text-npi-blue line-clamp-4 transition-colors'
const titleCardScaleClass = '@4xl:text-[1.75rem] @4xl:font-normal'
const titleHoverClass = 'group-hover:text-npi-blue-hover'

export const CardOffer = forwardRef<HTMLElement, CardOfferProps>(({
	label,
	title,
	description,
	statusTag,
	meta,
	actions,
	visual,
	href,
	display = 'card',
	className,
	...props
}, ref) => {
	const hasMeta = !!meta && meta.length > 0
	const hasActions = !!actions && actions.length > 0

	const statusTagNode = statusTag ? <span className={statusTagClass}>{statusTag}</span> : null

	const metaRows = hasMeta && (
		<div className="flex w-full flex-col gap-npi-2">
			{meta.map((item, i) => (
				<div key={i} className="flex items-center gap-npi-2">
					<Icon name={item.icon} size="s" className="size-4 shrink-0 text-npi-blue" />
					<Text variant="m" asChild>
						<span>{item.text}</span>
					</Text>
				</div>
			))}
		</div>
	)

	const actionButtons = hasActions && (
		// 10px stack gap per Figma (between the npi-2/npi-3 steps, kept arbitrary).
		<div className="relative z-10 flex flex-col items-start gap-[10px] pt-npi-1">
			{actions.map((action, i) => (
				<Button
					key={i}
					variant="tertiary-s"
					label={action.label}
					iconBefore={action.iconBefore ?? 'stahnout'}
					href={action.href}
					onClick={action.onClick}
				/>
			))}
		</div>
	)

	return (
		<div className="@container w-full">
			<article
				ref={ref}
				className={twMerge(
					clsx(
						rootClass,
						display === 'card' && cardChromeClass,
						href && 'cursor-pointer',
						className,
					),
				)}
				{...props}
			>
				{/* Narrow cards have no cover variant in Figma — they always show the top rule instead. */}
				{visual
					? <div className="hidden shrink-0 self-start @md:block">{visual}</div>
					: <div aria-hidden className={sideRuleClass} />}
				<div className="flex min-w-0 flex-1 flex-col gap-npi-4">
					<div aria-hidden className={topRuleClass} />
					{(label || statusTag) && (
						<div className="flex items-center gap-npi-6">
							{label && <Text variant="label">{label}</Text>}
							{/* From @md up the status tag sits next to the label; on narrow cards it tops the info stack. */}
							{statusTagNode && <span className="hidden @md:contents">{statusTagNode}</span>}
						</div>
					)}
					<Heading level={6} className={clsx(titleClass, display === 'card' && titleCardScaleClass, href && titleHoverClass)}>
						{href
							? (
								<Link
									href={href}
									className='text-inherit no-underline outline-none focus-visible:ring-4 focus-visible:ring-npi-blue-light rounded-npi-xxs before:absolute before:inset-0 before:content-[""]'
								>
									{title}
								</Link>
							)
							: title}
					</Heading>
					{/* From @md up the description always sits in the main column under the title; on narrow
					    cards it instead joins the info stack below (matching the Figma S "Text" variant). */}
					{description && (
						<Text variant="m" className="line-clamp-4 hidden @md:block">
							{description}
						</Text>
					)}
					{/* Without metadata there is no right column — tag, description and CTAs flow under the title. */}
					{!hasMeta && (
						<div className="flex flex-col items-start gap-npi-3">
							{statusTagNode && <span className="@md:hidden">{statusTagNode}</span>}
							{description && <Text variant="m" className="line-clamp-4 @md:hidden">{description}</Text>}
							{actionButtons}
						</div>
					)}
				</div>
				{hasMeta && (
					<div className="flex w-full flex-col items-start gap-npi-3 @md:w-[240px] @md:shrink-0 @4xl:w-[280px]">
						{statusTagNode && <span className="@md:hidden">{statusTagNode}</span>}
						{metaRows}
						{actionButtons}
					</div>
				)}
			</article>
		</div>
	)
})
CardOffer.displayName = 'CardOffer'
