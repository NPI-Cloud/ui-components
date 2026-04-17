import { clsx } from 'clsx'
import { forwardRef, Fragment } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Heading } from './Heading'
import { Text } from './Text'

export const cardAspects = ['16/9', '1/1', '4/3', '3/2', '3/4'] as const
export type CardAspect = (typeof cardAspects)[number]

export const cardIndicators = ['video', 'podcast', 'gallery'] as const
export type CardIndicator = (typeof cardIndicators)[number]

const aspectClassMap: Record<CardAspect, string> = {
	'16/9': 'aspect-[16/9]',
	'1/1': 'aspect-square',
	'4/3': 'aspect-[4/3]',
	'3/2': 'aspect-[3/2]',
	'3/4': 'aspect-[3/4]',
}

const indicatorIconMap: Record<CardIndicator, IconName> = {
	video: 'video',
	podcast: 'podcast',
	gallery: 'galery',
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
	/** Main heading */
	title: string
	/** Small caps label shown above the title */
	label?: string
	/** Meta info shown below the title, separated by bullets */
	meta?: string[]
	/** Body description text */
	description?: string
	/** Content for the visual area (image, video, etc.) */
	visual?: React.ReactNode
	/** Aspect ratio of the visual area. Only applies when card is in narrow/vertical layout */
	aspect?: CardAspect
	/** Hide the visual area entirely */
	hideVisual?: boolean
	/** Render a white-circle badge (bottom-right of visual area) with a media-type icon */
	indicator?: CardIndicator
	/** If provided, renders the whole card as a link with hover state */
	href?: string
	/** Drop the light drop-shadow for placement on dark backgrounds */
	inverted?: boolean
	/** Additional content rendered after the description (tags, CTAs, etc.) */
	children?: React.ReactNode
}

// @container makes the Card responsive to its own width.
// @md (≥28rem / 448px) → horizontal layout (M)
// @4xl (≥56rem / 896px) → wider visual (L)
const rootClass = '@container flex w-full flex-col overflow-hidden rounded-npi-s bg-npi-white transition-shadow @md:flex-row'
const rootShadowClass = 'shadow-npi-m hover:shadow-npi-m-hover'

export const Card = forwardRef<HTMLElement, CardProps>(({
	title,
	label,
	meta,
	description,
	visual,
	aspect = '16/9',
	hideVisual = false,
	indicator,
	href,
	inverted = false,
	children,
	className,
	...props
}, ref) => {
	const Root = href ? 'a' : 'article'

	return (
		<Root
			ref={ref as React.Ref<HTMLElement & HTMLAnchorElement>}
			className={twMerge(
				clsx(
					rootClass,
					!inverted && rootShadowClass,
					href && 'cursor-pointer no-underline',
					className,
				),
			)}
			{...(href ? { href } : {})}
			{...props}
		>
			{!hideVisual && (
				<div
					className={clsx(
						'relative flex items-end justify-end bg-npi-blue-dark p-npi-2',
						// Narrow (S): full-width with caller-provided aspect
						'w-full',
						aspectClassMap[aspect],
						// @md (M): fixed 200×267 visual on the left
						'@md:w-npi-50 @md:shrink-0 @md:aspect-[3/4]',
						// @4xl (L): wider 400px / 16:9 visual
						'@4xl:w-[400px] @4xl:aspect-[16/9]',
					)}
				>
					{visual}
					{indicator && (
						<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-npi-white p-npi-1 text-npi-blue">
							<Icon name={indicatorIconMap[indicator]} className="size-6" />
						</span>
					)}
				</div>
			)}
			<div className="flex w-full flex-col items-start gap-npi-4 px-npi-6 pt-npi-6 pb-npi-8 @md:flex-1 @md:p-npi-8">
				{label && <Text variant="label">{label}</Text>}
				<Heading level={5} className="text-npi-blue">
					{title}
				</Heading>
				{meta && meta.length > 0 && (
					<div className="flex w-full items-center gap-2.5">
						{meta.map((item, i) => (
							<Fragment key={i}>
								{i > 0 && <span aria-hidden className="block size-1.5 shrink-0 rounded-full bg-npi-gray-300" />}
								<Text variant="l" secondary className="whitespace-nowrap">
									{item}
								</Text>
							</Fragment>
						))}
					</div>
				)}
				{description && <Text variant="l">{description}</Text>}
				{children}
			</div>
		</Root>
	)
})
Card.displayName = 'Card'
