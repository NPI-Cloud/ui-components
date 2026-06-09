'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export const testimonialSizes = ['S', 'M'] as const
export type TestimonialSize = (typeof testimonialSizes)[number]

export interface TestimonialProps extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
	/** The testimonial body — the quote itself. Rendered inside a `<blockquote>`. */
	quote: ReactNode
	/** Full name of the person being quoted. */
	authorName: string
	/** Position / affiliation shown below the name (e.g. "Učitel z OA Jirsíkova"). */
	authorRole?: string
	/** Avatar photo URL. When omitted, no avatar is rendered. */
	authorAvatarSrc?: string
	/** Override accessible label for the avatar (defaults to the author's name). */
	authorAvatarAlt?: string
	/** Size variant — S (20px quote, 56px avatar) or M (24px quote, 96px avatar). Defaults to `M`. */
	size?: TestimonialSize
	/**
	 * Show the decorative blue quote-mark glyph in the leading column.
	 * When set, the quote text is rendered without surrounding curly quotes —
	 * leading/trailing „", "", and " marks are stripped automatically.
	 */
	withQuoteIcon?: boolean
	/**
	 * Wrap the testimonial in a soft grey rounded box (FAFAFA, 24px radius).
	 * Designed for carousel slides where the testimonial sits inside a card.
	 */
	boxed?: boolean
}

// Decorative quote-mark glyph (Figma 368:8274 "uvozovky"). Two filled glyphs side by side
// at 51×40 in `npi-blue` (#3566FC). Inline because it is specific to this component
// and not part of the generic icon registry.
function QuoteMark({ className }: { className?: string }): React.ReactElement {
	return (
		<svg
			aria-hidden
			viewBox="0 0 51 40"
			width="51"
			height="40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M13.96 0.0102875C15.3869 0.100744 16.289 0.0321396 17.7159 0.122592C18.7898 0.190672 19.9409 0.0757305 21.1885 0.54935C21.36 0.614466 21.3548 0.716728 21.3438 0.928256C21.2746 2.25186 21.6155 3.80422 21.5459 5.13626C21.4743 6.50764 21.8026 8.58352 21.7295 9.98197C21.6352 11.7877 21.7895 13.1047 21.9034 14.8892C21.9656 15.8639 21.9659 16.6713 21.9248 17.4761C22.7166 22.5344 23.3912 33.3237 20.8194 35.6802C17.2411 38.9589 10.0085 40.7063 3.25297 39.73C2.58791 39.6339 2.04808 39.4908 1.61332 39.3326C0.52952 38.9379 0.161021 37.664 0.4141 36.5386L0.872108 34.5035C1.111 33.4424 2.15658 32.758 3.2393 32.8618C5.49963 33.0786 8.26875 33.1074 9.10844 32.98C11.6517 32.5943 13.9999 31.3 14.5205 28.2144C14.6894 27.2135 14.5214 24.3039 14.2657 21.7339C12.9822 21.7207 11.7177 21.7146 10.2657 21.6226C7.80694 21.4668 6.4383 21.7928 3.76078 21.7749C2.1657 21.7643 0.173722 21.9871 0.0967172 21.2339C0.012918 20.408 -0.0274156 19.0038 0.0205453 18.0855C0.113113 16.314 0.00651627 15.0825 0.0986703 13.3189C0.207853 11.2294 0.329843 9.31783 0.245155 7.2388C0.163084 5.22383 0.317278 2.59816 0.54203 0.478061C0.581885 0.10213 1.56582 0.154576 2.38285 0.154819C3.49666 0.155171 4.52976 0.255364 5.69047 0.113803C6.43307 0.0232466 8.36759 0.135368 9.10844 0.152866C10.1247 0.176857 10.3991 0.138735 11.3887 0.144077C12.2662 0.148756 13.0682 -0.0462287 13.96 0.0102875Z"
				fill="currentColor"
			/>
			<path
				d="M42.1432 0.0102833C43.5701 0.100738 44.4722 0.0321419 45.8991 0.122588C46.9729 0.190665 48.1242 0.0757773 49.3717 0.549346C49.5432 0.614442 49.538 0.716857 49.527 0.928252C49.4578 2.25179 49.7987 3.80426 49.7291 5.13626C49.6575 6.50758 49.9858 8.58352 49.9127 9.98196C49.8184 11.7879 49.9727 13.1055 50.0866 14.8902C50.1532 15.9344 50.151 16.7862 50.1002 17.649C50.686 22.7432 50.4495 33.1501 47.9079 35.479C44.3295 38.7575 38.1914 40.7063 31.4362 39.73C30.7214 39.6267 30.1514 39.4687 29.7008 39.2964C28.674 38.9035 28.3005 37.7051 28.4879 36.6216L28.7672 35.0074C28.9594 33.8971 30.0326 33.1547 31.152 33.2837C33.499 33.5543 36.429 33.6983 37.2633 33.5718C39.8067 33.1861 42.0553 32.3715 42.5758 29.2857C42.7846 28.0481 41.5707 24.3524 40.8581 21.7105C40.092 21.6972 39.3027 21.6767 38.4489 21.6226C35.9902 21.4668 34.6215 21.7928 31.944 21.7749C30.3488 21.7643 28.3566 21.9873 28.2799 21.2339C28.1961 20.4079 28.1558 19.0038 28.2037 18.0855C28.2963 16.314 28.1897 15.0825 28.2819 13.3189C28.3911 11.2295 28.514 9.31777 28.4293 7.2388C28.3473 5.22379 28.5005 2.59813 28.7252 0.478057C28.7651 0.102126 29.749 0.154571 30.5661 0.154815C31.6799 0.155164 32.713 0.255363 33.8737 0.113799C34.6163 0.0232355 36.5508 0.135364 37.2917 0.152861C38.308 0.176856 38.5823 0.13873 39.5719 0.144072C40.4494 0.14876 41.2514 -0.0462198 42.1432 0.0102833Z"
				fill="currentColor"
			/>
		</svg>
	)
}

