'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { parseBlueskyPostUrl } from './bluesky-url'

/** Official Bluesky iframe protocol, without executing pasted HTML or third-party scripts. */
export function BlueskyPost({ url }: { url: string }) {
	const post = parseBlueskyPostUrl(url)
	const actor = post?.actor
	const [resolved, setResolved] = useState<{ actor: string; did: string } | null>(null)
	const [height, setHeight] = useState(500)
	const frame = useRef<HTMLIFrameElement>(null)
	const id = useId()
	useEffect(() => {
		if (!actor || actor.startsWith('did:')) return
		const abort = new AbortController()
		const timeout = setTimeout(() => abort.abort(), 8000)
		fetch(`https://public.api.bsky.app/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(actor)}`, { signal: abort.signal })
			.then(async response => {
				if (!response.ok) return
				const data: unknown = await response.json()
				if (data && typeof data === 'object' && 'did' in data && typeof data.did === 'string' && /^did:(plc|web):[a-zA-Z0-9.:%-]+$/.test(data.did) && !abort.signal.aborted) setResolved({ actor, did: data.did })
			})
			.catch(() => { /* The original post link remains available when Bluesky is unavailable. */ })
			.finally(() => clearTimeout(timeout))
		return () => { abort.abort(); clearTimeout(timeout) }
	}, [actor])
	useEffect(() => {
		const resize = (event: MessageEvent) => {
			if (event.origin !== 'https://embed.bsky.app' || event.source !== frame.current?.contentWindow) return
			if (event.data?.id !== id || typeof event.data.height !== 'number' || !Number.isFinite(event.data.height)) return
			setHeight(Math.max(100, Math.min(3000, event.data.height)))
		}
		window.addEventListener('message', resize)
		return () => window.removeEventListener('message', resize)
	}, [id])
	if (!post) return null
	const did = actor?.startsWith('did:') ? actor : resolved && resolved.actor === actor ? resolved.did : null
	return (
		<div className="w-full max-w-[600px]">
			{did && <iframe
				ref={frame}
				src={`https://embed.bsky.app/embed/${did}/app.bsky.feed.post/${post.post}?id=${encodeURIComponent(id)}`}
				title="Příspěvek na Bluesky"
				loading="lazy"
				referrerPolicy="no-referrer"
				sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
				style={{ width: '100%', height, border: 0, display: 'block' }}
			/>}
			<a href={post.url} target="_blank" rel="noopener noreferrer" className="text-npi-blue underline">Otevřít příspěvek na Bluesky</a>
		</div>
	)
}
