export function parseBlueskyPostUrl(value: string): { actor: string; post: string; url: string } | null {
	try {
		const url = new URL(value.trim())
		if (url.protocol !== 'https:' || url.hostname !== 'bsky.app' || url.port || url.username || url.password) return null
		const match = url.pathname.match(/^\/profile\/([a-zA-Z0-9.:%-]+)\/post\/([a-zA-Z0-9]+)\/?$/)
		if (!match) return null
		const actor = decodeURIComponent(match[1]!)
		if (!/^(?:did:(?:plc:[a-z2-7]+|web:[a-zA-Z0-9.%-]+)|[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+)$/.test(actor)) return null
		return { actor, post: match[2]!, url: `https://bsky.app/profile/${encodeURIComponent(actor)}/post/${match[2]}` }
	} catch { return null }
}
