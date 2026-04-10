import type { HTMLAttributes } from 'react'

export const textVariants = ['xl', 'l', 'm', 's', 'xs', 'label'] as const
export const textWeights = ['regular', 'bold'] as const

export type TextSize = (typeof textVariants)[number]
export type TextWeight = (typeof textWeights)[number]

export interface TextProps extends HTMLAttributes<HTMLElement> {
	variant?: TextSize
	weight?: TextWeight
	as?: 'p' | 'span' | 'div' | 'label' | 'a'
	secondary?: boolean
	inverted?: boolean
	href?: string
}

/*
 * From Figma:
 *   Text XL:      Noto Sans Regular  22px/20px(mobile)  130%
 *   Text L:       Noto Sans          16px               160%
 *   Text M:       Noto Sans          14px               130%
 *   Text S:       Noto Sans          12px               130%  (bold = SemiBold)
 *   Text XS:      Noto Sans Regular  10px               130%
 *   Text Label:   Bitter Bold        13px               130%  uppercase  tracking 18%
 */
const variantClasses: Record<TextSize, Record<TextWeight, string>> = {
	xl: {
		regular: 'text-[1.25rem] md:text-[1.375rem] leading-[1.3] font-normal',
		bold: 'text-[1.25rem] md:text-[1.375rem] leading-[1.3] font-bold',
	},
	l: {
		regular: 'text-[1rem] leading-[1.6] font-normal',
		bold: 'text-[1rem] leading-[1.6] font-bold',
	},
	m: {
		regular: 'text-[0.875rem] leading-[1.3] font-normal',
		bold: 'text-[0.875rem] leading-[1.3] font-bold',
	},
	s: {
		regular: 'text-[0.75rem] leading-[1.3] font-normal',
		bold: 'text-[0.75rem] leading-[1.3] font-semibold',
	},
	xs: {
		regular: 'text-[0.625rem] leading-[1.3] font-normal',
		bold: 'text-[0.625rem] leading-[1.3] font-bold',
	},
	label: {
		regular: 'text-[0.8125rem] leading-[1.3] font-bold uppercase tracking-[0.18em]',
		bold: 'text-[0.8125rem] leading-[1.3] font-bold uppercase tracking-[0.18em]',
	},
}

export function Text({ variant = 'm', weight = 'regular', as, secondary, inverted, className, children, href, ...props }: TextProps) {
	const isLabel = variant === 'label'
	const Tag = (as ?? (href ? 'a' : 'p')) as 'p'
	const colorClass = inverted
		? href ? 'text-white/80 hover:text-white underline' : 'text-white'
		: href
		? 'text-npi-text-link hover:text-npi-text-link-hover underline'
		: secondary
		? 'text-npi-text-secondary'
		: 'text-npi-text-primary'
	const fontFamily = isLabel ? 'font-npi-serif' : 'font-npi-sans'

	return (
		<Tag
			className={`${fontFamily} ${variantClasses[variant][isLabel ? 'regular' : weight]} ${colorClass} ${className ?? ''}`}
			{...(href ? { href } : {})}
			{...props}
		>
			{children}
		</Tag>
	)
}
