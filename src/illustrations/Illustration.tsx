import type { ComponentType, SVGProps } from 'react'
import { illustrationRegistry } from './registry'

export type IllustrationName = keyof typeof illustrationRegistry

type IllustrationProps = SVGProps<SVGSVGElement> & {
	name: IllustrationName
}

export const Illustration = ({ name, ...props }: IllustrationProps) => {
	const Component: ComponentType<SVGProps<SVGSVGElement>> = illustrationRegistry[name]
	if (Component == null) return null
	// Decorative by default: with no accessible name or explicit role, hide the illustration from
	// assistive tech. Any caller-supplied aria-* / role still wins via the spread.
	const isLabelled = props['aria-label'] != null || props['aria-labelledby'] != null || props.role != null
	return <Component aria-hidden={isLabelled ? undefined : true} focusable={false} {...props} />
}
