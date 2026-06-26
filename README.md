# @npicz/ui-components

The NPI design system as a React component library — blocks, components, icons,
illustrations and design tokens. Built with Tailwind CSS v4.

> This repository is a **read-only mirror**. Development happens in the NPI
> monorepo; the package is mirrored here and published to npm from there.

## Install

```sh
npm install @npicz/ui-components
```

### Peer dependencies

You provide these in your app:

- **React** `>=19` (`react`, `react-dom`)
- **Tailwind CSS** `^4`

## Usage

Import the design tokens once (e.g. in your global stylesheet), then use the
components:

```css
/* app.css */
@import "tailwindcss";
@import "@npicz/ui-components/styles.css";

/* Tailwind v4 only scans your own files by default. Add the package so the
   utility classes the components use are generated: */
@source "../node_modules/@npicz/ui-components/dist";
```

```tsx
import { ButtonBlock, Heading } from "@npicz/ui-components"

export function Example() {
	return (
		<section>
			<Heading level={2}>Hello</Heading>
			<ButtonBlock label="Get started" url="/start" variant="primary" />
		</section>
	)
}
```

`styles.css` is a convenience that re-exports both token layers. You can import
them individually instead:

```css
@import "@npicz/ui-components/npi-tokens.css"; /* raw design tokens */
@import "@npicz/ui-components/npi-theme.css";  /* Tailwind @theme mapping */
```

### Server Components

The package ships ESM with per-file `"use client"` directives preserved, so it
works in React Server Components / the Next.js App Router out of the box —
client components stay client, server-renderable ones stay server.

### Favicons

The NPI favicon set is bundled and resolvable as static assets:

```
@npicz/ui-components/favicons/favicon.svg
```

## License

[MIT](./LICENSE) © Národní pedagogický institut České republiky
