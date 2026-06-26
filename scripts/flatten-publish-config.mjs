// Promotes the publishConfig field overrides (main / module / types / exports / bin) to the
// top-level package.json so the published package resolves to the built `dist`. The committed
// package.json deliberately keeps `main: src/index.ts` and no top-level `exports`, so the monorepo
// consumers (Vite HMR, Next transpile, tsc project references) resolve the TypeScript source —
// and so the mirror stays a faithful, splitsh-lite-friendly copy of that source. This runs only in
// the mirror's publish workflow, in the CI runner, right before `npm publish`; it is never
// committed. (npm, unlike pnpm, doesn't promote publishConfig itself.)
import { readFileSync, writeFileSync } from 'node:fs'

const pkgPath = new URL('../package.json', import.meta.url)
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const publishConfig = { ...(pkg.publishConfig ?? {}) }

for (const field of ['main', 'module', 'types', 'exports', 'bin']) {
	if (publishConfig[field] !== undefined) {
		pkg[field] = publishConfig[field]
		delete publishConfig[field]
	}
}

pkg.publishConfig = publishConfig // keep registry-level keys (access)

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`)
console.log(`flattened publishConfig for ${pkg.name}@${pkg.version} — main → ${pkg.main}`)
