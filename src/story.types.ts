import type { ComponentProps, ComponentType } from 'react'

export type ControlType = 'text' | 'select' | 'boolean' | 'number' | 'json'

export interface ArgType {
	control: ControlType
	options?: (string | number)[]
	min?: number
	max?: number
	defaultValue?: unknown
	description?: string
}

export interface Meta<C extends ComponentType<any> = ComponentType<any>> {
	title: string
	component: C
	argTypes?: Record<string, ArgType>
	order?: number
	/** When true, the Playground renders the story without the default 24px padding and `max-w-npi-layout` wrapper — useful for edge-to-edge components like the full navigation. */
	fullBleed?: boolean
}

export interface Story<C extends ComponentType<any> = ComponentType<any>> {
	name?: string
	args: Partial<ComponentProps<C>>
	order?: number
}
