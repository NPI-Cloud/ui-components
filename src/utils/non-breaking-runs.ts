/**
 * Splits text into the runs that non-breaking spaces (U+00A0) glue together. Ordinary
 * whitespace separates the runs; inside a run every non-breaking space comes back as a plain
 * space, so the caller decides per breakpoint whether a run really has to stay on one line
 * (a fixed-height header bar can afford that only where it is wide enough).
 *
 * `'Národní pedagogický institut České republiky'` →
 * `['Národní pedagogický institut', 'České republiky']`
 */
export function splitNonBreakingRuns(text: string): string[] {
	return text
		.split(/[^\S ]+/)
		.map(run => run.replace(/ +/g, ' '))
		.filter(run => run.length > 0)
}

export const hasNonBreakingSpace = (text: string): boolean => text.includes(' ')
