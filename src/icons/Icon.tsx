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
	const Component = registry[name]
	if (Component == null) return null
	return <Component {...props} />
}
