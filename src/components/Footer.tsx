import { clsx } from 'clsx'
import { type AnchorHTMLAttributes, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Text } from './Text'

export interface FooterProps extends HTMLAttributes<HTMLElement> {}

/**
 * Page footer. Renders a light-gray landmark with a 1064px content container
 * that stacks its section children (`FooterColumns`, `FooterLogos`, `FooterBottom`)
 * vertically, separating them with a 48px gap and a 1px divider.
 */
export const Footer = forwardRef<HTMLElement, FooterProps>(
	({ className, children, ...props }, ref) => (
		<footer
			ref={ref}
			className={twMerge(clsx('bg-npi-gray-50 font-npi-sans text-npi-text-primary', className))}
			{...props}
		>
			<div className="mx-auto flex w-full max-w-npi-layout flex-col px-npi-6 py-npi-20 [&>*+*]:mt-npi-12 [&>*+*]:border-t [&>*+*]:border-npi-gray-200 [&>*+*]:pt-npi-12">
				{children}
			</div>
		</footer>
	),
)
Footer.displayName = 'Footer'

export interface FooterColumnsProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Responsive row of `FooterColumn`s / `FooterColumnGroup`s. Auto-fits 2–4 tracks
 * on tablet+ (min 220px each, 40px gap); collapses to a single column below.
 */
export const FooterColumns = forwardRef<HTMLDivElement, FooterColumnsProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={twMerge(
				clsx('grid grid-cols-1 gap-npi-10 npi-tablet:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]', className),
			)}
			{...props}
		>
			{children}
		</div>
	),
)
FooterColumns.displayName = 'FooterColumns'

export interface FooterColumnProps extends HTMLAttributes<HTMLDivElement> {
	/** Column heading — rendered as an uppercase Bitter-Bold label (13px, letter-spacing 0.18em). */
	heading: ReactNode
}

/**
 * Single-section labelled column. Stacks its children (usually `FooterLink`s) 16px apart below
 * the heading, with a 24px gap between heading and the first item. Used directly as a top-level
 * track inside `FooterColumns`, or nested inside `FooterColumnGroup` for multi-section tracks.
 */
export const FooterColumn = forwardRef<HTMLDivElement, FooterColumnProps>(
	({ heading, className, children, ...props }, ref) => (
		<div ref={ref} className={twMerge(clsx('flex min-w-0 flex-col gap-npi-6', className))} {...props}>
			<Text asChild variant="label">
				<h3>{heading}</h3>
			</Text>
			<div className="flex flex-col items-start gap-npi-4">{children}</div>
		</div>
	),
)
FooterColumn.displayName = 'FooterColumn'

export interface FooterColumnGroupProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Wraps multiple `FooterColumn`s into a single column track, stacked vertically with 40px
 * between sub-sections. Use for the contact column (Kontakt + Sociální sítě).
 */
export const FooterColumnGroup = forwardRef<HTMLDivElement, FooterColumnGroupProps>(
	({ className, children, ...props }, ref) => (
		<div ref={ref} className={twMerge(clsx('flex min-w-0 flex-col gap-npi-10', className))} {...props}>
			{children}
		</div>
	),
)
FooterColumnGroup.displayName = 'FooterColumnGroup'

export interface FooterLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Optional leading 16×16 icon — used for contact rows (e.g. `dopis` for email, `telefon` for phone, `lokace` for address). */
	icon?: IconName
}

/**
 * Text link styled for the footer — 14px regular Noto Sans in NPI blue,
 * underlines and shifts to `npi-blue-hover` on hover. Optionally prefixed
 * with a 16×16 S-variant icon for contact rows.
 */
export const FooterLink = forwardRef<HTMLAnchorElement, FooterLinkProps>(
	({ icon, className, children, ...props }, ref) => (
		<a
			ref={ref}
			className={twMerge(
				clsx(
					'inline-flex items-center gap-npi-2 self-start rounded-npi-xxs text-[0.875rem] leading-[1.3] text-npi-blue',
					'transition-colors hover:text-npi-blue-hover hover:underline',
					'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light focus-visible:no-underline',
					className,
				),
			)}
			{...props}
		>
			{icon && <Icon name={icon} size="s" className="size-4 shrink-0" aria-hidden="true" />}
			<span>{children}</span>
		</a>
	),
)
FooterLink.displayName = 'FooterLink'

export interface FooterSocialsProps extends HTMLAttributes<HTMLUListElement> {}

/**
 * Horizontal row of social-media icon links. 24×24 icons with 16px spacing on desktop;
 * 40×40 icons with 24px spacing on mobile (per the NPI spec).
 */
export const FooterSocials = forwardRef<HTMLUListElement, FooterSocialsProps>(
	({ className, children, ...props }, ref) => (
		<ul
			role="list"
			ref={ref}
			className={twMerge(clsx('flex flex-wrap items-center gap-npi-6 npi-desktop:gap-npi-4', className))}
			{...props}
		>
			{children}
		</ul>
	),
)
FooterSocials.displayName = 'FooterSocials'

export interface FooterSocialProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	/** Social-platform icon — `facebook`, `instagram`, `linkedIn`, `youTube`, `x`, `spotify`, … */
	icon: IconName
	/** Accessible label — typically the platform name (e.g. `"Facebook"`, `"Instagram NPI"`). */
	label: string
}

/** Icon-only link to an NPI social-media profile. Must be a child of `FooterSocials`. */
export const FooterSocial = forwardRef<HTMLAnchorElement, FooterSocialProps>(
	({ icon, label, className, ...props }, ref) => (
		<li className="flex">
			<a
				ref={ref}
				aria-label={label}
				className={twMerge(
					clsx(
						'inline-flex size-npi-10 items-center justify-center rounded-npi-xxs text-npi-blue npi-desktop:size-npi-6',
						'transition-colors hover:text-npi-blue-hover',
						'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
						className,
					),
				)}
				{...props}
			>
				<Icon name={icon} className="size-full" aria-hidden="true" />
			</a>
		</li>
	),
)
FooterSocial.displayName = 'FooterSocial'

export interface FooterLogosProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Row of partner / funder logos. Children (usually `<img>`) are laid out horizontally
 * with 48px spacing on desktop (32px on mobile), wrapping to multiple rows when needed.
 */
export const FooterLogos = forwardRef<HTMLDivElement, FooterLogosProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={twMerge(clsx('flex flex-wrap items-center gap-npi-8 npi-desktop:gap-npi-12', className))}
			{...props}
		>
			{children}
		</div>
	),
)
FooterLogos.displayName = 'FooterLogos'

export interface FooterBottomProps extends HTMLAttributes<HTMLDivElement> {
	/** Copyright text rendered right-aligned on desktop, below the links on mobile. */
	copyright?: ReactNode
}

/**
 * Legal / service row. Renders its link children horizontally on desktop with the copyright
 * pushed to the right edge; stacks vertically on mobile.
 */
export const FooterBottom = forwardRef<HTMLDivElement, FooterBottomProps>(
	({ copyright, className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={twMerge(
				clsx(
					'flex flex-col gap-npi-4',
					'npi-desktop:flex-row npi-desktop:items-center npi-desktop:justify-between npi-desktop:gap-npi-6',
					className,
				),
			)}
			{...props}
		>
			<div className="flex flex-col gap-npi-4 npi-desktop:flex-row npi-desktop:flex-wrap npi-desktop:gap-npi-10">
				{children}
			</div>
			{copyright && (
				<Text asChild variant="m" className="shrink-0">
					<span>{copyright}</span>
				</Text>
			)}
		</div>
	),
)
FooterBottom.displayName = 'FooterBottom'
