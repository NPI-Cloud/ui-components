import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { parseBlueskyPostUrl } from './bluesky-url'
import { BlueskyPost } from './BlueskyPost'

test('Bluesky post parser accepts handles and DIDs and strips tracking query', () => {
	expect(parseBlueskyPostUrl('https://bsky.app/profile/spomocnik.bsky.social/post/3kq7aeuwbg42k?ref=share')?.actor).toBe('spomocnik.bsky.social')
	expect(parseBlueskyPostUrl('https://bsky.app/profile/did:plc:vjug55kidv6sye7ykr5faxxn/post/3jzn6g7ixgq2y')?.post).toBe('3jzn6g7ixgq2y')
})
test('only HTTPS individual Bluesky posts can become embeds', () => {
	for (const url of ['javascript:alert(1)', 'https://bsky.app.evil.org/profile/a.test/post/123', 'https://evil@bsky.app/profile/a.test/post/123', 'http://bsky.app/profile/a.test/post/123', 'https://bsky.app/profile/a.test', 'https://bsky.app/profile/a.test/post/%22x', '<script>alert(1)</script>']) expect(parseBlueskyPostUrl(url)).toBeNull()
})
test('DID post renders only official iframe and accessible original link', () => {
	const html = renderToStaticMarkup(createElement(BlueskyPost, { url: 'https://bsky.app/profile/did:plc:vjug55kidv6sye7ykr5faxxn/post/3jzn6g7ixgq2y' }))
	expect(html).toContain('https://embed.bsky.app/embed/did:plc:vjug55kidv6sye7ykr5faxxn/app.bsky.feed.post/3jzn6g7ixgq2y')
	expect(html).toContain('title="Příspěvek na Bluesky"')
	expect(html).toContain('Otevřít příspěvek na Bluesky')
	expect(html).not.toContain('<script')
})
test('handle post has a usable link before the async DID lookup resolves', () => {
	const html = renderToStaticMarkup(createElement(BlueskyPost, { url: 'https://bsky.app/profile/spomocnik.bsky.social/post/3kq7aeuwbg42k' }))
	expect(html).toContain('https://bsky.app/profile/spomocnik.bsky.social/post/3kq7aeuwbg42k')
	expect(html).not.toContain('<iframe')
})
