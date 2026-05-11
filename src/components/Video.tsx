import { clsx } from 'clsx'
import { Text } from './Text'

export interface VideoProps {
	/** YouTube or Vimeo URL — supports `youtube.com/watch?v=…`, `youtu.be/…`, `youtube.com/embed/…`, `vimeo.com/<id>`, `vimeo.com/video/<id>`. */
	url?: string | null
	/** Accessible title for the iframe; used as the placeholder caption when no URL resolves. */
	title?: string
	/** Aspect ratio of the player frame. Defaults to 16:9. */
	aspect?: 'video' | 'square'
	className?: string
}

/**
 * Embedded YouTube / Vimeo video player. Self-contained — renders its own 16:9 frame with
 * rounded corners and a light placeholder background; pass the raw share URL via `url`.
 */
export function Video({ url, title, aspect = 'video', className }: VideoProps) {
	const embedUrl = url ? toEmbedUrl(url) : null
	const aspectClass = aspect === 'square' ? 'aspect-square' : 'aspect-[16/9]'

	return (
		<div className={clsx('relative w-full overflow-hidden rounded-npi-xxs bg-npi-blue-lighter', aspectClass, className)}>
			{embedUrl
				? (
					<iframe
						src={embedUrl}
						title={title ?? 'Video'}
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						allowFullScreen
						className="absolute inset-0 size-full border-0"
					/>
				)
				: (
					<div className="absolute inset-0 flex items-center justify-center">
						<Text variant="l" className="text-npi-text-primary">{title ?? 'Video'}</Text>
					</div>
				)}
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
