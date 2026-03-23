import type { TextVariant } from '../types.js'

export interface TextBlockProps {
	textVariant: TextVariant
	content: string
}

export function TextBlock({ textVariant, content }: TextBlockProps) {
	switch (textVariant) {
		case 'heading':
			return (
				<h2 className="font-npi-sans text-[length:var(--npi-font-size-3xl)] font-bold leading-tight text-npi-gray-900">
					{content}
				</h2>
			)
		case 'list':
			return (
				<ul className="font-npi-sans text-[length:var(--npi-font-size-base)] leading-relaxed text-npi-gray-700 list-disc pl-6 space-y-1">
					{content.split('\n').filter(Boolean).map((item, i) => <li key={i}>{item}</li>)}
				</ul>
			)
		case 'paragraph':
		default:
			return (
				<p className="font-npi-sans text-[length:var(--npi-font-size-base)] leading-relaxed text-npi-gray-700">
					{content}
				</p>
			)
	}
}
