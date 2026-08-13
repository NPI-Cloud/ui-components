import { expect, test } from 'bun:test'
import { render } from '@testing-library/react'
import { Card } from './Card'

const variants = [
	{ name: 'href + tag + cta', props: { href: '/a', tag: { label: 'T', href: '/t' }, cta: { label: 'C', href: '/c' } } },
	{ name: 'href + download', props: { href: '/a', download: { variants: [{ url: '/f.pdf', fileName: 'f.pdf' }] } } },
	{ name: 'href + download multi', props: { href: '/a', download: { variants: [{ url: '/f.pdf' }, { url: '/f.docx' }] } } },
	{ name: 'visualOnly + href', props: { href: '/a', visualOnly: true } },
]

for (const v of variants) {
	test(v.name, () => {
		const { container } = render(<Card title="Title" description="d" {...v.props} />)
		const nested = container.querySelectorAll('a a')
		console.log(v.name, '=> anchors:', container.querySelectorAll('a').length, 'nested:', nested.length)
		console.log(container.innerHTML)
		expect(nested.length).toBe(0)
	})
}
