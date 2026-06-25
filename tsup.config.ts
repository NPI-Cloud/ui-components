import { defineConfig } from 'tsup'

// `bundle: false` mirrors the `src` tree 1:1 in `dist` instead of collapsing it into a single
// chunk. That keeps each file's `'use client'` directive on its own module so the published
// package preserves the React Server Components boundaries the source defines — bundling would
// hoist one directive over the whole library and wrongly mark every server component as client.
export default defineConfig({
	entry: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
	format: ['esm'],
	// The package tsconfig is `composite` for the monorepo's project references, which a
	// standalone dts emit can't satisfy (it demands every file be listed). Override those flags
	// for the publish build so tsup emits declarations straight from the entry globs.
	dts: {
		compilerOptions: {
			composite: false,
			incremental: false,
			ignoreDeprecations: '6.0',
		},
	},
	bundle: false,
	sourcemap: true,
	clean: true,
	outDir: 'dist',
	target: 'es2022',
})
