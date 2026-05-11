import { Text } from './Text'
import { toEmbedUrl } from './Video'

export interface CoverMediaProps {
	/** Static image URL — used as the cover when `videoUrl` is empty (or unsupported). */
	imageUrl?: string | null
	/** Alt text for the image / iframe title. */
	imageAlt?: string
	/**
	 * Video URL — supports YouTube (`watch?v=`, `youtu.be/`, `embed/`) and Vimeo
	 * (`vimeo.com/<id>`, `vimeo.com/video/<id>`). When provided AND parseable, an
	 * embedded iframe replaces the static image.
	 */
	videoUrl?: string | null
	/** Placeholder text shown when neither URL is provided. Defaults to the design's "Vizuál, foto, video". */
	placeholderLabel?: string
}

/**
 * Inner content for `ContentTemplateCover`. Renders an image, an embedded video, or a
 * placeholder — whichever fits the data. Designed to fill an absolutely-positioned parent
 * (the cover frame inside `ArticleTemplate` / `PodcastTemplate` / `VideoTemplate`).
 */
export function CoverMedia({ imageUrl, imageAlt, videoUrl, placeholderLabel = 'Vizuál, foto, video' }: CoverMediaProps) {
	const embedUrl = videoUrl ? toEmbedUrl(videoUrl) : null

	if (embedUrl) {
		return (
			<iframe
				src={embedUrl}
				title={imageAlt ?? 'Video'}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen
				className="absolute inset-0 size-full border-0"
			/>
		)
	}

	if (imageUrl) {
		return <img src={imageUrl} alt={imageAlt ?? ''} className="absolute inset-0 size-full object-cover" />
	}

	return (
		<div className="absolute inset-0 flex items-center justify-center">
			<Text variant="l" className="text-npi-text-primary">{placeholderLabel}</Text>
		</div>
	)
}

// Re-exported here for backward compatibility — moved to `./Video` so the new `<Video>`
// primitive and `CoverMedia` share the same parser.
export { toEmbedUrl }
