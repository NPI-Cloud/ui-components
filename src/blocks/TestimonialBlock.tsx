import { Testimonial, type TestimonialSize } from '../components/Testimonial'

export type TestimonialBlockSize = 's' | 'm'

export interface TestimonialBlockProps {
	/** The testimonial body — the quote itself. Stored on `testimonialQuote`. */
	quote?: string | null
	/** Author name — stored on shared `heading`. */
	authorName?: string | null
	/** Author role / affiliation — stored on shared `subtitle`. */
	authorRole?: string | null
	/** Avatar URL — from `imageAsset.image.url`. */
	authorAvatarSrc?: string | null
	/** Avatar alt text — from `imageAlt`; falls back to the author name. */
	authorAvatarAlt?: string | null
	/** Size variant — `s` (20px quote, 56px avatar) or `m` (24px quote, 96px avatar). */
	size?: TestimonialBlockSize | null
	/** Show the decorative blue quote-mark glyph in the leading column. */
	withQuoteIcon?: boolean | null
	/** Wrap in a soft grey rounded box (FAFAFA, 24px radius). */
	boxed?: boolean | null
}

const sizeMap: Record<TestimonialBlockSize, TestimonialSize> = { s: 'S', m: 'M' }

export function TestimonialBlock({
	quote,
	authorName,
	authorRole,
	authorAvatarSrc,
	authorAvatarAlt,
	size,
	withQuoteIcon,
	boxed,
}: TestimonialBlockProps) {
	return (
		<Testimonial
			quote={quote || 'Citát doplníte v panelu vpravo.'}
			authorName={authorName || 'Jméno Příjmení'}
			authorRole={authorRole || undefined}
			authorAvatarSrc={authorAvatarSrc || undefined}
			authorAvatarAlt={authorAvatarAlt || undefined}
			size={size ? sizeMap[size] : 'M'}
			withQuoteIcon={withQuoteIcon ?? false}
			boxed={boxed ?? false}
		/>
	)
}
