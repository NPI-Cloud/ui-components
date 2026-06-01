'use client'

import { clsx } from 'clsx'
import { forwardRef, type HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export const progressStepStatuses = ['completed', 'current', 'upcoming'] as const
export type ProgressStepStatus = (typeof progressStepStatuses)[number]

export interface ProgressStep {
	/** Step label rendered next to the indicator. */
	label: string
}

export interface ProgressStepsProps extends Omit<HTMLAttributes<HTMLOListElement>, 'children'> {
	/** Ordered list of steps. Each entry renders as one `<li>` indicator + label pair. */
	steps: ProgressStep[]
	/**
	 * Index of the currently active step (1-indexed). Steps before it are `completed`,
	 * the matching step is `current`, and steps after it are `upcoming`.
	 * Out-of-range values are clamped — `0` renders all steps as `upcoming` and a value
	 * larger than `steps.length` renders all steps as `completed`.
	 */
	currentStep: number
	/**
	 * Optional override for per-step status. Receives the 0-based step index and may
	 * return any `ProgressStepStatus`. Use this to render error states or custom flows
	 * that don't follow the linear `currentStep` derivation.
	 */
	getStepStatus?: (index: number) => ProgressStepStatus
}

const indicatorBase = clsx(
	'inline-flex size-npi-10 shrink-0 items-center justify-center rounded-full p-npi-2',
	'font-npi-sans font-bold text-[1rem] leading-[1.5] text-npi-white',
)

const indicatorByStatus: Record<ProgressStepStatus, string> = {
	completed: 'bg-npi-green',
	current: 'bg-npi-blue',
	upcoming: 'bg-npi-gray-400',
}

// Labels wrap freely in the vertical (mobile) rail; only the horizontal desktop layout keeps them on one line.
const labelBase = 'font-npi-sans font-normal text-[1rem] leading-[1.5] @npi-tablet:whitespace-nowrap'

const labelByStatus: Record<ProgressStepStatus, string> = {
	completed: 'text-npi-text-primary',
	current: 'text-npi-text-primary',
	upcoming: 'text-npi-text-secondary',
}

// The connector flips orientation with the container width (see the @container note on the root).
// - Mobile-first base: a 1px vertical rail, centred under the 40px (size-npi-10) indicator via the 20px offset.
// - @npi-tablet (≥768px container): the original horizontal 80px line. A 4-step row wants ~976px, so
//   between 768px and that ideal the line shrinks (floored at npi-2) to absorb the deficit rather than
//   overflow; once the container is wide enough it settles at the full 80px Figma width.
const connectorClasses = clsx(
	'h-npi-6 w-px ms-[20px] my-npi-1 bg-npi-gray-300',
	'@npi-tablet:h-px @npi-tablet:w-npi-20 @npi-tablet:min-w-npi-2 @npi-tablet:ms-0 @npi-tablet:my-0',
)

function deriveStatus(index: number, currentStep: number): ProgressStepStatus {
	const oneBased = index + 1
	if (oneBased < currentStep) return 'completed'
	if (oneBased === currentStep) return 'current'
	return 'upcoming'
}

export const ProgressSteps = forwardRef<HTMLOListElement, ProgressStepsProps>((props, ref) => {
	const { steps, currentStep, getStepStatus, className, ...rest } = props

	// `@container` lives on the wrapper, not the <ol>, because CSS container queries can't self-reference.
	// Base layout is a vertical rail (mobile-friendly for any step count / label length); at @npi-tablet
	// (≥768px container) it flips back to the original horizontal stepper.
	return (
		<div className="@container w-full">
			<ol
				ref={ref}
				className={twMerge(clsx('flex w-full flex-col @npi-tablet:flex-row @npi-tablet:items-center @npi-tablet:gap-npi-4', className))}
				{...rest}
			>
				{steps.map((step, index) => {
					const status = getStepStatus?.(index) ?? deriveStatus(index, currentStep)
					const isLast = index === steps.length - 1

					return (
						<li
							key={index}
							aria-current={status === 'current' ? 'step' : undefined}
							className={clsx(
								'flex w-full flex-col @npi-tablet:w-auto @npi-tablet:min-w-0 @npi-tablet:flex-row @npi-tablet:items-center @npi-tablet:gap-npi-4',
								// Only the connector absorbs horizontal shrink; the last step has none, so it must not shrink
								// (otherwise its fixed-width indicator+label would overflow the row).
								isLast && '@npi-tablet:shrink-0',
							)}
						>
							<div className="flex w-auto items-center gap-npi-4 @npi-tablet:w-npi-40 @npi-tablet:shrink-0">
								<span className={clsx(indicatorBase, indicatorByStatus[status])} aria-hidden="true">
									{status === 'completed'
										? <Icon name="check" size="m" className="size-npi-6" />
										: <span>{index + 1}</span>}
								</span>
								<span className={clsx(labelBase, labelByStatus[status])}>{step.label}</span>
							</div>
							{!isLast && <span aria-hidden="true" className={connectorClasses} />}
						</li>
					)
				})}
			</ol>
		</div>
	)
})
ProgressSteps.displayName = 'ProgressSteps'
