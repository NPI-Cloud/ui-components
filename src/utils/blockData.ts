// Slate's RichTextEditor stores `{ formatVersion, children: [...nodes] }`. Some blocks (e.g.
// ContentImageBlock) currently flatten this to plain text; replace with a structured renderer
// when one lands. Both admin previews and the public website call this — keep here.

export function richTextToPlainText(value: unknown): string {
	const extract = (nodes: unknown): string => {
		if (!Array.isArray(nodes)) return ''
		return nodes.map(node => {
			if (typeof node !== 'object' || node === null) return ''
			const n = node as { text?: unknown; children?: unknown }
			if (typeof n.text === 'string') return n.text
			return extract(n.children)
		}).join('')
	}
	if (!value) return ''
	if (typeof value === 'string') {
		try {
			return extract(JSON.parse(value))
		} catch {
			return value
		}
	}
	if (typeof value === 'object' && value !== null && Array.isArray((value as { children?: unknown }).children)) {
		return extract((value as { children: unknown[] }).children)
	}
	return ''
}

export function parseDynamicFilter(value: unknown): Record<string, unknown> | undefined {
	if (!value) return undefined
	if (typeof value === 'string') {
		try {
			const parsed = JSON.parse(value)
			return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, unknown> : undefined
		} catch {
			return undefined
		}
	}
	if (typeof value === 'object') return value as Record<string, unknown>
	return undefined
}
