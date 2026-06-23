'use client'

import { Image, Link } from '../components/ui-primitives'
import { clsx } from 'clsx'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Breadcrumbs, type BreadcrumbsItem } from '../components/Breadcrumbs'
import { Text } from '../components/Text'
import { Icon, type IconName } from '../icons'
import { MediaBlock } from './MediaBlock'

export interface ContentTemplateAuthor {
	name: string
	/** Optional avatar URL; rendered as a 48px circle when present. */
	avatarUrl?: string | null
}

export interface ContentTemplateShare {
	/** Canonical URL for the article — used for the default copy-link behavior and for building social share URLs. */
	url: string
	/** Override the "Zkopírovat odkaz" handler. Defaults to `navigator.clipboard.writeText(url)`. */
	onCopy?: () => void
	/** Override the "Vytisknout" handler. Defaults to `window.print()`. */
	onPrint?: () => void
}

export interface ContentTemplateBaseProps {
	/** Breadcrumb trail (typically Home → Section → Subsection). Omit for no breadcrumbs. */
	breadcrumbs?: BreadcrumbsItem[]
	/** Page title — renders as `<h1>` at the level-2 size from the design. */
	title: string
	/** Cover area for the page — typically a `<MediaBlock>`. When omitted, a placeholder is shown. */
	coverSlot?: ReactNode
	/** Optional author. Renders alongside the date when both are present. */
	author?: ContentTemplateAuthor | null
	/** Already-formatted date string (e.g. `"4. 1. 2026"`). Omit to hide the date. */
	date?: string | null
	/** Body slot — the post's block-based content goes here. */
	children?: ReactNode
	/** Share row at the bottom. Pass an object to render the row with that URL; omit to hide it. */
	share?: ContentTemplateShare
	/** Below-share slot — related-content cards etc. The template doesn't impose contents here. */
	belowSlot?: ReactNode
	/** Add classes to the outer wrapper. */
	className?: string
}

/** Top-of-page header: breadcrumbs (optional) + title + cover area. */
export function ContentTemplateHeader(
	{ breadcrumbs, title, coverSlot }: { breadcrumbs?: BreadcrumbsItem[]; title: string; coverSlot?: ReactNode },
) {
	return (
		<header className="flex flex-col gap-npi-10">
			{breadcrumbs && breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
			<h1 className="font-npi-serif text-[2rem] leading-[1.2] font-normal text-npi-text-primary @npi-tablet:text-[2.5rem]">
				{title}
			</h1>
			{coverSlot ?? <MediaBlock />}
		</header>
	)
}

/**
 * Author + bullet + date row. Three valid shapes per the design:
 * 1. date only          (`date` set, `author` null/undefined)
 * 2. author only        (`author` set, `date` null/undefined)
 * 3. both                (both set, joined by a 6×6 dot)
 *
 * Author may include an `avatarUrl` to render a 48px circle to the left of the name.
 */
export function ContentTemplateMeta(
	{ author, date }: { author?: ContentTemplateAuthor | null; date?: string | null },
) {
	const showAuthor = !!author?.name
	const showDate = !!date
	if (!showAuthor && !showDate) return null

	return (
		<div className="flex items-center gap-npi-4">
			{showAuthor && (
				<div className="flex items-center gap-npi-3">
					{author.avatarUrl && <Image src={author.avatarUrl} alt="" className="size-12 shrink-0 rounded-full object-cover" />}
					<Text variant="l">{author.name}</Text>
				</div>
			)}
			{showAuthor && showDate && <ContentTemplateBullet />}
			{showDate && <Text variant="l">{date}</Text>}
		</div>
	)
}

/** 6×6 dot used between metadata fields and in bulleted lists. */
export function ContentTemplateBullet() {
	return <span aria-hidden="true" className="block size-1.5 shrink-0 rounded-full bg-npi-gray-300" />
}

const SOCIAL_SHARES: { iconName: IconName; label: string; url: (articleUrl: string) => string }[] = [
	{ iconName: 'facebook', label: 'Sdílet na Facebooku', url: u => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}` },
	{
		iconName: 'linkedIn',
		label: 'Sdílet na LinkedIn',
		url: u => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
	},
	{ iconName: 'x', label: 'Sdílet na X', url: u => `https://x.com/intent/tweet?url=${encodeURIComponent(u)}` },
]

/** "Sdílet" row — label + 3 social icons + copy-link + print buttons. */
export function ContentTemplateShareRow({ share }: { share: ContentTemplateShare }) {
	const [copied, setCopied] = useState(false)
	const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => () => {
		if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
	}, [])

	const handleCopy = () => {
		if (share.onCopy) {
			share.onCopy()
		} else if (typeof navigator !== 'undefined' && navigator.clipboard) {
			void navigator.clipboard.writeText(share.url)
		}
		setCopied(true)
		if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current)
		copiedTimerRef.current = setTimeout(() => setCopied(false), 2000)
	}

	const handlePrint = share.onPrint ?? (() => {
		if (typeof window !== 'undefined') window.print()
	})

	return (
		<div className="flex flex-wrap items-center gap-x-npi-12 gap-y-npi-4">
			<div className="flex items-center gap-npi-4">
				<Text variant="l">Sdílet</Text>
				{SOCIAL_SHARES.map(({ iconName, label, url }) => (
					<Link
						key={iconName}
						href={url(share.url)}
						target="_blank"
						rel="noreferrer noopener"
						aria-label={label}
						className="inline-flex size-8 items-center justify-center rounded-npi-xxs text-npi-blue transition-colors hover:text-npi-blue-hover focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--npi-blue-light)]"
					>
						<Icon name={iconName} size="m" className="size-8" aria-hidden="true" />
					</Link>
				))}
			</div>
			<button
				type="button"
				onClick={handleCopy}
				aria-live="polite"
				className={clsx(
					'inline-flex items-center gap-npi-2 rounded-npi-xl py-npi-2 font-bold transition-colors focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--npi-blue-light)]',
					copied ? 'text-npi-status-success' : 'text-npi-blue hover:text-npi-blue-hover',
				)}
			>
				<Icon name={copied ? 'check' : 'odkaz'} size="m" className="size-6" aria-hidden="true" />
				<Text variant="l" weight="bold" className="text-inherit">
					{copied ? 'Zkopírováno' : 'Zkopírovat odkaz'}
				</Text>
			</button>
			<button
				type="button"
				onClick={handlePrint}
				className="inline-flex items-center gap-npi-2 rounded-npi-xl py-npi-2 font-bold text-npi-blue transition-colors hover:text-npi-blue-hover focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--npi-blue-light)]"
			>
				<Icon name="tisk" size="m" className="size-6" aria-hidden="true" />
				<Text variant="l" weight="bold" className="text-inherit">Vytisknout</Text>
			</button>
		</div>
	)
}

/**
 * Outer wrapper used by every content template. Sits inside the centered NPI layout
 * (`max-w-npi-layout`, 1064px) and left-aligns the article at 2/3 of that width (~709px).
 * The 1/3 of empty space on the right is intentional — keeps the prose at a comfortable
 * reading measure while staying anchored to the layout grid that the rest of the page uses.
 * Callers don't impose any width themselves; the template owns its place in the layout.
 */
export function ContentTemplateShell({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<div className="mx-auto w-full max-w-npi-layout px-npi-6">
			<article className={clsx('flex w-full max-w-[calc(var(--container-npi-layout)*2/3)] flex-col gap-npi-12 font-npi-sans', className)}>
				{children}
			</article>
		</div>
	)
}
