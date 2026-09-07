// Placement classes of a side menu — kept out of the `'use client'` component module so a server
// component (the websites block renderer) can read them as plain strings; a non-component export
// of a client module reaches a server component as a client reference, not its value.
//
// The top offset mirrors the site's `scroll-padding-top`: 1.5 rem below the (non-sticky) tablet
// nav, 6 rem under the sticky desktop nav, plus a pinned top bar's height while one is on screen.
// Literal class strings — Tailwind's scanner reads them from source.

/**
 * Pins a side menu — or the wrapper that owns it — to the viewport top from the tablet breakpoint
 * up. A host that wraps the menu in its own spacing element (the web-builder's block wrapper) puts
 * this on THAT element: `position: sticky` is bounded by the parent, and a wrapper only as tall as
 * the menu would never let it move.
 */
export const sideMenuStickyClass =
	'npi-tablet:sticky npi-tablet:top-[calc(1.5rem+var(--npi-top-bar-height,0px))] npi-desktop:top-[calc(6rem+var(--npi-top-bar-height,0px))]'

/** Viewport height minus the top offset and the same 1.5 rem of breathing room at the bottom. */
export const sideMenuFillHeightClass =
	'npi-tablet:min-h-[calc(100dvh-3rem-var(--npi-top-bar-height,0px))] npi-desktop:min-h-[calc(100dvh-7.5rem-var(--npi-top-bar-height,0px))]'
