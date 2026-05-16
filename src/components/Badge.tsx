'use client'

import { uic } from '../utils/uic'

export const badgeTones = ['success', 'error', 'warning', 'info', 'neutral', 'neutral-solid'] as const
export type BadgeTone = (typeof badgeTones)[number]

export const Badge = uic('span', {
	baseClass: 'inline-flex items-center rounded-npi-xxs px-[10px] py-npi-1 font-npi-sans text-[0.75rem] leading-[1.3] font-semibold',
	variants: {
		tone: {
			success: 'border-2 border-npi-green text-npi-green',
			error: 'border-2 border-npi-red text-npi-red',
			warning: 'border-2 border-npi-yellow text-npi-text-primary',
			info: 'border-2 border-npi-purple text-npi-purple',
			neutral: 'border-2 border-npi-gray-400 text-npi-gray-700',
			'neutral-solid': 'bg-npi-gray-200 text-npi-gray-700',
		},
	},
	defaultVariants: {
		tone: 'neutral',
	},
	displayName: 'Badge',
})

export type BadgeProps = React.ComponentProps<typeof Badge>
