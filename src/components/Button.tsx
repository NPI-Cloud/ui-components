import { uic } from '../utils/uic'

export const buttonVariants = ['primary', 'secondary', 'outline'] as const
export const buttonSizes = ['sm', 'md', 'lg'] as const

export const Button = uic('button', {
	baseClass:
		'inline-flex items-center justify-center rounded-npi-xs font-npi-sans font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50',
	variants: {
		variant: {
			primary: 'bg-npi-blue text-white hover:bg-npi-blue-dark',
			secondary: 'bg-npi-gray-100 text-npi-gray-900 hover:bg-npi-gray-200',
			outline: 'border border-npi-gray-300 bg-transparent text-npi-gray-700 hover:bg-npi-gray-50',
		},
		size: {
			sm: 'px-3 py-1.5 text-[length:var(--npi-font-size-sm)]',
			md: 'px-5 py-2.5 text-[length:var(--npi-font-size-base)]',
			lg: 'px-7 py-3.5 text-[length:var(--npi-font-size-lg)]',
		},
	},
	defaultVariants: {
		variant: 'primary',
		size: 'md',
	},
	displayName: 'Button',
})

export type ButtonProps = React.ComponentProps<typeof Button>
