export interface DynamicBlockProps {
	dynamicSource?: string
	dynamicFilter?: Record<string, unknown>
	dynamicSort?: string
	dynamicLimit?: number
}

const mockCards = [
	{ title: 'Informace o projektu', date: '15. 3. 2026', excerpt: 'Přehled klíčových informací o probíhajícím projektu a jeho aktuálním stavu.' },
	{ title: 'Aktuality z regionu', date: '12. 3. 2026', excerpt: 'Nejnovější zprávy a události z regionu, které se týkají naší činnosti.' },
	{ title: 'Pozvánka na akci', date: '10. 3. 2026', excerpt: 'Srdečně vás zveme na nadcházející akci spojenou s prezentací výsledků.' },
]

export function DynamicBlock({ dynamicSource, dynamicFilter, dynamicSort, dynamicLimit }: DynamicBlockProps) {
	const filterKeys = dynamicFilter ? Object.keys(dynamicFilter) : []
	const summaryParts: string[] = []
	if (filterKeys.length > 0) summaryParts.push(`filtr: ${filterKeys.join(', ')}`)
	if (dynamicSort) summaryParts.push(`řazení: ${dynamicSort}`)
	if (dynamicLimit) summaryParts.push(`limit: ${dynamicLimit}`)

	return (
		<div className="rounded-npi-lg border border-npi-gray-200 bg-npi-gray-50 p-4 space-y-3">
			<div className="flex items-center justify-between">
				<span className="font-npi-sans text-[length:var(--npi-font-size-sm)] font-semibold text-npi-blue">
					{dynamicSource || 'Nepojmenovaný zdroj'}
				</span>
				{summaryParts.length > 0 && (
					<span className="font-npi-sans text-[length:var(--npi-font-size-xs)] text-npi-gray-400">
						{summaryParts.join(' · ')}
					</span>
				)}
			</div>
			<div className="grid gap-3">
				{mockCards.slice(0, dynamicLimit ?? 3).map((card, i) => (
					<div key={i} className="rounded-npi-md border border-npi-gray-200 bg-white p-3">
						<div className="flex items-baseline justify-between gap-2">
							<h4 className="font-npi-sans text-[length:var(--npi-font-size-sm)] font-medium text-npi-gray-900">
								{card.title}
							</h4>
							<time className="font-npi-sans text-[length:var(--npi-font-size-xs)] text-npi-gray-400 shrink-0">
								{card.date}
							</time>
						</div>
						<p className="font-npi-sans text-[length:var(--npi-font-size-sm)] text-npi-gray-600 mt-1">
							{card.excerpt}
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
