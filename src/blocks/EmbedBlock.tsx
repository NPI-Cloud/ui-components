'use client'

import { useEffect, useId, useRef, useState } from 'react'

export interface EmbedBlockProps {
	/** Raw HTML+script snippet to embed — typically a third-party form/widget embed code. */
	html?: string | null
	/** Accessible title for the embedded frame. */
	title?: string | null
}

// Wraps the editor-supplied snippet in a minimal standalone document and injects a resize beacon: a
// ResizeObserver inside the frame posts its content height to the parent, which is the only way to
// size an iframe to unknown, variable-height content (a form grows as fields/validation expand). The
// `__npiEmbed` nonce scopes each message to its own frame when several embeds share a page.
//
// The frame is NOT given `allow-same-origin`. With `srcdoc` the document would otherwise inherit the
// page's origin, and `allow-scripts` + `allow-same-origin` together let the snippet reach
// `parent.document` / cookies / storage — a full sandbox escape. Without it the frame runs in an
// opaque origin: scripts still run, forms still POST cross-origin, and the resize beacon's
// postMessage still reaches the parent. A widget that genuinely needs same-origin storage won't work
// under this default; that's the deliberate safe posture.
function buildSrcDoc(html: string, nonce: string): string {
	const beacon = `(function(){function r(){parent.postMessage({__npiEmbed:${JSON.stringify(nonce)},height:document.documentElement.scrollHeight},'*')}`
		+ `if(window.ResizeObserver){new ResizeObserver(r).observe(document.documentElement)}`
		+ `window.addEventListener('load',r);r()})()`
	return `<!DOCTYPE html><html><head><meta charset="utf-8">`
		+ `<meta name="viewport" content="width=device-width, initial-scale=1">`
		+ `<style>html,body{margin:0;padding:0}</style></head>`
		+ `<body>${html}<script>${beacon}</script></body></html>`
}

export function EmbedBlock({ html, title }: EmbedBlockProps) {
	const nonce = useId()
	const ref = useRef<HTMLIFrameElement>(null)
	const [height, setHeight] = useState<number | null>(null)

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as { __npiEmbed?: string; height?: number } | null
			if (data && data.__npiEmbed === nonce && typeof data.height === 'number' && data.height > 0) {
				setHeight(data.height)
			}
		}
		window.addEventListener('message', onMessage)
		return () => window.removeEventListener('message', onMessage)
	}, [nonce])

	if (!html?.trim()) return <EmbedPlaceholder />

	return (
		<iframe
			ref={ref}
			title={title || 'Vložený obsah'}
			srcDoc={buildSrcDoc(html, nonce)}
			sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation"
			loading="lazy"
			className="block w-full border-0"
			style={{ height: height ?? undefined, minHeight: height ? undefined : 200 }}
		/>
	)
}

function EmbedPlaceholder() {
	return (
		<div className="flex min-h-[120px] w-full items-center justify-center rounded-npi-xxs bg-npi-blue-lighter px-4 py-6 text-center text-sm text-npi-text-primary/70">
			Vlož kód vložení (HTML / iframe) v panelu vpravo
		</div>
	)
}
