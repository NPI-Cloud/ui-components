'use client'

import { cva } from 'class-variance-authority'
import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { useInverted } from '../utils/inverted-context'

export const headingLevels = [1, 2, 3, 4, 5, 6, 7] as const
export type HeadingLevel = (typeof headingLevels)[number]

export interface HeadingSpec {
	desktop: { size: string; weight: number }
	mobile: { size: string; weight: number }
	lineHeight: number
}

// Responsive switch happens at the `npi-tablet` breakpoint (768px).
export const headingSpecs: Record<HeadingLevel, HeadingSpec> = {
	1: { desktop: { size: '3.5rem', weight: 400 }, mobile: { size: '2.25rem', weight: 400 }, lineHeight: 1.2 },
	2: { desktop: { size: '2.5rem', weight: 400 }, mobile: { size: '2rem', weight: 400 }, lineHeight: 1.2 },
	3: { desktop: { size: '2rem', weight: 400 }, mobile: { size: '1.75rem', weight: 400 }, lineHeight: 1.2 },
	4: { desktop: { size: '1.75rem', weight: 400 }, mobile: { size: '1.5rem', weight: 400 }, lineHeight: 1.2 },
	5: { desktop: { size: '1.5rem', weight: 500 }, mobile: { size: '1.375rem', weight: 400 }, lineHeight: 1.2 },
	6: { desktop: { size: '1.25rem', weight: 500 }, mobile: { size: '1.25rem', weight: 500 }, lineHeight: 1.2 },
	7: { desktop: { size: '1rem', weight: 700 }, mobile: { size: '1.125rem', weight: 700 }, lineHeight: 1.2 },
}

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
	level: HeadingLevel
	inverted?: boolean
}

// Hardcoded so Tailwind v4's source scanner can see the literal arbitrary values and generate CSS for them.
// Must stay in sync with `headingSpecs` above.
const levelClasses: Record<HeadingLevel, string> = {
	1: 'text-[2.25rem] @npi-tablet:text-[3.5rem] leading-[1.2] font-normal',
	2: 'text-[2rem] @npi-tablet:text-[2.5rem] leading-[1.2] font-normal',
	3: 'text-[1.75rem] @npi-tablet:text-[2rem] leading-[1.2] font-normal',
	4: 'text-[1.5rem] @npi-tablet:text-[1.75rem] leading-[1.2] font-normal',
	5: 'text-[1.375rem] @npi-tablet:text-[1.5rem] leading-[1.2] font-normal @npi-tablet:font-medium',
	6: 'text-[1.25rem] @npi-tablet:text-[1.25rem] leading-[1.2] font-medium',
	7: 'text-[1.125rem] @npi-tablet:text-[1rem] leading-[1.2] font-bold',
}

const headingCva = cva('font-npi-serif', {
	variants: {
		level: levelClasses,
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
	const resolvedInverted = useInverted(inverted)
	const Tag = tagMap[level]
	return <Tag ref={ref} className={twMerge(clsx(headingCva({ level, inverted: resolvedInverted }), className))} {...props} />
})
Heading.displayName = 'Heading'
