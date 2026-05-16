'use client'

import { Button } from '../components/Button'
import { type IconName, iconRegistryM } from '../icons'

export type ButtonBlockVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiarySmall' | 'icon'

export interface ButtonBlockProps {
	label?: string | null
	url?: string | null
	variant?: ButtonBlockVariant | null
	inverted?: boolean | null
	disabled?: boolean | null
	iconBefore?: string | null
	iconAfter?: string | null
}

const variantMap: Record<ButtonBlockVariant, 'primary' | 'secondary' | 'tertiary' | 'tertiary-s' | 'icon'> = {
	primary: 'primary',
	secondary: 'secondary',
	tertiary: 'tertiary',
	tertiarySmall: 'tertiary-s',
	icon: 'icon',
}

const toIconName = (raw: string | null | undefined): IconName | undefined => raw && raw in iconRegistryM ? raw as IconName : undefined

export function ButtonBlock({ label, url, variant, inverted, disabled, iconBefore, iconAfter }: ButtonBlockProps) {
	return (
		<Button
			label={label || 'Tlačítko'}
			href={url || undefined}
			variant={variant ? variantMap[variant] : 'primary'}
			inverted={inverted ?? false}
			disabled={disabled ?? false}
			iconBefore={toIconName(iconBefore)}
			iconAfter={toIconName(iconAfter)}
		/>
	)
}
