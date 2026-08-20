# @npicz/ui-components

## 0.2.0

### Minor Changes

- 7ce17a7: Add `loading` to Button — a busy state that keeps the variant's colors, shows a spinner before the label and blocks clicks (`aria-busy`/`aria-disabled`), instead of misusing the gray `disabled` look for in-flight actions.
- 127fc2f: Add CheckboxVisual and RadioVisual — embeddable check/radio visuals without an input, for rows that are themselves interactive.
- 64facb7: Add `hideRequiredIndicator` to Input — keep `required` semantics without the per-field asterisk, for forms whose whole step is required.

### Patch Changes

- 66cb50e: Input forwards `required` to the native input — the prop was asterisk-only, silently dropping browser form validation for consumers who relied on it.

## 0.1.0

### Minor Changes

- c7ba47b: Initial public release of the NPI design system component library — blocks,
  components, icons, illustrations and Tailwind v4 design tokens. Ships ESM with
  preserved `"use client"` directives and bundled CSS token layers
  (`styles.css`, `npi-tokens.css`, `npi-theme.css`).
