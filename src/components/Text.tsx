import { uic } from '../utils/uic'

export const textVariants = ['xl', 'l', 'm', 's', 'xs', 'label'] as const
export const textWeights = ['regular', 'bold'] as const

export type TextSize = (typeof textVariants)[number]
export type TextWeight = (typeof textWeights)[number]

export interface TextSpec {
	size: string
	mobileSize?: string
	lineHeight: number
	font: 'sans' | 'serif'
	defaultWeight: number
	boldWeight?: number
	uppercase?: boolean
	tracking?: string
}

export const textSpecs: Record<TextSize, TextSpec> = {
	xl: { size: '1.375rem', mobileSize: '1.25rem', lineHeight: 1.3, font: 'sans', defaultWeight: 400 },
	l: { size: '1rem', lineHeight: 1.6, font: 'sans', defaultWeight: 400 },
	m: { size: '0.875rem', lineHeight: 1.3, font: 'sans', defaultWeight: 400 },
	s: { size: '0.75rem', lineHeight: 1.3, font: 'sans', defaultWeight: 400, boldWeight: 600 },
	xs: { size: '0.625rem', lineHeight: 1.3, font: 'sans', defaultWeight: 400 },
	label: { size: '0.8125rem', lineHeight: 1.3, font: 'serif', defaultWeight: 700, uppercase: true, tracking: '0.18em' },
}

// Hardcoded so Tailwind v4's source scanner can see the literal arbitrary values and generate CSS for them.
// Must stay in sync with `textSpecs` above.
const variantClasses: Record<TextSize, string> = {
	xl: 'text-[1.25rem] md:text-[1.375rem] leading-[1.3]',
	l: 'text-[1rem] leading-[1.6]',
	m: 'text-[0.875rem] leading-[1.3]',
	s: 'text-[0.75rem] leading-[1.3]',
	xs: 'text-[0.625rem] leading-[1.3]',
	label: 'text-[0.8125rem] leading-[1.3] font-npi-serif font-bold uppercase tracking-[0.18em]',
}

export const Text = uic('p', {
	baseClass: 'font-npi-sans',
	variants: {
		variant: variantClasses,
		weight: {
			regular: 'font-normal',
			bold: 'font-bold',
		},
		secondary: {
			true: 'text-npi-text-secondary',
			false: '',
		},
		inverted: {
			true: 'text-white',
			false: '',
		},
	},
	defaultVariants: {
		variant: 'm',
		weight: 'regular',
		secondary: false,
		inverted: false,
	},
	compoundVariants: [
		{ variant: 's', weight: 'bold', className: 'font-semibold' },
		{ variant: 'label', weight: 'regular', className: 'font-bold' },
		{ variant: 'label', weight: 'bold', className: 'font-bold' },
		{ secondary: false, inverted: false, className: 'text-npi-text-primary' },
	],
	displayName: 'Text',
})

export type TextProps = React.ComponentProps<typeof Text>
