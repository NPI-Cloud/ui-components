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
	/** YouTube or Vimeo URL — when parseable, embeds an iframe instead of the image. */
	videoUrl?: string | null
	/** Caption rendered below the media as `<figcaption>`. */
	caption?: string | null
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
	{ imageUrl, imageAlt, videoUrl, caption, placeholderLabel = 'Vizuál, foto, video', aspect = '16:9', fit = 'cover', href, zoomable }: MediaBlockProps,
) {
	const embedUrl = videoUrl ? toEmbedUrl(videoUrl) : null
	const [zoomOpen, setZoomOpen] = useState(false)

	const media = (() => {
		if (embedUrl) {
			return (
				<div className="relative aspect-[16/9] w-full overflow-hidden rounded-npi-xxs bg-npi-blue-lighter">
					<iframe
						src={embedUrl}
						title={imageAlt ?? 'Video'}
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
					<Image
						src={imageUrl}
						alt={imageAlt ?? ''}
						className="h-auto w-full rounded-npi-xxs"
					/>
				)
				: (
					<div className={clsx('relative w-full overflow-hidden rounded-npi-xxs', aspectClasses[frameAspect])}>
						<Image
							src={imageUrl}
							alt={imageAlt ?? ''}
							className={clsx('size-full', fit === 'contain' ? 'object-contain' : 'object-cover')}
						/>
					</div>
				)

			if (href) {
				return <Link href={href} className="block">{imageEl}</Link>
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

	if (!caption) {
		return <>{media}{lightbox}</>
	}

	return (
		<>
			<figure className="flex flex-col items-start gap-npi-2">
				{media}
				<figcaption>
					<Text variant="l">{caption}</Text>
				</figcaption>
			</figure>
			{lightbox}
		</>
	)
}
