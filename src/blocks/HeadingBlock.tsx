'use client'

import { Heading, type HeadingLevel } from '../components/Heading'

export type HeadingBlockLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7'

export interface HeadingBlockProps {
	text: string | null | undefined
	level?: HeadingBlockLevel | null
	// Visual style override — null/undefined = follow `level`.
	visualLevel?: HeadingBlockLevel | null
	inverted?: boolean | null
}

const levelMap: Record<HeadingBlockLevel, HeadingLevel> = {
	h1: 1,
	h2: 2,
	h3: 3,
	h4: 4,
	h5: 5,
	h6: 6,
	h7: 7,
}

export function HeadingBlock({ text, level, visualLevel, inverted }: HeadingBlockProps) {
	const resolved = level ? levelMap[level] : 2
	return (
		<Heading level={resolved} visualLevel={visualLevel ? levelMap[visualLevel] : undefined} inverted={inverted ?? false}>
			{text || 'Nadpis'}
		</Heading>
	)
}
