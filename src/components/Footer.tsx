'use client'

import { clsx } from 'clsx'
import { type AnchorHTMLAttributes, forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Text } from './Text'

export interface FooterShellProps extends HTMLAttributes<HTMLElement> {}

/**
 * Bare footer landmark — a light-gray `<footer>` with the 1064px container,
 * vertical stacking of section children, and 1px dividers between sections.
 *
 * Use this when you need a non-standard layout (e.g., custom signpost columns).
 * For the standard NPI website footer (per-site links + Weby NPI + contact group
 * + logos + bottom legal row), use `<Footer />` with the config props instead.
 */
export const FooterShell = forwardRef<HTMLElement, FooterShellProps>(
	({ className, children, ...props }, ref) => (
		<footer
			ref={ref}
			className={twMerge(clsx('bg-npi-gray-50 font-npi-sans text-npi-text-primary', className))}
			{...props}
		>
			<div className="mx-auto flex w-full max-w-npi-layout flex-col px-npi-6 py-npi-10 npi-tablet:py-npi-20 [&>*+*]:mt-npi-12 [&>*+*]:border-t [&>*+*]:border-npi-gray-200 [&>*+*]:pt-npi-12">
				{children}
			</div>
		</footer>
	),
)
FooterShell.displayName = 'FooterShell'

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
 * Row of partner / funder logos. On mobile the logos sit in a two-column grid so the wide funder
 * lock-ups don't each take a full row; from `npi-tablet` up they flow as a horizontal wrapping row
 * (32px spacing, 48px on desktop).
 */
export const FooterLogos = forwardRef<HTMLDivElement, FooterLogosProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={twMerge(
				clsx(
					// Mobile: 2 columns, 32px column gap / 40px row gap (Figma "Loga" frame).
					'grid grid-cols-2 items-center gap-x-npi-8 gap-y-npi-10',
					'npi-tablet:flex npi-tablet:flex-wrap npi-tablet:gap-npi-8 npi-desktop:gap-npi-12',
					className,
				),
			)}
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

// ─────────────────────────────────────────────────────────────────────────────
// Configured Footer — opinionated NPI website footer.
//
// Encodes the structural specification: 1 or 2 columns of website-headed links,
// a "Weby NPI" column, a Kontakt + Sociální sítě column group, a row of logos,
// and a legal/copyright bottom bar. Pass plain data; the component composes
// `FooterShell` + the primitives below the hood.
//
// Use the primitives (`FooterShell`, `FooterColumns`, `FooterColumn`, …)
// directly when you need a non-standard layout (e.g., extra signpost columns).
// ─────────────────────────────────────────────────────────────────────────────

export interface FooterColumnLinkItem {
	/** Visible text. */
	title: ReactNode
	/** Link target. */
	href: string
	/** Which website-link column the row belongs to (0 = first, 1 = second). Ignored when `linkColumns === 'one'`. */
	column?: 0 | 1
}

export interface FooterNpiSiteItem {
	label: ReactNode
	href: string
}

export interface FooterContactLinkItem {
	/** Free-form text — e.g. "Datová schránka". */
	title: ReactNode
	href: string
}

export interface FooterContact {
	/** Free-form rows (no icon) shown above email/phone/address. */
	links?: FooterContactLinkItem[]
	email?: string | null
	phone?: string | null
	/** Multi-line address; rendered with `whitespace-pre-line`. */
	address?: string | null
}

export interface FooterSocialItem {
	icon: IconName
	/** Accessible label — typically the platform name. */
	label: string
	href: string
}

export interface FooterLogoItem {
	src: string
	alt: string
	/** Optional click target — when omitted, the logo renders as a plain `<img>`. */
	href?: string
}

export interface FooterBottomLinkItem {
	title: ReactNode
	href: string
}

