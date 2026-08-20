// Opt-in GTM click measurement for authored CTAs (buttons, downloads). A component receives the
// fully resolved event payload — fallbacks (visible label, default type) are applied by the data
// layer that shapes it — and pushes it on click. Where no dataLayer exists (SSR, the admin canvas,
// sites without GTM) the push is a no-op.

export interface CtaTracking {
	/** `cta.text` of the pushed event — the authored override or the CTA's visible label. */
	text: string
	/** `cta.type` of the pushed event — the authored override or the CTA kind ('button' / 'download'). */
	type: string
}

declare global {
	interface Window {
		dataLayer?: unknown[]
	}
}

export const pushCtaClick = (tracking: CtaTracking | null | undefined): void => {
	if (!tracking || typeof window === 'undefined') return
	window.dataLayer?.push({ event: 'cta_click', cta: { text: tracking.text, type: tracking.type } })
}

/** The authored override columns of an opt-in tracked CTA; null when tracking is off. */
export interface CtaTrackingInput {
	type?: string | null
	text?: string | null
}

/**
 * Resolve the authored overrides into the event payload — the override wins, the CTA's visible
 * label and its kind ('button' / 'download') fill the gaps. Null in → null out (tracking off).
 */
export const resolveCtaTracking = (
	input: CtaTrackingInput | null | undefined,
	fallbackText: string | null | undefined,
	defaultType: string,
): CtaTracking | null =>
	input ? { text: input.text?.trim() || fallbackText || '', type: input.type?.trim() || defaultType } : null
