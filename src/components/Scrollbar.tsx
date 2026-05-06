import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes, useId } from 'react'
import { twMerge } from 'tailwind-merge'

export const scrollbarDirections = ['vertical', 'horizontal', 'both'] as const
export type ScrollbarDirection = typeof scrollbarDirections[number]

export interface ScrollbarProps extends HTMLAttributes<HTMLDivElement> {
	/**
	 * Scroll direction. `vertical` (default) lets content overflow only vertically,
	 * `horizontal` only horizontally, `both` lets it overflow in either axis.
	 */
	direction?: ScrollbarDirection
}

/**
 * `Scrollbar` wraps its children in a scroll container with NPI-styled scrollbars.
 *
 * The styling targets WebKit's `::-webkit-scrollbar*` pseudo-elements (Chrome / Safari /
 * Edge) and Firefox's `scrollbar-color` / `scrollbar-width`. The track is `npi-gray-200`,
 * the thumb is `npi-blue` and turns `npi-blue-hover` on hover / active. When the
 * container itself receives keyboard focus the thumb gets a `npi-blue-light` ring,
 * matching the Figma "Focus" state.
 *
 * The component renders a real scrollable `<div>` — give it a constrained height
 * (and/or width for horizontal scroll) so the inner content actually overflows.
 */
export const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>((props, ref) => {
	const { direction = 'vertical', className, children, style, ...rest } = props
	const reactId = useId()
	// react useId() can include ':' which is invalid in CSS class names — strip them.
	const scopeClass = `npi-scrollbar-${reactId.replace(/:/g, '')}`

	const overflowClass = direction === 'horizontal'
		? 'overflow-x-auto overflow-y-hidden'
		: direction === 'both'
		? 'overflow-auto'
		: 'overflow-y-auto overflow-x-hidden'

	// WebKit pseudo-elements can't be reached through Tailwind utilities, so we inline
	// a scoped style block. All colors come from the `--npi-*` CSS custom properties.
	const css = `
.${scopeClass} {
	scrollbar-color: var(--npi-blue) var(--npi-gray-200);
	scrollbar-width: thin;
}
.${scopeClass}::-webkit-scrollbar {
	width: 8px;
	height: 8px;
}
.${scopeClass}::-webkit-scrollbar-track {
	background-color: var(--npi-gray-200);
	border-radius: 9999px;
}
.${scopeClass}::-webkit-scrollbar-thumb {
	background-color: var(--npi-blue);
	border-radius: 9999px;
	border: 0 solid transparent;
	background-clip: padding-box;
}
.${scopeClass}::-webkit-scrollbar-thumb:hover,
.${scopeClass}::-webkit-scrollbar-thumb:active {
	background-color: var(--npi-blue-hover);
}
.${scopeClass}::-webkit-scrollbar-corner {
	background-color: var(--npi-gray-200);
}
.${scopeClass}:focus-visible {
	outline: none;
}
.${scopeClass}:focus-visible::-webkit-scrollbar-track {
	border-radius: var(--npi-radius-xs);
}
.${scopeClass}:focus-visible::-webkit-scrollbar-thumb {
	background-color: var(--npi-blue);
	border-radius: var(--npi-radius-xs);
	border: 2px solid var(--npi-blue-light);
	background-clip: padding-box;
}
.${scopeClass}:focus-visible {
	scrollbar-color: var(--npi-blue) var(--npi-gray-200);
}
`

	return (
		<>
			<style>{css}</style>
			<div
				ref={ref}
				className={twMerge(clsx(scopeClass, overflowClass, className))}
				style={style}
				{...rest}
			>
				{children}
			</div>
		</>
	)
})
Scrollbar.displayName = 'Scrollbar'