// Quote typography per size. Bitter Medium @ leading-1.2 in `npi-blue-dark`.
//   S: 20px (Figma Desktop/H6)
//   M: 24px (Figma Desktop/H5)
const quoteTextClass: Record<TestimonialSize, string> = {
	S: 'font-npi-serif font-medium text-[1.25rem] leading-[1.2] text-npi-blue-dark whitespace-pre-wrap',
	M: 'font-npi-serif font-medium text-[1.5rem] leading-[1.2] text-npi-blue-dark whitespace-pre-wrap',
}

// Author name typography per size (Noto Sans bold, color npi-blue-dark).
//   S: 14/700 leading-1.3 (Figma Text M - bold)
//   M: 16/700 leading-1.5 (Figma Text L - bold)
const authorNameClass: Record<TestimonialSize, string> = {
	S: 'font-npi-sans font-bold text-[0.875rem] leading-[1.3] text-npi-blue-dark',
	M: 'font-npi-sans font-bold text-[1rem] leading-[1.5] text-npi-blue-dark',
}

// Author role typography — both sizes use 12/400 leading-1.3 in npi-blue-dark (Figma Text S).
const authorRoleClass = 'font-npi-sans font-normal text-[0.75rem] leading-[1.3] text-npi-blue-dark'

// Avatar dimensions — 56px (size S) and 96px (size M). 96px is between npi-22 (88) and npi-25 (100)
// so we keep the literal arbitrary value (matches the ProfileCard token-gap convention).
const avatarSizeClass: Record<TestimonialSize, string> = {
	S: 'size-npi-14',
	M: 'size-[96px]',
}

// Author block inter-line gap — 2px for size S and 4px for size M (matches ProfileCard).
// 2px is below the npi spacing scale, so we keep an arbitrary value for parity.
const authorTextGapClass: Record<TestimonialSize, string> = {
	S: 'gap-[2px]',
	M: 'gap-npi-1',
}

export const Testimonial = forwardRef<HTMLElement, TestimonialProps>((props, ref) => {
	const {
		quote,
		authorName,
		authorRole,
		authorAvatarSrc,
		authorAvatarAlt,
		size = 'M',
		withQuoteIcon = false,
		boxed = false,
		className,
		...rest
	} = props

	// Per Figma, the icon variant always renders the profile card at S metrics (avatar 56,
	// name 14/700/1.3, gap 2px) regardless of the `size` prop — only the blockquote
	// typography follows `size`.
	const profileSize: TestimonialSize = withQuoteIcon ? 'S' : size
	const avatarPx = profileSize === 'S' ? 56 : 96

	// Quote-string normalization: with the leading quote-mark glyph (Figma 368:8273 / 368:8271)
	// we render the quote without surrounding curly „...". Strip leading/trailing curly Czech
	// („"), English smart (""), and straight (") quote marks when `withQuoteIcon` is true.
	const displayedQuote = withQuoteIcon && typeof quote === 'string'
		? quote.replace(/^[„“”"]+|[„“”"]+$/g, '').trim()
		: quote

	const inner = (
		<>
			<blockquote className={clsx(quoteTextClass[size], 'm-0')}>
				{displayedQuote}
			</blockquote>
			<figcaption className="flex items-center gap-npi-4">
				{authorAvatarSrc && (
					<img
						src={authorAvatarSrc}
						alt={authorAvatarAlt ?? authorName}
						width={avatarPx}
						height={avatarPx}
						className={clsx('shrink-0 rounded-full object-cover', avatarSizeClass[profileSize])}
					/>
				)}
				<div className={clsx('flex flex-col items-start justify-center', authorTextGapClass[profileSize])}>
					<p className={authorNameClass[profileSize]}>{authorName}</p>
					{authorRole && <p className={authorRoleClass}>{authorRole}</p>}
				</div>
			</figcaption>
		</>
	)

	// Inner column shared between the icon-leading layout and the plain layout.
	// Icon variant: stack the quote-mark above the text on narrow widths (so the text spans the
	// full box) and place it to the left from @md (448px) up — the point below which a side-by-side
	// icon crushes the quote into an unreadably narrow column (e.g. the boxed variant on mobile).
	const column = withQuoteIcon
		? (
			<div className="flex w-full flex-col items-start gap-npi-6 @md:flex-row @md:gap-npi-8">
				<QuoteMark className="size-auto h-[40px] w-[51px] shrink-0 text-npi-blue" />
				<div className="flex w-full min-w-0 flex-col items-start gap-npi-6 @md:w-auto @md:flex-1">
					{inner}
				</div>
			</div>
		)
		: (
			<div className="flex w-full flex-col items-start gap-npi-6">
				{inner}
			</div>
		)

	return (
		<figure
			ref={ref}
			className={twMerge(
				clsx(
					// `@container` makes the icon-variant layout respond to the testimonial's own width.
					'@container m-0 flex w-full',
					// Figma 368:8269 — boxed+icon variant uses 40px symmetric padding; plain boxed uses 48/40.
					// We emit a single padding utility per branch because twMerge cannot resolve arbitrary
					// `px-npi-12` vs `px-npi-10` token classes (last-wins is unreliable across versions).
					boxed
						? (withQuoteIcon
							? 'rounded-npi-m bg-npi-bg-light p-npi-10'
							: 'rounded-npi-m bg-npi-bg-light px-npi-12 py-npi-10')
						: '',
					className,
				),
			)}
			{...rest}
		>
			{column}
		</figure>
	)
})
Testimonial.displayName = 'Testimonial'
