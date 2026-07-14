'use client'

import { Link } from './ui-primitives'
import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { socialLabel } from './Footer'
import { Text } from './Text'

export interface IconGroupItem {
	/** Platform icon — `facebook`, `linkedIn`, `instagram`, `x`, `youTube`, `spotify`, `applePodcasts`, … */
	icon: IconName
	/** Link target. */
	href: string
	/** Accessible label — defaults to the platform name derived from `icon`. */
	label?: string
	/** Anchor `target` — e.g. `_blank` for share/external links. */
	target?: string
	/** Anchor `rel` — defaults to `noreferrer noopener` when `target` is `_blank`. */
	rel?: string
}

export interface IconGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
	/** Optional leading text label (e.g. `Sdílet`, `Přehrát`). */
	label?: string
	/** Icon links — minimum 1, maximum 4 per the design. */
	items: IconGroupItem[]
}

const itemLinkClass = clsx(
	'inline-flex size-npi-10 items-center justify-center rounded-npi-xxs text-npi-blue @npi-tablet:size-npi-8',
	'transition-colors hover:text-npi-blue-dark active:text-npi-blue-dark',
	'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
)

/**
 * Row of 1–4 icon links — a signpost to social networks and other platforms (e.g. share
 * actions on an article, podcast platform links), optionally introduced by a text label.
 * Icons are 40×40 on mobile and 32×32 from the tablet container breakpoint up.
 */
export const IconGroup = forwardRef<HTMLDivElement, IconGroupProps>(
	({ label, items, className, ...props }, ref) => {
		if (items.length === 0) return null

		return (
			<div
				ref={ref}
				className={twMerge(clsx('flex items-center gap-npi-4 font-npi-sans', className))}
				{...props}
			>
				{label && (
					<Text variant="l" className="whitespace-nowrap">
						{label}
					</Text>
				)}
				<ul role="list" className="flex flex-wrap items-center gap-npi-4">
					{items.map((item, i) => (
						<li key={i} className="flex">
							<Link
							href={item.href}
							target={item.target}
							rel={item.rel ?? (item.target === '_blank' ? 'noreferrer noopener' : undefined)}
							aria-label={item.label ?? socialLabel(item.icon)}
							className={itemLinkClass}
						>
								<Icon name={item.icon} className="size-full" aria-hidden="true" />
							</Link>
						</li>
					))}
				</ul>
			</div>
		)
	},
)
IconGroup.displayName = 'IconGroup'
