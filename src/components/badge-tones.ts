// Tone list lives apart from `Badge` so server code can validate a stored tone without pulling in
// the client component. Must stay in sync with the `tone` variants in `Badge.tsx`.
export const badgeTones = ['success', 'error', 'warning', 'info', 'informative', 'neutral', 'neutral-solid'] as const
export type BadgeTone = (typeof badgeTones)[number]
