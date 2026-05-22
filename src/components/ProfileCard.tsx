'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export const profileCardSizes = ['S', 'M'] as const
export type ProfileCardSize = (typeof profileCardSizes)[number]

export const profileCardOrientations = ['horizontal', 'vertical'] as const
export type ProfileCardOrientation = (typeof profileCardOrientations)[number]

export const profileCardSocialPlatforms = ['linkedIn', 'x', 'instagram', 'facebook'] as const
export type ProfileCardSocialPlatform = (typeof profileCardSocialPlatforms)[number]

export interface ProfileCardSocial {
	/** Platform — drives which icon is rendered. */
	platform: ProfileCardSocialPlatform
	/** Destination link for the platform profile. */
	url: string
	/** Optional accessible label override (defaults to the platform name). */
	label?: string
}

export interface ProfileCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
	/** Full name shown as the primary label. */
	name: string
	/** Position / role shown as the subtitle. */
	role?: string
	/** Avatar photo URL — when present takes priority over initials and icon fallback. */
	avatarSrc?: string
	/** Override accessible label for the avatar image (defaults to the person's name). */
	avatarAlt?: string
	/** Initials shown on a blue circle when no photo is provided. Auto-derived from `name` when omitted. */
	initials?: string
	/** Force the silhouette icon fallback even when initials would otherwise render. */
	useIconFallback?: boolean
	/** Email address — rendered as a `mailto:` link in the link color. */
	email?: string
	/** Phone number — rendered as a `tel:` link in the link color. */
	phone?: string
	/** Social profile links — rendered as a row of small icons after the contact details. */
	socials?: ProfileCardSocial[]
	/** Size variant — S (56px avatar) or M (96px avatar). */
	size?: ProfileCardSize
	/** Layout orientation — horizontal (avatar on the left) or vertical (centered, avatar on top). */
	orientation?: ProfileCardOrientation
}

const socialIconMap: Record<ProfileCardSocialPlatform, 'linkedIn' | 'x' | 'instagram' | 'facebook'> = {
	linkedIn: 'linkedIn',
	x: 'x',
	instagram: 'instagram',
	facebook: 'facebook',
}

const socialLabelMap: Record<ProfileCardSocialPlatform, string> = {
	linkedIn: 'LinkedIn',
	x: 'X',
	instagram: 'Instagram',
	facebook: 'Facebook',
}

function deriveInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(part => /\p{L}/u.test(part))
	if (parts.length === 0) return ''
	if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase()
	return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

interface AvatarProps {
	size: ProfileCardSize
	name: string
	avatarSrc?: string
	avatarAlt?: string
	initials?: string
	useIconFallback?: boolean
}

// Avatar sizes match Figma exactly. 56px = npi-14, 96px is between npi-22 (88) and npi-25 (100) — flagged as a token gap.
const avatarSizeClass: Record<ProfileCardSize, string> = {
	S: 'size-npi-14',
	M: 'size-[96px]',
}

// Initials typography per size — Figma 368:7969 (S) uses Noto Sans 16/700 leading-1.5, 368:7967 (M) uses Bitter 24/500 leading-1.2.
const initialsTextClass: Record<ProfileCardSize, string> = {
	S: 'font-npi-sans font-bold text-[1rem] leading-[1.5]',
	M: 'font-npi-serif font-medium text-[1.5rem] leading-[1.2]',
}

// Silhouette icon sizing — Figma renders a 32px-wide silhouette inside the 56px circle (~57%).
const fallbackIconSizeClass: Record<ProfileCardSize, string> = {
	S: 'size-8',
	M: 'size-14',
}

function ProfileAvatar({ size, name, avatarSrc, avatarAlt, initials, useIconFallback }: AvatarProps): React.ReactElement {
	const dim = avatarSizeClass[size]
	if (avatarSrc) {
		return (
			<img
				src={avatarSrc}
				alt={avatarAlt ?? name}
				className={clsx('shrink-0 rounded-full object-cover', dim)}
				width={size === 'S' ? 56 : 96}
				height={size === 'S' ? 56 : 96}
			/>
		)
	}
	// Empty-string falls back to auto-derived initials (Playground sends '' for unset text fields).
	const explicitInitials = initials != null && initials.length > 0 ? initials : null
	const computedInitials = !useIconFallback ? (explicitInitials ?? deriveInitials(name)) : ''
	return (
		<div
			aria-hidden
			className={clsx('relative shrink-0 flex items-center justify-center rounded-full bg-npi-blue text-npi-white', dim)}
		>
			{computedInitials.length > 0
				? <span className={initialsTextClass[size]}>{computedInitials}</span>
				: (
					<Icon
						name="profil"
						className={clsx('text-npi-white', fallbackIconSizeClass[size])}
					/>
				)}
		</div>
	)
}

// Social icons sit at 16px square in Figma (368:7924 etc.) regardless of card size.
const socialIconSize = 'size-4'

interface SocialRowProps {
	socials: ProfileCardSocial[]
	orientation: ProfileCardOrientation
}

