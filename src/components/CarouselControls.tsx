'use client'

import { clsx } from 'clsx'
import { forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface CarouselControlsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
	/** Total number of slides */
	total: number
	/** Currently active slide index (0-based) */
	current: number
	/** Called when the user clicks the previous button */
	onPrevious: () => void
	/** Called when the user clicks the next button */
	onNext: () => void
	/** Called when the user clicks an indicator bar */
	onSelect: (index: number) => void
	/** aria-label for the previous button */
	previousLabel?: string
	/** aria-label for the next button */
	nextLabel?: string
	/** aria-label for each indicator — receives the slide index */
	slideLabel?: (index: number) => string
}

const arrowButtonClass = [
	'inline-flex size-npi-10 shrink-0 items-center justify-center rounded-full bg-npi-white border border-npi-gray-200 text-npi-text-primary transition-colors cursor-pointer',
	'hover:border-npi-blue-hover hover:text-npi-blue-hover',
	'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
	'disabled:cursor-not-allowed disabled:border-npi-gray-200 disabled:text-npi-gray-300',
].join(' ')

export const CarouselControls = forwardRef<HTMLDivElement, CarouselControlsProps>(
	({
		total,
		current,
		onPrevious,
		onNext,
		onSelect,
		previousLabel = 'Předchozí',
		nextLabel = 'Další',
		slideLabel,
		className,
		...props
	}, ref) => {
		return (
			<div
				ref={ref}
				className={twMerge(clsx('inline-flex items-center justify-between min-w-[224px] gap-npi-2', className))}
				{...props}
			>
				<button
					type="button"
					onClick={onPrevious}
					disabled={current <= 0}
					aria-label={previousLabel}
					className={arrowButtonClass}
				>
					<Icon name="arrowVlevo" className="size-6" />
				</button>
				<div className="flex items-center gap-npi-2" role="tablist" aria-label="Stránky">
					{Array.from({ length: total }, (_, i) => {
						const isActive = i === current
						return (
							<button
								key={i}
								type="button"
								role="tab"
								aria-selected={isActive}
								aria-label={slideLabel?.(i) ?? `Stránka ${i + 1}`}
								onClick={() => onSelect(i)}
								className={twMerge(clsx(
									'h-[2px] rounded-full transition-all cursor-pointer',
									isActive ? 'w-npi-10 bg-npi-blue hover:bg-npi-blue-hover' : 'w-npi-4 bg-npi-gray-300 hover:bg-npi-blue-hover',
									'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-npi-blue-light',
								))}
							/>
						)
					})}
				</div>
				<button
					type="button"
					onClick={onNext}
					disabled={current >= total - 1}
					aria-label={nextLabel}
					className={arrowButtonClass}
				>
					<Icon name="arrowVpravo" className="size-6" />
				</button>
			</div>
		)
	},
)
CarouselControls.displayName = 'CarouselControls'
