'use client'

import { Image, Link } from '../components/ui-primitives'
import { clsx } from 'clsx'
import { useState } from 'react'
import { Text } from '../components/Text'
import { Lightbox } from '../components/Lightbox'
import { toEmbedUrl } from '../components/Video'

export const mediaBlockAspects = ['16:9', '4:3', '1:1', '3:2', 'auto'] as const
export type MediaBlockAspect = (typeof mediaBlockAspects)[number]

export const mediaBlockFits = ['cover', 'contain'] as const
export type MediaBlockFit = (typeof mediaBlockFits)[number]

export interface MediaBlockProps {
	/** Static image URL — shown when no parseable `videoUrl` is provided. */
	imageUrl?: string | null
	/** Alt text for the image / iframe title. */
	imageAlt?: string | null
	/**
	 * Intrinsic image dimensions (from the Image relation). Only used in `auto` aspect, where there
	 * is no frame to fill: passing them lets the host optimize the image (resize/WebP) and reserve
	 * space to prevent layout shift. Omitted dims fall back to an unoptimized natural-size `<img>`.
	 */
	imageWidth?: number | null
	imageHeight?: number | null
	/** YouTube or Vimeo URL — when parseable, embeds an iframe instead of the image. */
	videoUrl?: string | null
	/** Caption rendered below the media as `<figcaption>`. */
	caption?: string | null
	/** Author attribution, appended to the caption line as `autor: …`. */
	author?: string | null
	/** Source attribution, appended to the caption line as `zdroj: …`. */
	source?: string | null
	/** Placeholder text shown when neither URL is provided. */
	placeholderLabel?: string
	/**
	 * Frame ratio. `auto` drops the frame and renders the image at its natural dimensions
	 * (no crop). Video and placeholder always use a 16:9 frame regardless. Defaults to `16:9`.
	 */
	aspect?: MediaBlockAspect
	/**
	 * How the image fills the frame: `cover` crops to fill (default), `contain` letterboxes
	 * inside. Ignored when `aspect` is `auto` (no frame).
	 */
	fit?: MediaBlockFit
	/**
	 * When set, the image becomes a link to this URL (whole-image click-through). Takes precedence
	 * over `zoomable`. Ignored for video/placeholder.
	 */
	href?: string | null
	/**
	 * When `true` (and no `href`), clicking the image opens a fullscreen Lightbox preview.
	 * Ignored for video/placeholder.
	 */
	zoomable?: boolean
	/** Eager-load as the LCP image (skip lazy-loading). Set when the media is above the fold (e.g. a cover). */
	priority?: boolean
}

// Hardcoded so Tailwind's source scanner can see the literal arbitrary values.
const aspectClasses: Record<Exclude<MediaBlockAspect, 'auto'>, string> = {
	'16:9': 'aspect-[16/9]',
	'4:3': 'aspect-[4/3]',
	'1:1': 'aspect-square',
	'3:2': 'aspect-[3/2]',
}

/**
 * Unified media component — used both as the cover of a content page and as an inline
 * media block in the page builder. Renders an embedded YouTube/Vimeo player when
 * `videoUrl` parses, otherwise an `<Image>`, otherwise a labelled placeholder. The frame
 * and rounded corners are owned by the component; an optional caption renders below as
 * `<figcaption>`. Frame ratio and image fit are configurable via `aspect` / `fit`.
 */
export function MediaBlock(
	{ imageUrl, imageAlt, imageWidth, imageHeight, videoUrl, caption, author, source, placeholderLabel = 'Vizuál, foto, video', aspect = '16:9', fit = 'cover', href, zoomable, priority }: MediaBlockProps,
) {
	const embedUrl = videoUrl ? toEmbedUrl(videoUrl) : null
	const [zoomOpen, setZoomOpen] = useState(false)

	const media = (() => {
		if (embedUrl) {
			return (
				<div className="relative aspect-[16/9] w-full overflow-hidden rounded-npi-xxs bg-npi-blue-lighter">
					<iframe
						src={embedUrl}
						title={imageAlt ?? caption ?? 'Video'}
						loading="lazy"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						className="size-full border-0"
					/>
				</div>
			)
		}

		const frameAspect = aspect === 'auto' ? '16:9' : aspect

		if (imageUrl) {
			const imageEl = aspect === 'auto'
				? (
					// No frame in `auto`: pass intrinsic dimensions so the host can optimize and reserve
					// space (no layout shift). Without dims, fall back to an unoptimized natural-size image.
					<Image
						src={imageUrl}
						alt={imageAlt ?? ''}
						width={imageWidth ?? undefined}
						height={imageHeight ?? undefined}
						sizes="(min-width: 1080px) 1016px, 100vw"
						priority={priority}
						className="h-auto w-full rounded-npi-xxs"
					/>
				)
				: (
					<div className={clsx('relative w-full overflow-hidden rounded-npi-xxs', aspectClasses[frameAspect])}>
						<Image
							src={imageUrl}
							alt={imageAlt ?? ''}
							fill
							sizes="(min-width: 1080px) 1016px, 100vw"
							priority={priority}
							className={clsx('size-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
						/>
					</div>
				)

			if (href) {
				// An image link needs an accessible name. When alt is set the image supplies it;
				// when alt is empty, fall back to the caption so the link isn't announced nameless.
				return <Link href={href} className="block" aria-label={imageAlt ? undefined : (caption ?? undefined)}>{imageEl}</Link>
			}
			if (zoomable) {
				return (
					<button
						type="button"
						onClick={() => setZoomOpen(true)}
						className="block w-full cursor-zoom-in appearance-none bg-transparent p-0 text-left"
						aria-label="Zvětšit obrázek"
					>
						{imageEl}
					</button>
				)
			}
			return imageEl
		}

		return (
			<div
				className={clsx(
					'relative flex w-full items-center justify-center overflow-hidden rounded-npi-xxs bg-npi-blue-lighter',
					aspectClasses[frameAspect],
				)}
			>
				<Text variant="l" className="text-npi-text-primary">{placeholderLabel}</Text>
			</div>
		)
	})()

	// Lightbox dialog — only meaningful for a zoomable still image (no href, not video).
	const lightbox = zoomable && imageUrl && !embedUrl && !href
		? (
			<Lightbox
				open={zoomOpen}
				onClose={() => setZoomOpen(false)}
				images={[{ src: imageUrl, alt: imageAlt ?? '' }]}
				index={0}
				onIndexChange={() => {}}
			/>
		)
		: null

	// Caption line = optional caption text followed by `autor: …` / `zdroj: …` attribution,
	// joined with commas. Any of the three may be absent.
	const figcaptionText = [
		caption,
		author ? `autor: ${author}` : null,
		source ? `zdroj: ${source}` : null,
	].filter(Boolean).join(', ')

	if (!figcaptionText) {
		return <>{media}{lightbox}</>
	}

	return (
		<>
			<figure className="flex flex-col items-start gap-npi-2">
				{media}
				<figcaption>
					<Text variant="l">{figcaptionText}</Text>
				</figcaption>
			</figure>
			{lightbox}
		</>
	)
}
