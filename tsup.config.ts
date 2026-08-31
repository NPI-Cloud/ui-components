import { defineConfig } from 'tsup'

// `bundle: false` mirrors the `src` tree 1:1 in `dist` instead of collapsing it into a single
// chunk. That keeps each file's `'use client'` directive on its own module so the published
// package preserves the React Server Components boundaries the source defines — bundling would
// hoist one directive over the whole library and wrongly mark every server component as client.
export default defineConfig({
	// Tests stay out of the entry globs — they'd ship compiled into `dist`, and the dts pass would
	// have to resolve test-only devDeps the standalone package doesn't carry.
	entry: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/**/*.test.{ts,tsx}'],
	format: ['esm'],
	// No `dts` here: tsup's declaration pass runs on the TypeScript JavaScript compiler API, which
	// TypeScript 7 no longer ships. Declarations come from `tsc -p tsconfig.build.json` instead (see
	// the package's `build` script), which runs after this and writes into the same `dist`.
	bundle: false,
	sourcemap: true,
	clean: true,
	outDir: 'dist',
	target: 'es2022',
})
