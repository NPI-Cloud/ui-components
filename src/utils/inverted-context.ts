'use client'

import { createContext, useContext } from 'react'

// Lets a tone-aware surface (e.g. an inverted StickyBar) tell the typography/button primitives
// inside it to render on a dark background, without every consumer threading `inverted` onto each
// child. Components read this only as a fallback — an explicit `inverted` prop always wins — and the
// default is `false`, so primitives rendered outside any provider behave exactly as before.
export const InvertedContext = createContext(false)

export const useInverted = (explicit?: boolean | null): boolean => {
	const inherited = useContext(InvertedContext)
	return explicit ?? inherited
}
