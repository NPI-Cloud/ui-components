import type { SVGProps } from 'react'

// Path sourced verbatim from Figma's filled star asset (viewBox 22×21).
// We re-use the same artwork at both M and S sizes — SVG paths scale.
const StarPath = () => (
	<path
		d="M10.2166 0.509011C10.5182 -0.16967 11.4818 -0.169671 11.7834 0.509011L14.3204 6.21823C14.445 6.49847 14.7098 6.69083 15.0149 6.72262L21.2306 7.37041C21.9695 7.44741 22.2672 8.36348 21.7147 8.85993L17.067 13.0362C16.8389 13.2412 16.7377 13.5524 16.8018 13.8523L18.1062 19.9619C18.2613 20.6882 17.4818 21.2543 16.8387 20.8825L11.4292 17.7543C11.1637 17.6008 10.8363 17.6008 10.5708 17.7543L5.16129 20.8825C4.51823 21.2543 3.73871 20.6882 3.89378 19.9619L5.19824 13.8523C5.26227 13.5524 5.1611 13.2412 4.93297 13.0362L0.285254 8.85993C-0.267241 8.36348 0.0305096 7.44741 0.769399 7.37041L6.9851 6.72262C7.2902 6.69083 7.55505 6.49847 7.67958 6.21823L10.2166 0.509011Z"
		fill="currentColor"
	/>
)

export const HvezdaFillM = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 21" fill="none" preserveAspectRatio="xMidYMid meet" {...props}>
		<StarPath />
	</svg>
)

export const HvezdaFillS = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 21" fill="none" preserveAspectRatio="xMidYMid meet" {...props}>
		<StarPath />
	</svg>
)
