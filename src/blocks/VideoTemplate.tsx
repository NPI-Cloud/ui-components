'use client'

import {
	type ContentTemplateBaseProps,
	ContentTemplateHeader,
	ContentTemplateMeta,
	ContentTemplateShareRow,
	ContentTemplateShell,
} from './ContentTemplateBase'

export type VideoTemplateProps = ContentTemplateBaseProps

/**
 * Video page template — same chrome as `ArticleTemplate`. The cover slot is intended to
 * receive a video iframe (YouTube, Vimeo, …); the metadata defaults to date-only when
 * no `author` is set.
 */
export function VideoTemplate(
	{ breadcrumbs, title, coverSlot, author, date, children, share, belowSlot, className }: VideoTemplateProps,
) {
	return (
		<ContentTemplateShell className={className}>
			<ContentTemplateHeader breadcrumbs={breadcrumbs} title={title} coverSlot={coverSlot} />
			{/* Meta + body sit tight together — design has no padding below the author/date row. */}
			<div className="flex flex-col">
				<ContentTemplateMeta author={author} date={date} />
				{children}
			</div>
			{share && <ContentTemplateShareRow share={share} />}
			{belowSlot}
		</ContentTemplateShell>
	)
}
