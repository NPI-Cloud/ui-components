import type { ReactNode } from 'react'
import { BLOCK_SPACING_DEFAULT, BLOCK_SPACING_TOP_CLASS, type BlockSpacing } from './spacing'

/**
 * Thin wrapper for a single block in a list — applies the cross-cutting `spacingBefore` margin.
 *
 * The block content goes in `children`. Used by both the admin canvas (where the bindx adapter
 * dispatches `block.$data.type` to the right component and passes it as children) and the public
 * website (which dispatches its GraphQL fragment the same way). Spacing is the only concern
 * shared between the two — everything else (data shape, dispatch, prop mapping) is consumer-owned.
 */
export function RenderBlock({ spacingBefore, children }: {
	spacingBefore?: BlockSpacing | null
	children: ReactNode
}) {
	return <div className={BLOCK_SPACING_TOP_CLASS[spacingBefore ?? BLOCK_SPACING_DEFAULT]}>{children}</div>
}
