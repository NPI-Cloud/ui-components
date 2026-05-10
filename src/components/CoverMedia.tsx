import { Text } from './Text'

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

/** Translate a public-facing video URL to its `iframe`-embeddable form. Returns `null` for unsupported sources. */
export function toEmbedUrl(url: string): string | null {
	const trimmed = url.trim()
	if (!trimmed) return null

	// YouTube — youtu.be/<id>
	const ytShort = trimmed.match(/youtu\.be\/([\w-]+)/)
	if (ytShort) return youtubeEmbed(ytShort[1])

	// YouTube — youtube.com/embed/<id>
	const ytEmbed = trimmed.match(/youtube\.com\/embed\/([\w-]+)/)
	if (ytEmbed) return youtubeEmbed(ytEmbed[1])

	// YouTube — youtube.com/watch?v=<id>
	const ytWatch = trimmed.match(/[?&]v=([\w-]+)/)
	if (ytWatch && /youtube\.com/.test(trimmed)) return youtubeEmbed(ytWatch[1])

	// Vimeo — vimeo.com/<id> or vimeo.com/video/<id>
	const vimeo = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/)
	if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`

	return null
}

const youtubeEmbed = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
