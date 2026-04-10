import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

export const headingLevels = [1, 2, 3, 4, 5, 6, 7] as const
export type HeadingLevel = (typeof headingLevels)[number]

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
	level: HeadingLevel
	inverted?: boolean
}

const headingCva = cva('font-npi-serif leading-[1.2]', {
	variants: {
		level: {
			1: 'text-[2.25rem] md:text-[3.5rem] font-normal',
			2: 'text-[2rem] md:text-[2.5rem] font-normal',
			3: 'text-[1.75rem] md:text-[2rem] font-normal',
			4: 'text-[1.5rem] md:text-[1.75rem] font-normal',
			5: 'text-[1.375rem] md:text-[1.5rem] font-medium',
			6: 'text-[1.25rem] md:text-[1.25rem] font-medium',
			7: 'text-[1.125rem] md:text-[1rem] font-bold',
		},
		inverted: {
			true: 'text-white',
			false: 'text-npi-text-primary',
		},
	},
	defaultVariants: {
		level: 2,
		inverted: false,
	},
})

const tagMap: Record<HeadingLevel, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
	1: 'h1',
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h5',
	6: 'h6',
	7: 'h6',
}

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(({ level, inverted, className, ...props }, ref) => {
	const Tag = tagMap[level]
	return <Tag ref={ref} className={twMerge(clsx(headingCva({ level, inverted }), className))} {...props} />
})
Heading.displayName = 'Heading'
