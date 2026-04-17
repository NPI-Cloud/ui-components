import { uic } from '../utils/uic'

export const statusIndicatorTones = ['success', 'error'] as const
export type StatusIndicatorTone = (typeof statusIndicatorTones)[number]

export const StatusIndicator = uic('span', {
	baseClass: 'inline-block size-2 shrink-0 rounded-full',
	variants: {
		tone: {
			success: 'bg-npi-green',
			error: 'bg-npi-red',
		},
	},
	defaultVariants: {
		tone: 'success',
	},
	defaultProps: {
		'aria-hidden': 'true',
	},
	displayName: 'StatusIndicator',
})

export type StatusIndicatorProps = React.ComponentProps<typeof StatusIndicator>
