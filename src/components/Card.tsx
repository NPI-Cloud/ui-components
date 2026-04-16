import { clsx } from 'clsx'
import { forwardRef, Fragment } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Heading } from './Heading'
import { Text } from './Text'

export const cardSizes = ['S', 'M', 'L'] as const
export type CardSize = (typeof cardSizes)[number]

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
	/** Size variant: S (vertical), M/L (horizontal with visual on the left) */
	size?: CardSize
	/** Small caps label shown above the title */
	label?: string
	/** Meta info shown below the title, separated by bullets */
	meta?: string[]
	/** Body description text */
	description?: string
	/** Content for the visual area (image, video, etc.) */
	visual?: React.ReactNode
	/** Aspect ratio of the visual area. Only applies to size 'S' (M/L use fixed dimensions) */
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

const rootClass = 'flex w-full overflow-hidden rounded-npi-s bg-npi-white transition-shadow'
const rootShadowClass = 'shadow-npi-m hover:shadow-npi-m-hover'

const sizeDirectionClass: Record<CardSize, string> = {
	S: 'flex-col',
	M: 'flex-row',
	L: 'flex-row',
}

const contentClass: Record<CardSize, string> = {
	S: 'flex flex-col items-start gap-npi-4 px-npi-6 pt-npi-6 pb-npi-8 w-full',
	M: 'flex flex-col items-start gap-npi-4 p-npi-8 flex-1',
	L: 'flex flex-col items-start gap-npi-4 p-npi-8 flex-1',
}

const visualSizeClass: Record<CardSize, (aspect: CardAspect) => string> = {
	S: aspect => clsx('w-full', aspectClassMap[aspect]),
	M: () => 'w-npi-50 aspect-[3/4] shrink-0',
	L: () => 'w-[400px] aspect-[16/9] shrink-0',
}

export const Card = forwardRef<HTMLElement, CardProps>(({
	title,
	size = 'S',
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
	const titleLevel = size === 'L' ? 4 : 5
	const Root = href ? 'a' : 'article'

	return (
		<Root
			ref={ref as React.Ref<HTMLElement & HTMLAnchorElement>}
			className={twMerge(
				clsx(
					rootClass,
					sizeDirectionClass[size],
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
						visualSizeClass[size](aspect),
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
			<div className={contentClass[size]}>
				{label && <Text variant="label">{label}</Text>}
				<Heading level={titleLevel} className="text-npi-blue">
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
