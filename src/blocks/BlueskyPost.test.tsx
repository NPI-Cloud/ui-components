import { afterEach, expect, spyOn, test } from 'bun:test'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { BlueskyPost } from './BlueskyPost'

afterEach(cleanup)

test('resolves a handle, renders the post and accepts resize only from its own iframe', async () => {
	const fetchMock = spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ did: 'did:plc:vjug55kidv6sye7ykr5faxxn' })))
	try {
		const { container } = render(<BlueskyPost url="https://bsky.app/profile/spomocnik.bsky.social/post/3jzn6g7ixgq2y" />)
		await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull())
		const iframe = container.querySelector('iframe')!
		expect(iframe.src).toContain('/embed/did:plc:vjug55kidv6sye7ykr5faxxn/app.bsky.feed.post/3jzn6g7ixgq2y')
		const id = new URL(iframe.src).searchParams.get('id')
		act(() => window.dispatchEvent(new MessageEvent('message', { origin: 'https://evil.example', source: iframe.contentWindow, data: { id, height: 800 } })))
		expect(iframe.style.height).toBe('500px')
		act(() => window.dispatchEvent(new MessageEvent('message', { origin: 'https://embed.bsky.app', source: window, data: { id, height: 800 } })))
		expect(iframe.style.height).toBe('500px')
		act(() => window.dispatchEvent(new MessageEvent('message', { origin: 'https://embed.bsky.app', source: iframe.contentWindow, data: { id, height: 800 } })))
		await waitFor(() => expect(iframe.style.height).toBe('800px'))
	} finally { fetchMock.mockRestore() }
})

test('keeps original link and creates no iframe when handle lookup fails', async () => {
	const fetchMock = spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
	try {
		const { container, getByRole } = render(<BlueskyPost url="https://bsky.app/profile/spomocnik.bsky.social/post/3jzn6g7ixgq2y" />)
		await waitFor(() => expect(fetchMock).toHaveBeenCalled())
		expect(container.querySelector('iframe')).toBeNull()
		expect(getByRole('link').getAttribute('href')).toContain('bsky.app/profile/spomocnik.bsky.social/post/')
	} finally { fetchMock.mockRestore() }
})
