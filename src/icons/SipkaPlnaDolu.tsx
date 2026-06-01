import type { SVGProps } from 'react'

// "Šipka plná dolů" — solid filled down-triangle caret. The Figma glyph is a 9.6×4.8 triangle
// centred in a 24px box (inset 40% vertical / 30% horizontal), so it's translated to (7.2, 9.6).
const Path = () => (
	<g transform="translate(7.2 9.6)">
		<path
			d="M9.55396 0.27222C9.55348 0.272563 9.553 0.273249 9.55252 0.273592L4.9945 4.72923C4.9945 4.72923 4.9945 4.72923 4.99402 4.72923C4.97962 4.74328 4.96186 4.75631 4.94074 4.76728C4.8337 4.82282 4.68347 4.80602 4.60571 4.72923H4.60523L0.0452937 0.27222C-0.0319851 0.195423 -0.00798549 0.0884544 0.099053 0.0325704C0.141772 0.0106283 0.191212 0 0.240171 0H9.36004C9.409 0 9.45844 0.0106283 9.50116 0.0325704C9.6082 0.0884544 9.63219 0.195423 9.55396 0.27222V0.27222Z"
			fill="currentColor"
		/>
	</g>
)

export const SipkaPlnaDoluM = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
		<Path />
	</svg>
)

export const SipkaPlnaDoluS = (props: SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" {...props}>
		<Path />
	</svg>
)
