// Ambient declarations so `tsc` accepts raster-image imports. Consumers (Vite) resolve these to URLs.
declare module '*.png' {
	const src: string
	export default src
}
