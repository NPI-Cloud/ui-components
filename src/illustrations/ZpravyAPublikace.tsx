import type { SVGProps } from 'react'

export const ZpravyAPublikace = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" fill="none" {...props}>
		<path d="M34 44H3V50H38" stroke="#02216E" strokeWidth="3" />
		<path d="M38 44H7V15H48V27.5" stroke="#02216E" strokeWidth="3" />
		<circle cx="29" cy="20" r="1.5" fill="#02216E" stroke="#02216E" />
		<path d="M65 27.5L65 65L43 65C40.2386 65 38 62.7614 38 60L38 27.5L65 27.5Z" stroke="#3566FC" strokeWidth="3" />
		<path d="M38 60C38 57.2386 40.2386 55 43 55H65V65H43C40.2386 65 38 62.7614 38 60Z" stroke="#02216E" strokeWidth="3" />
		<path d="M45 41H59" stroke="#3566FC" strokeWidth="3" strokeLinecap="square" />
		<path d="M45 34H59" stroke="#3566FC" strokeWidth="3" strokeLinecap="square" />
	</svg>
)
