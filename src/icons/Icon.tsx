import type { ComponentType, SVGProps } from 'react'
import { iconRegistryM, iconRegistryS } from './registry'

export type IconSize = 's' | 'm'
export type IconName = keyof typeof iconRegistryM

type IconProps = SVGProps<SVGSVGElement> & {
	name: IconName
	size?: IconSize
}

export const Icon = ({ name, size = 'm', ...props }: IconProps) => {
	const registry: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = size === 's' ? iconRegistryS : iconRegistryM
	// Not every icon ships a dedicated `s` (16px) glyph; fall back to the `m` variant so requesting
	// `size="s"` scales the medium icon down rather than silently rendering nothing.
	const Component = registry[name] ?? iconRegistryM[name]
	if (Component == null) return null
	// Decorative by default: with no accessible name or explicit role, hide the glyph from assistive
	// tech (adjacent text carries the meaning). Any caller-supplied aria-* / role still wins via spread.
	const isLabelled = props['aria-label'] != null || props['aria-labelledby'] != null || props.role != null
	return <Component aria-hidden={isLabelled ? undefined : true} focusable={false} {...props} />
}
