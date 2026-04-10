import { uic } from '../utils/uic'

export const textVariants = ['xl', 'l', 'm', 's', 'xs', 'label'] as const
export const textWeights = ['regular', 'bold'] as const

export type TextSize = (typeof textVariants)[number]
export type TextWeight = (typeof textWeights)[number]

export const Text = uic('p', {
	baseClass: 'font-npi-sans',
	variants: {
		variant: {
			xl: 'text-[1.25rem] md:text-[1.375rem] leading-[1.3]',
			l: 'text-[1rem] leading-[1.6]',
			m: 'text-[0.875rem] leading-[1.3]',
			s: 'text-[0.75rem] leading-[1.3]',
			xs: 'text-[0.625rem] leading-[1.3]',
			label: 'font-npi-serif text-[0.8125rem] leading-[1.3] font-bold uppercase tracking-[0.18em]',
		},
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
