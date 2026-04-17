import type { SVGProps } from 'react'

export const Kompas = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 68 68" fill="none" {...props}>
		<circle cx="34" cy="37" r="1.5" fill="#02216E" stroke="#02216E" />
		<circle cx="34" cy="37" r="28" stroke="#3566FC" strokeWidth="3" />
		<circle cx="3" cy="3" r="3" transform="matrix(1 0 0 -1 31 9)" stroke="#3566FC" strokeWidth="3" />
		<path d="M39.4785 42.4785L20.7715 50.2275L28.5205 31.5205L47.2275 23.7715L39.4785 42.4785Z" stroke="#02216E" strokeWidth="3" />
	</svg>
)
