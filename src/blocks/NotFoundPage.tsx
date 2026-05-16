'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { Button } from '../components/Button'
import { Heading } from '../components/Heading'
import { Text } from '../components/Text'

/**
 * Theme variants for the NotFoundPage decorations. Each theme keeps the primary
 * blue (`--npi-blue`) and the lighter blue accent (`--npi-blue-light`) but swaps
 * the two secondary-color shapes. Mirrors the "Barevnost podle témat" sample
 * panel in Figma frame 368:8767.
 */
export const notFoundPageThemes = ['vedeme-skolu', 'zapojme-vsechny', 'digitalizace', 'revize-rvp'] as const
export type NotFoundPageTheme = (typeof notFoundPageThemes)[number]

interface ThemeColors {
	/** Small overlapping shape on the left decoration (teal/sky-blue/pink/peach). */
	leftAccent: string
	/** Small triangular shape on the right decoration (navy/green/orange/maroon). */
	rightAccent: string
}

const themeColors: Record<NotFoundPageTheme, ThemeColors> = {
	'vedeme-skolu': { leftAccent: 'var(--npi-teal)', rightAccent: 'var(--npi-text-primary)' },
	'zapojme-vsechny': { leftAccent: 'var(--npi-sky-blue)', rightAccent: 'var(--npi-green)' },
	'digitalizace': { leftAccent: 'var(--npi-pink)', rightAccent: 'var(--npi-orange)' },
	'revize-rvp': { leftAccent: 'var(--npi-peach)', rightAccent: 'var(--npi-maroon)' },
}

export interface NotFoundPageProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Headline shown below the decorations (defaults to Czech "Stránka nebyla nalezena"). */
	title?: ReactNode
	/** Supporting paragraph beneath the headline. */
	description?: ReactNode
	/** Action slot — defaults to a single "Přejít na úvodní stránku" primary button linking to `/`. */
	actions?: ReactNode
	/** Decoration color theme — controls accent colors of the left/right shape clusters. */
	theme?: NotFoundPageTheme
}

/**
 * Left-side decoration cluster — large blue rounded rectangle layered on top of a
 * smaller secondary-colored shape, with a subtle dot grid behind both. The
 * pre-positioned coordinates match the Figma group at node 368:8780–368:8787.
 */
function LeftDecoration({ leftAccent }: { leftAccent: string }) {
	return (
		<svg
			width="157"
			height="211"
			viewBox="0 0 157 211"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className="shrink-0"
		>
			{/* Subtle dot grid */}
			<g fill="var(--npi-blue)" opacity="0.6">
				{Array.from({ length: 6 }).map((_, row) =>
					Array.from({ length: 9 }).map((_, col) => <circle key={`${row}-${col}`} cx={6 + col * 16} cy={70 + row * 18} r="1" />)
				)}
			</g>
			{/* Smaller secondary shape (rotated/flipped accent under the main shape) */}
			<g transform="translate(8 132) rotate(-65)">
				<path
					d="M32.245 0.236c-3.519 0-30.331-1.6-31.18 3.532C0.512 7.118 0.503 23.488 0.503 32.993c0 3.514-0.415 6.91-0.415 10.383 0 3.202-0.626 5.736 1.452 6.444 4.153 1.418 7.362 1.99 11.302 1.99 10.359 0 20.454 0.85 30.842 0.85h14.706h6.74c1.756 0 4.916 0.16 6.608-0.85 0.94-0.561 1.751-7.01 1.751-8.434V24.758c0-5.815 0.415-11.447 0.415-17.186 0-2.693 0.061-4.315-1.83-4.315-2.621-0.224-7.094-1.422-8.476-1.422-2.696 0-8.845-0.533-11.54-0.533C40.67 1.302 35.561 0.236 28.245 0.236z"
					fill={leftAccent}
				/>
			</g>
			{/* Big blue rounded rectangle (rotated ~96deg) */}
			<g transform="translate(28 0) rotate(96)">
				<path
					d="M69.396 0.507c-7.573 0-65.277-3.442-67.102 7.602C1.102 15.32 1.083 50.548 1.083 71.004c0 7.563-0.892 14.871-0.892 22.346 0 6.891-1.347 12.343 3.123 13.869 8.937 3.051 15.844 4.281 24.323 4.281 22.293 0 44.02 1.83 66.376 1.83h31.65h14.506c3.78 0 10.58 0.346 14.222-1.83 2.021-1.209 3.768-15.087 3.768-18.151V53.282c0-12.516 0.892-24.636 0.892-36.986 0-5.796 0.131-9.287-3.937-9.287-5.642-0.48-15.268-3.06-18.243-3.06-5.801 0-19.035-1.147-24.836-1.147C100.135 2.802 89.142 0.507 73.396 0.507z"
					fill="var(--npi-blue)"
				/>
			</g>
		</svg>
	)
}

/**
 * Right-side decoration cluster — light grid backdrop with a thick blue arc and
 * a small triangular accent shape. Matches Figma group at node 368:8794–368:8798.
 */
