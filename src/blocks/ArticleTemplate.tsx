'use client'

import {
	type ContentTemplateBaseProps,
	ContentTemplateHeader,
	ContentTemplateMeta,
	ContentTemplateShareRow,
	ContentTemplateShell,
} from './ContentTemplateBase'

export type ArticleTemplateProps = ContentTemplateBaseProps

/**
 * Article (Post) page template — breadcrumbs, title, cover, author + date metadata,
 * the body slot for blocks, an optional share row, and an optional below-slot for
 * related-content cards.
 */
export function ArticleTemplate(
	{ breadcrumbs, title, coverSlot, author, date, children, share, belowSlot, className }: ArticleTemplateProps,
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
