import type { SVGProps } from 'react'

export const Layout = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
		<path fillRule="evenodd" clipRule="evenodd" d="M5 3C4.44772 3 4 3.44771 4 4L4 22H9L9 13.001C9 13.0007 9 13.0013 9 13.001C9 13.0007 9 12.9993 9 12.999L9 3L5 3ZM11 3V12L20 12V4C20 3.44772 19.5523 3 19 3L11 3ZM22 4C22 2.34315 20.6569 1 19 1L5 1C3.34315 1 2 2.34314 2 4L2 22C2 23.1046 2.89543 24 4 24H9.99844C9.99896 24 9.99948 24 10 24C10.0005 24 10.001 24 10.0016 24L20 24C21.1046 24 22 23.1046 22 22L22 4ZM20 14L11 14V22L20 22V14Z" fill="currentColor"/>
	</svg>
)