function RightDecoration({ rightAccent }: { rightAccent: string }) {
	return (
		<svg
			width="245"
			height="231"
			viewBox="0 0 245 231"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className="shrink-0"
		>
			{/* Light grid backdrop */}
			<g stroke="var(--npi-blue-light)" strokeWidth="1" opacity="0.9">
				{Array.from({ length: 11 }).map((_, i) => <line key={`v${i}`} x1={i * 18} y1="0" x2={i * 18} y2="120" />)}
				{Array.from({ length: 7 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 18} x2="180" y2={i * 18} />)}
			</g>
			{/* Big blue arc (upside-down U shape) */}
			<g transform="translate(40 80)">
				<path
					d="M32.278 1.826C22.868 1.826 0.262-0.85 0.603 1.232c0 6.444-0.603 12.921-0.603 19.467 0 14.174 5.71 28.083 14.446 39.265 5.923 7.579 14.534 12.921 22.826 17.752 8.901 5.185 22.16 5.394 32.043 5.477 19.702 0.164 38.69 0.016 57.685-5.675 7.66-2.295 15.26-5.486 20.948-11.087 4.934-4.857 8.949-11.089 12.734-16.737 3.46-5.163 2.663-4.456 5.498-10.468 2.413-5.116 4.028-12.992 5.092-18.177l0.072-0.35c1.062-5.176 2.856-11.027 3.017-15.292 0.057-1.536 0-1.722 0-3.285C174.361 0.265 172.274 0.379 171.344 0.43c-6.293 0.344-12.233 0.104-18.435 0.104-2.237 0-18.686-1.576-18.686 0.687 0 2.673-0.443 7.444-0.443 10.117 0 3.213-2.409 10.002-3.544 12.908-2.803 7.172-6.236 13.028-12.758 17.443-10.701 7.242-24.295 5.87-37.102 5.87-10.267 0-23.886-4.723-30.602-12.802-3.124-3.759-6.05-7.982-7.676-12.605-1.094-3.112-1.47-6.647-2.748-9.635C38.225 9.886 38.613 6.71 38.613 3.904c0-3.259-3.638-2.078-6.335-2.078z"
					fill="var(--npi-blue)"
				/>
			</g>
			{/* Small triangular accent at top-right */}
			<g transform="translate(116 22) rotate(15)">
				<path
					d="M48.834 8.675c2.119-3.557 5.202-8.332 8.918-8.67 2.317-0.21 6.114 6.383 6.935 8.422 0.888 2.204 3.455 8.648 4.707 10.651 2.725 5.202 4.215 9.696 6.688 13.625 3.462 5.501 4.29 8.793 7.208 14.598 2.676 5.322 5.218 10.711 7.258 16.305 1.343 3.683 2.881 7.27 4.498 10.836 0.969 2.137 2.157 4.407 2.198 6.812 0.009 0.532 0.388 1.982 0 3.104-0.602 1.108-0.354 2.17-2.831 2.53-4.769 0.694-8.577 0.828-13.376 1.302-6.29 0.622-13 0.92-19.321 0.991-9.734 0.109-20.775 1.168-30.507 1.617-7.123 0.329-12.414 0.445-19.529 0-2.376-0.148-6.106-0.23-8.422-0.874-2.077-0.577-3.331-1.005-3.253-3.036 0.033-0.851 0.67-1.913 1.024-2.661 0.581-1.232 0.495-1.239 1.379-2.973 1.055-2.07 1.708-4.458 2.832-6.192 1.503-2.32 1.925-3.517 3.404-5.859 2.2-3.484 5.007-8.937 7.495-12.224 2.527-3.337 4.243-7.441 6.937-10.652 4.127-4.919 6.899-10.011 10.404-15.358 3.288-5.016 6.196-9.054 9.413-14.119 1.86-2.929 4.167-5.19 5.945-8.174z"
					fill={rightAccent}
				/>
			</g>
		</svg>
	)
}

/**
 * Full-page 404 / not-found block. Used as the body of error pages.
 *
 * - Centered layout that respects `max-w-npi-layout` (1064px).
 * - Three columns on tablet+ (left decoration · content · right decoration);
 *   decorations collapse below the content on mobile.
 * - All decoration colors are token-driven; the `theme` prop swaps the two
 *   secondary-color accents.
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
		const colors = themeColors[theme]
		const renderedActions = actions ?? <Button href="/" label="Přejít na úvodní stránku" />

		return (
			<section
				ref={ref}
				className={twMerge(
					clsx(
						'mx-auto flex w-full max-w-npi-layout flex-col items-center justify-center gap-npi-10 px-npi-4 py-npi-16 @npi-tablet:flex-row @npi-tablet:items-start @npi-tablet:gap-npi-10',
						className,
					),
				)}
				{...rest}
			>
				<div className="order-2 flex shrink-0 justify-center @npi-tablet:order-1 @npi-tablet:pt-npi-4">
					<LeftDecoration leftAccent={colors.leftAccent} />
				</div>
				<div className="order-1 flex w-full max-w-[512px] flex-col items-center gap-npi-6 text-center @npi-tablet:order-2">
					<Heading level={1} className="text-center">{title}</Heading>
					<Text variant="l" className="text-center">{description}</Text>
					{renderedActions}
				</div>
				<div className="order-3 flex shrink-0 justify-center">
					<RightDecoration rightAccent={colors.rightAccent} />
				</div>
			</section>
		)
	},
)
NotFoundPage.displayName = 'NotFoundPage'
