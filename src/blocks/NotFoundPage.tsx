'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Text } from '../components/Text'
import { LeftDecoration, RightDecoration } from './not-found-decorations'

/**
 * Theme variants for the NotFoundPage decorations. Each theme renders its own decoration artwork
 * (see {@link ./not-found-decorations}) — the "Barevnost podle témat" sample panel in the Figma 404 frame.
 */
export const notFoundPageThemes = ['vedeme-skolu', 'zapojme-vsechny', 'digitalizace', 'revize-rvp'] as const
export type NotFoundPageTheme = (typeof notFoundPageThemes)[number]

export interface NotFoundPageProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Headline shown below the decorations (defaults to Czech "Stránka nebyla nalezena"). */
	title?: ReactNode
	/** Supporting paragraph beneath the headline. */
	description?: ReactNode
	/** Action slot — defaults to a single "Přejít na úvodní stránku" primary button linking to `/`. */
	actions?: ReactNode
	/** Decoration theme — selects the per-theme artwork for the left/right clusters. */
	theme?: NotFoundPageTheme
}

/**
 * Full-page 404 / not-found block. Used as the body of error pages.
 *
 * - Centered layout that respects `max-w-npi-layout` (1064px).
 * - Three columns once there's room (≥920px container): left decoration · content · right decoration.
 *   On narrower containers (mobile + tablet) the two decorations collapse into a compact band above the
 *   content, so the flanking layout never gets cramped.
 * - The `theme` prop selects the per-theme decoration artwork.
 */
export const NotFoundPage = forwardRef<HTMLElement, NotFoundPageProps>(
	(
		{
			title = 'Stránka nebyla nalezena',
			description = 'Chyba 404, je nám líto, ale stránka neexistuje.',
			actions,
			theme = 'vedeme-skolu',
			className,
			...rest
		},
		ref,
	) => {
		const renderedActions = actions ?? <Button href="/" label="Přejít na úvodní stránku" />

		return (
			<section
				ref={ref}
				className={twMerge(
					clsx(
						'mx-auto flex w-full max-w-npi-layout flex-col items-center justify-center gap-npi-8 px-npi-4 py-npi-16 @min-[920px]:flex-row @min-[920px]:items-center @min-[920px]:gap-npi-10',
						className,
					),
				)}
				{...rest}
			>
				{/* Mobile: both decorations as one compact, scaled band above the content (the desktop flanking
				    layout doesn't fit a phone, so we group them into an intentional header instead of stacking). */}
				<div className="flex w-full items-center justify-center overflow-hidden @min-[920px]:hidden" aria-hidden="true">
					<div className="flex origin-center scale-[0.6] items-center gap-npi-4">
						<LeftDecoration theme={theme} />
						<RightDecoration theme={theme} />
					</div>
				</div>

				{/* Desktop: left decoration flanks the content. */}
				<div className="hidden shrink-0 @min-[920px]:block @min-[920px]:pt-npi-4">
					<LeftDecoration theme={theme} />
				</div>

				<div className="flex w-full max-w-[512px] flex-col items-center gap-npi-6 text-center">
					<Heading level={1} className="text-center">{title}</Heading>
					<Text variant="l" className="text-center">{description}</Text>
					{renderedActions}
				</div>

				{/* Desktop: right decoration flanks the content. */}
				<div className="hidden shrink-0 @min-[920px]:block">
					<RightDecoration theme={theme} />
				</div>
			</section>
		)
	},
)
NotFoundPage.displayName = 'NotFoundPage'
