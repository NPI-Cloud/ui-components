'use client'

import { type AnchorHTMLAttributes, createContext, forwardRef, type ImgHTMLAttributes, type ReactNode, type RefAttributes, useContext } from 'react'

// Framework-primitive injection for the (otherwise framework-agnostic) design system.
//
// The library renders plain HTML by default, so a host that has a router (Next, Buzola) can't get
// SPA navigation / prefetch out of the box. Instead of coupling the library to any framework, a
// host provides its own link implementation via `UIPrimitivesProvider`; components render the
// `<Link>` primitive which resolves the host's impl from context (default: a plain `<a>`).
//
// RSC note: only this `<Link>` leaf is a client component (it reads context). The big
// presentational components that render `<Link>` stay server components — they just render a
// client leaf, which RSC allows. So there is no server→client regression beyond the link itself
// (and a router link, e.g. `next/link`, is a client component anyway).

export type UILinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string; children?: ReactNode }

// A host link must forward a ref to the underlying <a> and accept standard anchor props.
export type UILinkComponent = React.ForwardRefExoticComponent<UILinkProps & RefAttributes<HTMLAnchorElement>>

const PlainLink: UILinkComponent = forwardRef<HTMLAnchorElement, UILinkProps>((props, ref) => <a ref={ref} {...props} />)
PlainLink.displayName = 'PlainLink'

// Image: superset of <img> with the optional next/image knobs (`fill`, `sizes`) so a host can
// render an optimized image; the plain default just ignores those and renders an <img>.
export type UIImageProps = Pick<ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'className' | 'style' | 'loading' | 'decoding' | 'onLoad' | 'onError' | 'sizes'> & {
	/** URL string only (not the `string | Blob` of the raw img attr) so a host can pass it to next/image. */
	src?: string
	width?: number
	height?: number
	/** Fill the (positioned) parent — maps to next/image `fill`; ignored by the plain <img>. */
	fill?: boolean
	/**
	 * Mark this as the above-the-fold LCP image — maps to next/image `priority` (eager load +
	 * `fetchpriority="high"` + preload). Use on at most one image per view. The plain `<img>`
	 * fallback maps it to `fetchpriority="high"` + `loading="eager"`.
	 */
	priority?: boolean
}

export type UIImageComponent = React.ForwardRefExoticComponent<UIImageProps & RefAttributes<HTMLImageElement>>

const PlainImage: UIImageComponent = forwardRef<HTMLImageElement, UIImageProps>(({ fill: _fill, sizes: _sizes, priority, alt, ...rest }, ref) => (
	<img ref={ref} alt={alt ?? ''} fetchPriority={priority ? 'high' : undefined} loading={priority ? 'eager' : undefined} {...rest} />
))
PlainImage.displayName = 'PlainImage'

type UIPrimitives = { Link: UILinkComponent; Image: UIImageComponent }

const UIPrimitivesContext = createContext<UIPrimitives>({ Link: PlainLink, Image: PlainImage })

export function UIPrimitivesProvider({ link, image, children }: { link?: UILinkComponent; image?: UIImageComponent; children: ReactNode }) {
	return <UIPrimitivesContext.Provider value={{ Link: link ?? PlainLink, Image: image ?? PlainImage }}>{children}</UIPrimitivesContext.Provider>
}

// Drop-in replacement for `<a>` across the design system. Renders the host-provided link
// (e.g. `next/link`) when a provider is present, else a plain anchor.
export const Link = forwardRef<HTMLAnchorElement, UILinkProps>((props, ref) => {
	const { Link: Impl } = useContext(UIPrimitivesContext)
	return <Impl ref={ref} {...props} />
})
Link.displayName = 'Link'

// Drop-in replacement for `<img>`. Renders the host-provided image (e.g. `next/image`) when a
// provider is present, else a plain <img>. Pass `width`/`height` or `fill` to let the host optimize.
export const Image = forwardRef<HTMLImageElement, UIImageProps>((props, ref) => {
	const { Image: Impl } = useContext(UIPrimitivesContext)
	return <Impl ref={ref} {...props} />
})
Image.displayName = 'Image'
