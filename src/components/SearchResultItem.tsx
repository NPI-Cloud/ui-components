import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Badge } from './Badge'
import { Link } from './ui-primitives'

/**
 * A run of result text with optional match emphasis. Callers pass the parsed
 * segments (e.g. split from a search engine's `<mark>` markup) — the component
 * never injects raw HTML.
 */
export interface HighlightSegment {
	text: string
	highlighted?: boolean
}

const renderSegments = (segments: ReadonlyArray<HighlightSegment> | string): ReactNode => {
	if (typeof segments === 'string') return segments
	return segments.map((segment, index) =>
		segment.highlighted
			? <mark key={index} className="bg-npi-blue-lighter text-inherit">{segment.text}</mark>
			: <span key={index}>{segment.text}</span>)
}

export interface SearchResultItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Category chip above the title (e.g. "Aktuality"). Omitted → no chip. */
	badgeLabel?: string | null
	/** Destination of the result title link. */
	href: string
	/** Result title — plain string or highlight segments. */
	title: ReadonlyArray<HighlightSegment> | string
	/** Body snippet under the title — plain string or highlight segments. */
	snippet?: ReadonlyArray<HighlightSegment> | string | null
}

/**
 * One row of the search-results page: category chip, linked title, and a
 * snippet with the matched term emphasised.
 */
export const SearchResultItem = forwardRef<HTMLElement, SearchResultItemProps>(
	({ badgeLabel, href, title, snippet, className, ...props }, ref) => (
		<article ref={ref} className={twMerge('flex flex-col items-start gap-npi-4 font-npi-sans', className)} {...props}>
			{badgeLabel && <Badge tone="informative">{badgeLabel}</Badge>}
			<div className="flex flex-col items-start gap-npi-2">
				<h3 className="font-npi-serif text-[1.25rem] font-medium leading-[1.2]">
					<Link
						href={href}
						className={clsx(
							'text-npi-blue transition-colors hover:text-npi-blue-hover hover:underline',
							'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
						)}
					>
						{renderSegments(title)}
					</Link>
				</h3>
				{snippet && (
					<p className="line-clamp-3 text-[1rem] leading-[1.5] text-npi-text-primary">
						{renderSegments(snippet)}
					</p>
				)}
			</div>
		</article>
	),
)
SearchResultItem.displayName = 'SearchResultItem'