function SocialRow({ socials, orientation }: SocialRowProps): React.ReactElement {
	return (
		<div className={clsx('flex items-center gap-npi-2 pt-[2px]', orientation === 'vertical' && 'justify-center')}>
			{socials.map(item => (
				<a
					key={item.platform + item.url}
					href={item.url}
					aria-label={item.label ?? socialLabelMap[item.platform]}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center justify-center text-npi-blue transition-colors hover:text-npi-blue-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light rounded-npi-xxs"
				>
					<Icon name={socialIconMap[item.platform]} size="s" className={socialIconSize} />
				</a>
			))}
		</div>
	)
}

// Name typography — S: Noto Sans 14/700 leading-1.3, M: Noto Sans 16/700 leading-1.5 (Figma vars Text M / L bold).
const nameTextClass: Record<ProfileCardSize, string> = {
	S: 'font-npi-sans font-bold text-[0.875rem] leading-[1.3] text-npi-blue-dark',
	M: 'font-npi-sans font-bold text-[1rem] leading-[1.5] text-npi-blue-dark',
}

// Role typography — both sizes use Noto Sans 12/400 leading-1.3 in P 280 (npi-blue-dark).
const roleTextClass = 'font-npi-sans font-normal text-[0.75rem] leading-[1.3] text-npi-blue-dark'

// Contact link typography — Noto Sans 12/400 leading-1.3 in P 2727 (npi-blue).
const contactLinkClass =
	'font-npi-sans font-normal text-[0.75rem] leading-[1.3] text-npi-blue no-underline transition-colors hover:text-npi-blue-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light rounded-npi-xxs'

// Vertical inter-line gap is 2px for size S and 4px for size M (Figma 368:7919 vs 368:7942) — neither in the npi spacing scale.
const textGapClass: Record<ProfileCardSize, string> = {
	S: 'gap-[2px]',
	M: 'gap-npi-1',
}

export const ProfileCard = forwardRef<HTMLElement, ProfileCardProps>(({
	name,
	role,
	avatarSrc,
	avatarAlt,
	initials,
	useIconFallback = false,
	email,
	phone,
	socials,
	size = 'M',
	orientation = 'horizontal',
	className,
	...props
}, ref) => {
	const isVertical = orientation === 'vertical'
	return (
		<article
			ref={ref}
			className={twMerge(
				clsx(
					'flex w-full',
					isVertical ? 'flex-col items-center text-center' : 'items-start',
					'gap-npi-4',
					className,
				),
			)}
			{...props}
		>
			<ProfileAvatar
				size={size}
				name={name}
				avatarSrc={avatarSrc}
				avatarAlt={avatarAlt}
				initials={initials}
				useIconFallback={useIconFallback}
			/>
			<div
				className={clsx(
					'flex flex-col justify-center',
					textGapClass[size],
					isVertical ? 'items-center' : 'items-start',
				)}
			>
				<p className={nameTextClass[size]}>{name}</p>
				{role && <p className={roleTextClass}>{role}</p>}
				{email && (
					<a href={`mailto:${email}`} className={contactLinkClass}>
						{email}
					</a>
				)}
				{phone && (
					<a href={`tel:${phone.replace(/\s+/g, '')}`} className={contactLinkClass}>
						{phone}
					</a>
				)}
				{socials && socials.length > 0 && <SocialRow socials={socials} orientation={orientation} />}
			</div>
		</article>
	)
})
ProfileCard.displayName = 'ProfileCard'

// ───────────────────────────────────────────────────────────────────────────────
// ContactCard — compact "vizitka" rendered without a photo on a light grey panel.
// Figma 368:8007 — 24px padding, 8px radius, fafafa bg, 4px row gap, 14/700 name + 12/400 lines.
// ───────────────────────────────────────────────────────────────────────────────

export interface ContactCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
	/** Full name shown as the primary label. */
	name: string
	/** Position / affiliation shown below the name. */
	role?: string
	/** Phone number — rendered in the primary text color (no link styling per Figma). */
	phone?: string
	/** Email address — rendered as a `mailto:` link in the link color. */
	email?: string
}

export const ContactCard = forwardRef<HTMLElement, ContactCardProps>(({
	name,
	role,
	phone,
	email,
	className,
	...props
}, ref) => {
	return (
		<article
			ref={ref}
			className={twMerge(
				clsx(
					'flex w-full flex-col gap-npi-1 rounded-npi-xs bg-npi-bg-light p-npi-6',
					className,
				),
			)}
			{...props}
		>
			<p className="font-npi-sans font-bold text-[0.875rem] leading-[1.3] text-npi-blue-dark">
				{name}
			</p>
			{role && (
				<p className="font-npi-sans font-normal text-[0.75rem] leading-[1.3] text-npi-blue-dark">
					{role}
				</p>
			)}
			{phone && (
				<p className="font-npi-sans font-normal text-[0.75rem] leading-[1.3] text-npi-blue-dark">
					{phone}
				</p>
			)}
			{email && (
				<a
					href={`mailto:${email}`}
					className="font-npi-sans font-normal text-[0.75rem] leading-[1.3] text-npi-blue no-underline transition-colors hover:text-npi-blue-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-npi-blue-light rounded-npi-xxs"
				>
					{email}
				</a>
			)}
		</article>
	)
})
ContactCard.displayName = 'ContactCard'
