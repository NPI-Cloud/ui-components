import { Text, type TextSize, type TextWeight } from '../components/Text.js'

type TextBlockVariant = TextSize

export interface TextBlockProps {
	variant?: TextBlockVariant | null
	weight?: TextWeight | null
	content?: string | null
}

export function TextBlock({ variant, weight, content }: TextBlockProps) {
	return (
		<Text variant={variant ?? 'l'} weight={weight ?? 'regular'}>
			{content || 'Textový blok'}
		</Text>
	)
}
