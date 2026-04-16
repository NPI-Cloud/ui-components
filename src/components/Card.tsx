import { clsx } from 'clsx'
import { forwardRef, Fragment } from 'react'
import { twMerge } from 'tailwind-merge'

export const cardAspects = ['16/9', '1/1', '4/3', '3/2', '3/4'] as const
export type CardAspect = (typeof cardAspects)[number]

const aspectClassMap: Record<CardAspect, string> = {
	'16/9': 'aspect-[16/9]',
	'1/1': 'aspect-square',
	'4/3': 'aspect-[4/3]',
	'3/2': 'aspect-[3/2]',
	'3/4': 'aspect-[3/4]',
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Small caps label shown above the title */
	label?: string
	/** Main heading */
	title: string
	/** Meta info shown below the title, separated by bullets */
	meta?: string[]
	/** Body description text */
	description?: string
	/** Content for the visual area (image, video, indicator, etc.) */
	visual?: React.ReactNode
	/** Aspect ratio of the visual area */
	aspect?: CardAspect
	/** Hide the visual area entirely */
	hideVisual?: boolean
	/** Additional content rendered after the description (tags, CTAs, etc.) */
	children?: React.ReactNode
}

export const Card = forwardRef<HTMLElement, CardProps>(({
	label,
	title,
	meta,
	description,
	visual,
	aspect = '16/9',
	hideVisual = false,
	children,
	className,
	...props
}, ref) => (
	<article
		ref={ref}
		className={twMerge(
			clsx(
				'flex w-full flex-col items-start overflow-hidden rounded-npi-s bg-npi-white shadow-npi-m',
				className,
			),
		)}
		{...props}
	>
		{!hideVisual && (
			<div
				className={clsx(
					'relative flex w-full items-end justify-end bg-npi-blue-dark p-npi-2',
					aspectClassMap[aspect],
				)}
			>
				{visual}
			</div>
		)}
		<div className="flex w-full flex-col items-start gap-npi-4 px-npi-6 pt-npi-6 pb-npi-8">
			{label && (
				<p className="font-npi-serif text-[0.8125rem] leading-[1.3] font-bold uppercase tracking-[0.18em] text-npi-text-primary">
					{label}
				</p>
			)}
			<h3 className="font-npi-serif text-[1.375rem] leading-[1.2] font-medium text-npi-blue md:text-[1.5rem]">
				{title}
			</h3>
			{meta && meta.length > 0 && (
				<div className="flex w-full items-center gap-2.5">
					{meta.map((item, i) => (
						<Fragment key={i}>
							{i > 0 && <span aria-hidden className="block size-1.5 shrink-0 rounded-full bg-npi-gray-300" />}
							<span className="whitespace-nowrap font-npi-sans text-[1rem] leading-[1.4] text-npi-text-secondary">
								{item}
							</span>
						</Fragment>
					))}
				</div>
			)}
			{description && (
				<p className="font-npi-sans text-[1rem] leading-[1.4] text-npi-text-primary">
					{description}
				</p>
			)}
			{children}
		</div>
	</article>
))
Card.displayName = 'Card'
