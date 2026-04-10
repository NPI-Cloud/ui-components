export interface HeroBlockProps {
	heading?: string | null
	subtitle?: string | null
	ctaLabel?: string | null
	ctaUrl?: string | null
	imageUrl?: string | null
	imageAlt?: string | null
	variant?: 'light' | 'dark'
}

export function HeroBlock({ heading, subtitle, ctaLabel, ctaUrl, imageUrl, imageAlt, variant = 'light' }: HeroBlockProps) {
	const isDark = variant === 'dark'

	return (
		<div
			className={`grid min-h-75 grid-cols-1 overflow-hidden rounded-s md:grid-cols-[55%_45%] ${isDark ? 'bg-[#0a1a4a]' : 'bg-white'}`}
		>
			<div className="flex flex-col justify-center p-8 md:p-12">
				{heading && (
					<h2
						className={`font-npi-sans text-(length:--npi-font-size-4xl) font-bold leading-tight ${isDark ? 'text-white' : 'text-npi-gray-900'}`}
					>
						{heading}
					</h2>
				)}
				{subtitle && (
					<p
						className={`mt-4 font-npi-sans text-(length:--npi-font-size-lg) leading-relaxed ${isDark ? 'text-npi-gray-300' : 'text-npi-gray-700'}`}
					>
						{subtitle}
					</p>
				)}
				{ctaLabel && (
					<div className="mt-6">
						<a
							href={ctaUrl ?? '#'}
							className="inline-flex items-center gap-2 rounded-xs bg-npi-blue px-6 py-3 font-npi-sans text-(length:--npi-font-size-base) font-semibold text-white"
						>
							{ctaLabel}
							<span aria-hidden="true">&gt;</span>
						</a>
					</div>
				)}
			</div>
			<div className="flex items-center justify-center p-4 md:p-8">
				{imageUrl
					? (
						<img
							src={imageUrl}
							alt={imageAlt ?? ''}
							className="h-full w-full rounded-s object-cover"
						/>
					)
					: (
						<div className="flex h-full min-h-50 w-full items-center justify-center rounded-s bg-npi-gray-100 text-npi-gray-400">
							<svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
								/>
							</svg>
						</div>
					)}
			</div>
		</div>
	)
}
