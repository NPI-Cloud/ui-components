import type { ButtonHTMLAttributes } from 'react'

export const buttonVariants = ['primary', 'secondary', 'outline'] as const
export const buttonSizes = ['sm', 'md', 'lg'] as const

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: (typeof buttonVariants)[number]
	size?: (typeof buttonSizes)[number]
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
	primary: 'bg-npi-blue text-white hover:bg-npi-blue-dark',
	secondary: 'bg-npi-gray-100 text-npi-gray-900 hover:bg-npi-gray-200',
	outline: 'border border-npi-gray-300 bg-transparent text-npi-gray-700 hover:bg-npi-gray-50',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
	sm: 'px-3 py-1.5 text-[length:var(--npi-font-size-sm)]',
	md: 'px-5 py-2.5 text-[length:var(--npi-font-size-base)]',
	lg: 'px-7 py-3.5 text-[length:var(--npi-font-size-lg)]',
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
	return (
		<button
			className={`inline-flex items-center justify-center rounded-xs font-npi-sans font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${
				variantClasses[variant]
			} ${sizeClasses[size]} ${className ?? ''}`}
			{...props}
		>
			{children}
		</button>
	)
}
