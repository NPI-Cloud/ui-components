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
	/** When true, the Playground renders the story without the default 24px padding and `max-w-npi-layout` wrapper — useful for edge-to-edge components like the full navigation. */
	fullBleed?: boolean
	/**
	 * When true, the Playground frames the story like the real site's `<main>` wrapper
	 * (`max-w-npi-layout px-npi-6`) instead of the default canvas padding. For full-page
	 * templates that own their internal layout but rely on the page wrapper for the 24px
	 * horizontal edge padding — without it they spread to the viewport edges on mobile.
	 */
	pageTemplate?: boolean
}

export interface Story<C extends ComponentType<any> = ComponentType<any>> {
	name?: string
	args: Partial<ComponentProps<C>>
	order?: number
	hiddenInDocs?: boolean
}