export interface FooterProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/** Heading shown above the per-website link columns — typically the website's name. */
	brandName: ReactNode
	/** Whether per-website links span 1 or 2 columns. Defaults to `'one'`. */
	linkColumns?: 'one' | 'two'
	/** Per-website curated links. With `linkColumns === 'two'` items are split by `column`. */
	links?: FooterColumnLinkItem[]
	/** "Weby NPI" — links to other sites in the NPI network. Hidden when empty. */
	npiSites?: FooterNpiSiteItem[]
	/** Contact column content. */
	contact?: FooterContact
	/** Social-media row, shown next to the contact column. Hidden when empty. */
	socials?: FooterSocialItem[]
	/** Funder / partner logos. */
	logos?: FooterLogoItem[]
	/** Bottom-row legal links (Cookies, GDPR, …). */
	bottomLinks?: FooterBottomLinkItem[]
	/** Right-aligned copyright text on the bottom row. */
	copyright?: ReactNode
}

export const Footer = forwardRef<HTMLElement, FooterProps>((props, ref) => {
	const {
		brandName,
		linkColumns = 'one',
		links = [],
		npiSites = [],
		contact,
		socials = [],
		logos = [],
		bottomLinks = [],
		copyright,
		...rest
	} = props

	const showTwo = linkColumns === 'two'
	const linksCol0 = links.filter(item => (item.column ?? 0) === 0)
	const linksCol1 = showTwo ? links.filter(item => item.column === 1) : []
	const hasContactRows = !!(contact?.links?.length || contact?.email || contact?.phone || contact?.address)

	return (
		<FooterShell ref={ref} {...rest}>
			<FooterColumns>
				<FooterColumn heading={brandName}>
					{linksCol0.map((item, index) => (
						<FooterLink key={index} href={item.href}>
							{item.title}
						</FooterLink>
					))}
				</FooterColumn>
				{showTwo && (
					<FooterColumn
						heading={
							<span aria-hidden="true" className="invisible">
								{brandName}
							</span>
						}
					>
						{linksCol1.map((item, index) => (
							<FooterLink key={index} href={item.href}>
								{item.title}
							</FooterLink>
						))}
					</FooterColumn>
				)}
				{npiSites.length > 0 && (
					<FooterColumn heading="Weby NPI">
						{npiSites.map((site, index) => (
							<FooterLink key={index} href={site.href}>
								{site.label}
							</FooterLink>
						))}
					</FooterColumn>
				)}
				{(hasContactRows || socials.length > 0) && (
					<FooterColumnGroup>
						{hasContactRows && (
							<FooterColumn heading="Kontakt">
								{contact?.links?.map((item, index) => (
									<FooterLink key={`free-${index}`} href={item.href}>
										{item.title}
									</FooterLink>
								))}
								{contact?.email && (
									<FooterLink icon="dopis" href={`mailto:${contact.email}`}>
										{contact.email}
									</FooterLink>
								)}
								{contact?.phone && (
									<FooterLink icon="telefon" href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
										{contact.phone}
									</FooterLink>
								)}
								{contact?.address && (
									<FooterLink icon="lokace" href="#">
										<span className="whitespace-pre-line">{contact.address}</span>
									</FooterLink>
								)}
							</FooterColumn>
						)}
						{socials.length > 0 && (
							<FooterColumn heading="Sociální sítě">
								<FooterSocials>
									{socials.map((social, index) => <FooterSocial key={index} icon={social.icon} label={social.label} href={social.href} />)}
								</FooterSocials>
							</FooterColumn>
						)}
					</FooterColumnGroup>
				)}
			</FooterColumns>

			{logos.length > 0 && (
				<FooterLogos>
					{logos.map((logo, index) => {
						const img = (
							<img
								key={index}
								src={logo.src}
								alt={logo.alt}
								className="h-npi-14 w-auto object-contain"
							/>
						)
						return logo.href
							? (
								<a key={index} href={logo.href} className="inline-flex">
									{img}
								</a>
							)
							: img
					})}
				</FooterLogos>
			)}

			{(bottomLinks.length > 0 || copyright) && (
				<FooterBottom copyright={copyright}>
					{bottomLinks.map((item, index) => (
						<FooterLink key={index} href={item.href}>
							{item.title}
						</FooterLink>
					))}
				</FooterBottom>
			)}
		</FooterShell>
	)
})
Footer.displayName = 'Footer'
