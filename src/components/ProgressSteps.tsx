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

const labelBase = 'font-npi-sans font-normal text-[1rem] leading-[1.5] whitespace-nowrap'

const labelByStatus: Record<ProgressStepStatus, string> = {
	completed: 'text-npi-text-primary',
	current: 'text-npi-text-primary',
	upcoming: 'text-npi-text-secondary',
}

const connectorClasses = 'h-px w-npi-20 shrink-0 bg-npi-gray-300'

function deriveStatus(index: number, currentStep: number): ProgressStepStatus {
	const oneBased = index + 1
	if (oneBased < currentStep) return 'completed'
	if (oneBased === currentStep) return 'current'
	return 'upcoming'
}

export const ProgressSteps = forwardRef<HTMLOListElement, ProgressStepsProps>((props, ref) => {
	const { steps, currentStep, getStepStatus, className, ...rest } = props

	return (
		<ol
			ref={ref}
			className={twMerge(clsx('inline-flex items-center gap-npi-4', className))}
			{...rest}
		>
			{steps.map((step, index) => {
				const status = getStepStatus?.(index) ?? deriveStatus(index, currentStep)
				const isLast = index === steps.length - 1

				return (
					<li
						key={index}
						aria-current={status === 'current' ? 'step' : undefined}
						className="inline-flex items-center gap-npi-4"
					>
						<div className="inline-flex w-npi-40 items-center gap-npi-4">
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
	)
})
ProgressSteps.displayName = 'ProgressSteps'
