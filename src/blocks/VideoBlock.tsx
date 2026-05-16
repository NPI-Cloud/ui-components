'use client'

import { Video } from '../components/Video'

export interface VideoBlockProps {
	/** YouTube or Vimeo share URL. */
	videoUrl?: string | null
	/** Accessible title for the player. */
	title?: string | null
}

/** Page-block wrapper around the `<Video>` primitive — used by the web-builder for inline videos. */
export function VideoBlock({ videoUrl, title }: VideoBlockProps) {
	return <Video url={videoUrl} title={title ?? undefined} />
}
