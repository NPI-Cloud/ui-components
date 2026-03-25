export interface DynamicBlockProps {
	dynamicSource?: string
	dynamicFilter?: Record<string, unknown>
	dynamicSort?: string
	dynamicLimit?: number
	/** Section heading displayed above the card grid */
	heading?: string
	/** CTA button label */
	ctaLabel?: string
	/** CTA button URL */
	ctaUrl?: string
}

interface MockCard {
	category: string
	title: string
	excerpt?: string
	tag?: string
	imageUrl?: string
}

const mockCards: MockCard[] = [
	{
		category: 'Video',
		title: 'Generativní AI jako pomocník učitele 2025',
	},
	{
		category: 'Metodická příručka',
		title: 'Jak na AI ve škole',
		excerpt: 'Přehledný souhrn sedmi klíčových oblastí, které by školy…',
		tag: 'Digitalizace ve vzdělávání',
	},
	{
		category: 'Metodická příručka',
		title: 'Nejčastější dotazy o AI',
		excerpt: 'Připravili jsme pro vás ve spolupráci s AI do škol otázky a…',
		tag: 'Digitalizace ve vzdělávání',
	},
]

function CardThumbnail({ tag }: { tag?: string }) {
	return (
		<div className="relative aspect-[4/3] w-full overflow-hidden rounded-npi-lg bg-npi-blue">
			{/* Decorative background shapes */}
			<svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				{/* Large play-button triangle */}
				<path d="M180 80 L320 170 L180 260 Z" fill="hsl(213 89% 30%)" opacity="0.5" />
				{/* Smaller rotated triangle */}
				<path d="M260 40 L360 100 L260 160 Z" fill="hsl(213 89% 30%)" opacity="0.35" />
				{/* Dot grid */}
				{Array.from({ length: 6 }).map((_, row) =>
					Array.from({ length: 8 }).map((_, col) => (
						<circle
							key={`${row}-${col}`}
							cx={60 + col * 14}
							cy={120 + row * 14}
							r="2"
							fill="hsl(213 89% 55%)"
							opacity="0.4"
						/>
					))
				)}
			</svg>
			{tag && (
				<span className="absolute left-3 top-3 rounded-npi-sm border border-npi-orange px-2 py-0.5 font-npi-sans text-[length:var(--npi-font-size-xs)] font-medium text-npi-orange">
					{tag}
				</span>
			)}
		</div>
	)
}

function DynamicCard({ card }: { card: MockCard }) {
	return (
		<div className="flex flex-col">
			{/* Top accent border */}
			<div className="mb-4 h-0.5 w-16 bg-npi-blue-dark" />
			{/* Category */}
			<span className="font-npi-sans text-[length:var(--npi-font-size-xs)] font-semibold uppercase tracking-[0.15em] text-npi-gray-900">
				{card.category}
			</span>
			{/* Title */}
			<h3 className="mt-2 font-npi-sans text-[length:var(--npi-font-size-xl)] font-medium leading-snug text-npi-gray-900">
				{card.title}
			</h3>
			{/* Excerpt */}
			{card.excerpt && (
				<p className="mt-2 font-npi-sans text-[length:var(--npi-font-size-sm)] leading-relaxed text-npi-gray-500">
					{card.excerpt}
				</p>
			)}
			{/* Thumbnail */}
			<div className="mt-4">
				<CardThumbnail tag={card.tag} />
			</div>
		</div>
	)
}

export function DynamicBlock({ dynamicSource, dynamicLimit, heading, ctaLabel, ctaUrl }: DynamicBlockProps) {
	const cards = mockCards.slice(0, dynamicLimit ?? 3)
	const sectionHeading = heading || dynamicSource

	return (
		<section className="space-y-8">
			{sectionHeading && (
				<h2 className="font-npi-sans text-[length:var(--npi-font-size-4xl)] font-bold leading-tight text-npi-gray-900">
					{sectionHeading}
				</h2>
			)}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{cards.map((card, i) => <DynamicCard key={i} card={card} />)}
			</div>
			{ctaLabel && (
				<div>
					<a
						href={ctaUrl ?? '#'}
						className="inline-flex items-center gap-2 rounded-npi-lg bg-npi-blue px-6 py-3 font-npi-sans text-[length:var(--npi-font-size-base)] font-semibold text-white"
					>
						{ctaLabel}
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path
								fillRule="evenodd"
								d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
								clipRule="evenodd"
							/>
						</svg>
					</a>
				</div>
			)}
		</section>
	)
}
