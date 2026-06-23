'use client'

import { Link } from './ui-primitives'
import { forwardRef } from 'react'
import { Icon, type IconName } from '../icons'
import { useInverted } from '../utils/inverted-context'
import { uic } from '../utils/uic'

export const buttonVariants = [
	'primary',
	'secondary',
	'tertiary',
	'tertiary-s',
	'icon',
] as const

const ButtonRoot = uic('button', {
	baseClass:
		'inline-flex items-center justify-center gap-npi-2 cursor-pointer font-npi-sans font-bold transition-colors focus-visible:outline-[3px] focus-visible:outline-offset-0 focus-visible:outline-[#ACCDFF] disabled:pointer-events-none',
	variants: {
		variant: {
			primary:
				'rounded-npi-xxs px-npi-8 py-npi-3 w-full md:w-auto min-w-npi-40 text-[1rem] leading-[1.6] bg-npi-blue text-npi-white hover:bg-npi-blue-hover active:bg-npi-blue-hover disabled:bg-npi-gray-700',
			secondary:
				'rounded-npi-xxs px-npi-8 py-npi-3 w-full md:w-auto min-w-npi-40 text-[1rem] leading-[1.6] border border-npi-blue text-npi-blue bg-transparent hover:border-npi-blue-hover hover:text-npi-blue-hover active:border-npi-blue-hover active:text-npi-blue-hover disabled:text-npi-gray-700 disabled:border-npi-gray-700',
			tertiary:
				'text-[1rem] leading-[1.6] p-npi-2 bg-transparent text-npi-blue hover:text-npi-blue-hover active:text-npi-blue-hover focus-visible:outline-none focus-visible:shadow-[0_3px_0_0_#ACCDFF] disabled:text-npi-gray-700',
			'tertiary-s':
				'text-[0.875rem] leading-[1.3] p-npi-1 font-normal bg-transparent text-npi-blue hover:text-npi-blue-hover active:text-npi-blue-hover focus-visible:outline-none focus-visible:shadow-[0_3px_0_0_#ACCDFF] disabled:text-npi-gray-700',
			icon:
				'size-10 rounded-full p-0 border border-npi-gray-300 text-npi-blue bg-transparent hover:border-npi-blue-hover hover:text-npi-blue-hover active:border-npi-blue-hover active:text-npi-blue-hover disabled:border-npi-gray-300 disabled:text-npi-gray-700',
		},
		inverted: {
			true: '',
		},
	},
	defaultVariants: {
		variant: 'primary',
	},
	compoundVariants: [
		{
			variant: 'primary',
			inverted: true,
			className:
				'bg-npi-white text-npi-blue hover:bg-npi-gray-50 hover:text-npi-blue-hover active:bg-npi-gray-50 active:text-npi-blue-hover disabled:bg-npi-gray-700 disabled:text-npi-white',
		},
		{
			variant: 'secondary',
			inverted: true,
			className:
				'border-npi-white text-npi-white hover:border-npi-blue-light hover:text-npi-blue-light disabled:text-npi-gray-300 disabled:border-npi-gray-300',
		},
		{
			variant: 'tertiary',
			inverted: true,
			className: 'text-npi-white hover:text-npi-blue-light active:text-npi-blue-light disabled:text-npi-gray-300',
		},
		{
			variant: 'tertiary-s',
			inverted: true,
			className: 'text-npi-white hover:text-npi-blue-light active:text-npi-blue-light disabled:text-npi-gray-300',
		},
		{
			variant: 'icon',
			inverted: true,
			className:
				'bg-npi-white border-npi-white text-npi-blue hover:bg-npi-white hover:text-npi-blue-hover hover:border-npi-white active:bg-npi-white active:text-npi-blue-hover disabled:text-npi-gray-700',
		},
	],
	displayName: 'Button',
})

const ICON_SIZE = 'size-6'

export type ButtonProps =
	& Omit<
		React.ComponentProps<typeof ButtonRoot>,
		'children'
	>
	& {
		label?: string
		iconBefore?: IconName
		iconAfter?: IconName
		/** When provided, renders the button as an anchor element instead of a button */
		href?: string
	}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	({ label, iconBefore, iconAfter, className, variant, href, inverted, ...props }, ref) => {
		const resolvedInverted = useInverted(inverted)
		const isIcon = variant === 'icon'
		// An icon-only button renders no text, so it needs an accessible name. Fall back to `label`
		// (the semantic name callers already pass) when no explicit aria-label is given.
		const resolvedAriaLabel = isIcon ? (props['aria-label'] ?? label) : props['aria-label']
		const isSmall = variant === 'tertiary-s'
		const iconSize = isSmall ? ('s' as const) : ('m' as const)
		const iconClass = isSmall ? 'size-4' : ICON_SIZE

		const paddingOverride = isIcon
			? ''
			: iconBefore && iconAfter
			? 'px-npi-1'
			: iconBefore
			? 'pl-npi-1'
			: iconAfter
			? 'pr-npi-1'
			: ''

		const inner = isIcon
			? (() => {
				const name = iconBefore ?? iconAfter
				return name ? <Icon name={name} className={ICON_SIZE} /> : null
			})()
			: (
				<>
					{iconBefore && <Icon name={iconBefore} size={iconSize} className={iconClass} />}
					{label && <span>{label}</span>}
					{iconAfter && <Icon name={iconAfter} size={iconSize} className={iconClass} />}
				</>
			)

		const mergedClassName = paddingOverride ? `${paddingOverride} ${className ?? ''}` : className

		// `disabled` has no effect on an <a>, so a disabled link would still be focusable and
		// navigable. Render the disabled state as a real <button disabled> (no navigation) instead.
		if (href && !props.disabled) {
			return (
				<ButtonRoot asChild variant={variant} inverted={resolvedInverted} className={mergedClassName}>
					<Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} aria-label={resolvedAriaLabel}>
						{inner}
					</Link>
				</ButtonRoot>
			)
		}

		return (
			<ButtonRoot
				ref={ref as React.Ref<HTMLButtonElement>}
				variant={variant}
				inverted={resolvedInverted}
				className={mergedClassName}
				{...props}
				aria-label={resolvedAriaLabel}
			>
				{inner}
			</ButtonRoot>
		)
	},
)
Button.displayName = 'Button'
