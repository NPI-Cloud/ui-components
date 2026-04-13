import type { SVGProps } from 'react'

export const Video = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
		<rect x="1" y="4" width="22" height="16" rx="1" stroke="currentColor" strokeWidth="2"/>
<path d="M17 12L9 17L9 7L17 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
	</svg>
)
