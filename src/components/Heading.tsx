import type { HTMLAttributes } from 'react'

export const headingLevels = [1, 2, 3, 4, 5, 6, 7] as const
export type HeadingLevel = (typeof headingLevels)[number]

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
	level: HeadingLevel
	as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
	inverted?: boolean
}

/*
 * Desktop / Mobile sizes from Figma:
 *   H1: 56/36px  Bitter Regular  120%
 *   H2: 40/32px  Bitter Regular  120%
 *   H3: 32/28px  Bitter Regular  120%
 *   H4: 28/24px  Bitter Regular  120%
 *   H5: 24/22px  Bitter Medium   120%
 *   H6: 20/20px  Bitter Medium   120%
 *   H7: 16/18px  Bitter Bold     120%
 */
const levelClasses: Record<HeadingLevel, string> = {
	1: 'text-[2.25rem] md:text-[3.5rem] font-normal',
	2: 'text-[2rem] md:text-[2.5rem] font-normal',
	3: 'text-[1.75rem] md:text-[2rem] font-normal',
	4: 'text-[1.5rem] md:text-[1.75rem] font-normal',
	5: 'text-[1.375rem] md:text-[1.5rem] font-medium',
	6: 'text-[1.25rem] md:text-[1.25rem] font-medium',
	7: 'text-[1.125rem] md:text-[1rem] font-bold',
}

const defaultTag: Record<HeadingLevel, string> = {
	1: 'h1',
	2: 'h2',
	3: 'h3',
	4: 'h4',
	5: 'h5',
	6: 'h6',
	7: 'h6',
}

export function Heading({ level, as, inverted, className, children, ...props }: HeadingProps) {
	const Tag = (as ?? defaultTag[level]) as 'h1'

	return (
		<Tag
			className={`font-npi-serif leading-[1.2] ${inverted ? 'text-white' : 'text-npi-text-primary'} ${levelClasses[level]} ${className ?? ''}`}
			{...props}
		>
			{children}
		</Tag>
	)
}
