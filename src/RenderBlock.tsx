import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import { normalizeAnchor } from './anchor'
import { BLOCK_SPACING_DEFAULT, BLOCK_SPACING_TOP_CLASS, type BlockSpacing } from './spacing'

/**
 * Thin wrapper for a single block in a list — applies the cross-cutting `spacingBefore` margin and,
 * when the block carries an `anchor`, an `id` so in-page links (#anchor) can jump to it.
 *
 * The block content goes in `children`. Used by both the admin canvas (where the bindx adapter
 * dispatches `block.$data.type` to the right component and passes it as children) and the public
 * website (which dispatches its GraphQL fragment the same way). Spacing and the anchor id are the
 * only concerns shared between the two — everything else (data shape, dispatch, prop mapping) is
 * consumer-owned.
 */
export function RenderBlock({ spacingBefore, anchor, className, children }: {
	spacingBefore?: BlockSpacing | null
	anchor?: string | null
	/** Extra classes on the wrapper — for placement a block cannot apply to itself (a sticky side menu). */
	className?: string
	children: ReactNode
}) {
	return (
		<div id={normalizeAnchor(anchor) ?? undefined} className={twMerge(clsx(BLOCK_SPACING_TOP_CLASS[spacingBefore ?? BLOCK_SPACING_DEFAULT], className))}>
			{children}
		</div>
	)
}
