import { clsx } from 'clsx'
import { Children, type ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

export const blockColumnsRatios = ['1:1', '2:1', '1:2', '1:1:1'] as const
export type BlockColumnsRatio = (typeof blockColumnsRatios)[number]

export type BlockColumnsMode = 'live' | 'editor'

export interface BlockColumnsProps {
	/** Column split ratio. Parts map to 12-col grid spans. */
	ratio: BlockColumnsRatio
	/** `live` stacks columns below 720px; `editor` keeps them side-by-side at all widths. */
	mode?: BlockColumnsMode
	/** One child per ratio part. */
	children: ReactNode
	className?: string
}

// 12-col spans per ratio part
const spansByRatio: Record<BlockColumnsRatio, number[]> = {
	'1:1': [6, 6],
	'2:1': [8, 4],
	'1:2': [4, 8],
	'1:1:1': [4, 4, 4],
}

// Pre-enumerated to keep all Tailwind classes present in source for the JIT scanner.
// Live: at mobile the parent grid is single-column, so children need no span class.
const liveSpanClassByCount: Record<number, string> = {
	4: 'npi-tablet:col-span-4',
	6: 'npi-tablet:col-span-6',
	8: 'npi-tablet:col-span-8',
}

const editorSpanClassByCount: Record<number, string> = {
	4: 'col-span-4',
	6: 'col-span-6',
	8: 'col-span-8',
}

export function BlockColumns({ ratio, mode = 'live', children, className }: BlockColumnsProps) {
	const spans = spansByRatio[ratio]
	const childArray = Children.toArray(children)

	if (childArray.length !== spans.length) {
		console.warn(
			`BlockColumns: ratio "${ratio}" expects ${spans.length} children, got ${childArray.length}.`,
		)
	}

	const gridClass = mode === 'editor'
		? 'grid grid-cols-12 gap-npi-2'
		: 'grid grid-cols-1 gap-npi-4 npi-tablet:grid-cols-12 npi-tablet:gap-npi-10'
	const spanMap = mode === 'editor' ? editorSpanClassByCount : liveSpanClassByCount

	return (
		<div className={twMerge(clsx(gridClass, className))}>
			{childArray.map((child, i) => (
				<div key={i} className={spanMap[spans[i]!]}>
					{child}
				</div>
			))}
		</div>
	)
}
