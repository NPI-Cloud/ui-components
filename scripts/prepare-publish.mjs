// Flattens the `publishConfig` field overrides (main / module / types / exports) into the
// top-level package.json so the published tarball resolves to the built `dist`. The committed
// package.json deliberately keeps `main: src/index.ts` and no `exports`, so in-repo consumers
// (Vite HMR for admin + showcase, Next transpile for websites, tsc project references) keep
// resolving the TypeScript source. bun rewrites `catalog:` / `workspace:` protocols on publish
// but — unlike pnpm — does NOT promote publishConfig fields, so we do it here. Run in CI right
// before `bun publish`; it mutates package.json in place (fine on an ephemeral checkout).
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

// Keep registry-level keys (access / registry / tag) under publishConfig for the publish client.
pkg.publishConfig = publishConfig

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`)
console.log(`prepared ${pkg.name}@${pkg.version} for publish — main → ${pkg.main}`)
