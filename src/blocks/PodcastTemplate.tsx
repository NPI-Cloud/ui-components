'use client'

import { Text } from '../components/Text'
import { Icon, type IconName } from '../icons'
import {
	type ContentTemplateBaseProps,
	ContentTemplateHeader,
	ContentTemplateMeta,
	ContentTemplateShareRow,
	ContentTemplateShell,
} from './ContentTemplateBase'

export type PodcastPlatformIcon = Extract<IconName, 'spotify' | 'applePodcasts' | 'youTube' | 'apple'>

export interface PodcastPlatformLink {
	/** Icon registry name (e.g. `'spotify'`, `'applePodcasts'`, `'youTube'`). */
	iconName: PodcastPlatformIcon
	/** Visible label, e.g. "Spotify" or "Apple Podcasts". */
	label: string
	/** URL for the platform listing. */
	href: string
}

export interface PodcastTemplateProps extends ContentTemplateBaseProps {
	/** Platform listings shown under the metadata. Renders the "Přehrajte si podcast na platformách" row. */
	platforms?: PodcastPlatformLink[]
}

/**
 * Podcast page template — same chrome as `ArticleTemplate` plus a row of platform listings
 * (Spotify, Apple Podcasts, YouTube, …) shown between the metadata and the body.
 */
export function PodcastTemplate(
	{ breadcrumbs, title, coverSlot, author, date, platforms, children, share, belowSlot, className }: PodcastTemplateProps,
) {
	const hasPlatforms = !!platforms && platforms.length > 0
	return (
		<ContentTemplateShell className={className}>
			<ContentTemplateHeader breadcrumbs={breadcrumbs} title={title} coverSlot={coverSlot} />
			{/* Body sits tight under the meta; the platforms row gets its own breathing room below the author/date. */}
			<div className="flex flex-col">
				<ContentTemplateMeta author={author} date={date} />
				{hasPlatforms && (
					<div className="mt-npi-8 flex flex-col gap-npi-4">
						<Text variant="l">Přehrajte si podcast na platformách</Text>
						<div className="flex flex-wrap items-center gap-npi-6">
							{platforms.map(platform => (
								<a
									key={platform.href}
									href={platform.href}
									className="inline-flex items-center gap-npi-2 text-npi-text-link transition-colors hover:text-npi-text-link-hover focus-visible:outline-none focus-visible:shadow-[0_2px_0_0_var(--npi-blue-light)]"
								>
									<Icon name={platform.iconName} size="m" className="size-8" aria-hidden="true" />
									<Text variant="l" weight="bold" className="text-inherit">{platform.label}</Text>
								</a>
							))}
						</div>
					</div>
				)}
				{children}
			</div>
			{share && <ContentTemplateShareRow share={share} />}
			{belowSlot}
		</ContentTemplateShell>
	)
}
