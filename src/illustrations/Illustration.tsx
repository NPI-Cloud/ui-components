import type { ComponentType, SVGProps } from 'react'
import { illustrationRegistry } from './registry'

export type IllustrationName = keyof typeof illustrationRegistry

type IllustrationProps = SVGProps<SVGSVGElement> & {
	name: IllustrationName
}

export const Illustration = ({ name, ...props }: IllustrationProps) => {
	const Component: ComponentType<SVGProps<SVGSVGElement>> = illustrationRegistry[name]
	if (Component == null) return null
	return <Component {...props} />
}
