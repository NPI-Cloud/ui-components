'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { type ClassValue, clsx } from 'clsx'
import { type ComponentType, createElement, forwardRef, type ReactNode, useMemo, useRef } from 'react'
import { twMerge } from 'tailwind-merge'

type StringToBoolean<T> = T extends 'true' | 'false' ? boolean : T
type ConfigSchema = Record<string, Record<string, ClassValue>>

export type ConfigVariants<T extends ConfigSchema | undefined> = T extends ConfigSchema ? {
		[Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | null | undefined
	}
	: {}

type ConfigVariantsMulti<T extends ConfigSchema | undefined> = T extends ConfigSchema ? {
		[Variant in keyof T]?: StringToBoolean<keyof T[Variant]> | StringToBoolean<keyof T[Variant]>[] | undefined
	}
	: {}

type DataAttr<T extends ConfigSchema | undefined> = T extends ConfigSchema ? `data-${keyof T & string}` : never
type DataAttrValue = boolean | string | number | undefined | null

type Config<T extends ConfigSchema | undefined, El extends React.ElementType> = {
	baseClass?: ClassValue
	variants?: T
	passVariantProps?: string[]
	defaultProps?: Partial<
		& React.ComponentProps<El>
		& {
			[K in `data-${string}`]?: DataAttrValue
		}
	>
	defaultVariants?: ConfigVariants<T>
	compoundVariants?: ((ConfigVariants<T> | ConfigVariantsMulti<T>) & { className?: string })[]
	variantsAsDataAttrs?: (keyof ConfigVariants<T>)[]
	displayName?: string
	wrapOuter?: ComponentType<{ children?: ReactNode } & ConfigVariants<T>>
	wrapInner?: ComponentType<{ children?: ReactNode } & ConfigVariants<T>>
	beforeChildren?: ReactNode
	afterChildren?: ReactNode
	style?: React.CSSProperties
}

export const uiconfig = <T extends ConfigSchema | undefined>(config: Config<T, ComponentType<{}>>) => config

export type NoInfer<T> = T & { [K in keyof T]: T[K] }

function useObjectMemo<T extends Record<string, unknown>>(obj: T): T {
	const ref = useRef(obj)
	const prev = ref.current
	const isEqual = Object.keys(obj).length === Object.keys(prev).length
		&& Object.keys(obj).every(k => obj[k] === prev[k])
	if (!isEqual) {
		ref.current = obj
	}
	return ref.current
}

function dataAttribute(value: unknown): string | undefined {
	if (value === true) return ''
	if (value === false || value === null || value === undefined) return undefined
	return String(value)
}

export const uic = <El extends React.ElementType, Variants extends ConfigSchema | undefined = undefined>(
	Component: El,
	config: Config<Variants, NoInfer<El>>,
) => {
	// cva's generic `Config<T>` is inferred from `variants`, but our `config` is generic over the
	// untyped `Variants` schema, so the object shape (esp. `compoundVariants`) doesn't line up with
	// cva's. Cast the config to cva's own parameter type, and the returned matcher to a permissive
	// selection signature — the runtime contract is identical, only the static types differ.
	const cls = cva(config?.baseClass, {
		variants: config?.variants,
		defaultVariants: config?.defaultVariants,
		compoundVariants: config?.compoundVariants,
	} as Parameters<typeof cva<ConfigSchema>>[1]) as (selection?: Record<string, unknown>) => string
	const passVariantProps = config?.passVariantProps ? new Set(config.passVariantProps) : undefined

	const component = forwardRef<
		React.ComponentRef<El>,
		React.ComponentProps<El> & {
			asChild?: boolean
			children?: ReactNode
			className?: string
		} & ConfigVariants<Variants>
	>((props, ref) => {
		const { className: classNameProp, children: childrenBase, ...rest } = props
		// `rest` carries arbitrary host props plus the variant keys we strip below; a typed record lets us
		// read/delete those dynamic keys without reaching for `any`.
		const restRecord = rest as Record<string, unknown>

		const variants: Record<string, unknown> = {}

		for (const key in config?.variants) {
			variants[key] = restRecord[key]
			if (key in rest && !passVariantProps?.has(key)) {
				delete restRecord[key]
			}
		}

		const variantsMemoized = useObjectMemo(variants)

		const dataAttrs: Partial<Record<DataAttr<Variants>, DataAttrValue>> = {}
		if (config?.variantsAsDataAttrs && config.variants) {
			for (const key of config.variantsAsDataAttrs) {
				const keyAsString = key.toString()
				const variantValue = restRecord[keyAsString] ?? config.defaultVariants?.[key]

				dataAttrs[`data-${keyAsString}` as DataAttr<Variants>] = dataAttribute(variantValue)
			}
		}
		const style = config?.style ? { ...config.style, ...(rest.style || {}) } : rest.style
		const finalClassName = useMemo(() => twMerge(clsx(cls(variantsMemoized), classNameProp)), [variantsMemoized, classNameProp])

		let FinalComponent: React.ElementType = Component
		if (props.asChild && typeof Component === 'string') {
			FinalComponent = Slot
			delete restRecord.asChild
		}

		let children = childrenBase
		if (config?.wrapInner) {
			children = createElement(config.wrapInner, props as React.ComponentProps<typeof config.wrapInner>, children)
		}

		if (config?.beforeChildren || config?.afterChildren) {
			children = [
				config?.beforeChildren,
				children,
				config?.afterChildren,
			]
		}

		const innerEl = (
			<FinalComponent
				ref={ref}
				className={finalClassName}
				{...(config.defaultProps ?? {})}
				{...dataAttrs}
				{...rest}
				style={style}
			>
				{children}
			</FinalComponent>
		)
		return config?.wrapOuter ? createElement(config.wrapOuter, props as React.ComponentProps<typeof config.wrapOuter>, innerEl) : innerEl
	})
	component.displayName = config?.displayName

	return component
}
