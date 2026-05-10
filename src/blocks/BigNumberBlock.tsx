import { BigNumber, type BigNumberSize } from '../components/BigNumber'

export type BigNumberBlockSize = 'm' | 'l'

export interface BigNumberBlockProps {
	/** Prominent number text — stored on the shared `heading` scalar (e.g. "12 540", "84 %"). */
	value?: string | null
	/** Descriptive caption below the number — stored on the shared `subtitle` scalar. */
	label?: string | null
	prefix?: string | null
	suffix?: string | null
	size?: BigNumberBlockSize | null
}

const sizeMap: Record<BigNumberBlockSize, BigNumberSize> = {
	m: 'M',
	l: 'L',
}

export function BigNumberBlock({ value, label, prefix, suffix, size }: BigNumberBlockProps) {
	return (
		<BigNumber
			value={value || '0'}
			label={label || 'Popis údaje'}
			prefix={prefix || undefined}
			suffix={suffix || undefined}
			size={size ? sizeMap[size] : 'L'}
		/>
	)
}
