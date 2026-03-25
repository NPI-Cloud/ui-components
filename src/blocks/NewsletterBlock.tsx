export interface NewsletterBlockProps {
	heading?: string | null
	ctaLabel?: string | null
	ctaUrl?: string | null
	imageUrl?: string | null
	imageAlt?: string | null
}

function DecorativeIllustration() {
	return (
		<svg className="h-full w-full" viewBox="0 0 500 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			{/* Grid pattern top-right */}
			<g stroke="hsl(213 89% 70%)" strokeWidth="1" opacity="0.5">
				{Array.from({ length: 6 }).map((_, i) => <line key={`gv-${i}`} x1={360 + i * 20} y1={10} x2={360 + i * 20} y2={110} />)}
				{Array.from({ length: 6 }).map((_, i) => <line key={`gh-${i}`} x1={360} y1={10 + i * 20} x2={460} y2={10 + i * 20} />)}
			</g>

			{/* Grid pattern bottom-right */}
			<g stroke="hsl(213 89% 70%)" strokeWidth="1" opacity="0.5">
				{Array.from({ length: 6 }).map((_, i) => <line key={`gv2-${i}`} x1={370 + i * 20} y1={220} x2={370 + i * 20} y2={310} />)}
				{Array.from({ length: 5 }).map((_, i) => <line key={`gh2-${i}`} x1={370} y1={220 + i * 20} x2={470} y2={220 + i * 20} />)}
			</g>

			{/* Dot grid */}
			{Array.from({ length: 5 }).map((_, row) =>
				Array.from({ length: 6 }).map((_, col) => (
					<circle
						key={`dot-${row}-${col}`}
						cx={170 + col * 16}
						cy={80 + row * 16}
						r="2.5"
						fill="hsl(213 89% 55%)"
						opacity="0.5"
					/>
				))
			)}

			{/* Dark circle */}
			<circle cx="280" cy="50" r="30" fill="hsl(213 89% 20%)" />

			{/* Dark square */}
			<rect x="180" y="210" width="40" height="40" fill="hsl(213 89% 20%)" />

			{/* Blue triangle pointing right */}
			<polygon points="310,70 390,130 310,190" fill="hsl(213 89% 50%)" />

			{/* Small dark triangle */}
			<polygon points="400,140 440,180 400,180" fill="hsl(213 89% 25%)" />

			{/* Blue arc bottom-left */}
			<path d="M200 310 A60 60 0 0 1 260 250" stroke="hsl(213 89% 50%)" strokeWidth="18" fill="none" strokeLinecap="round" />

			{/* Central figure silhouette */}
			<ellipse cx="300" cy="120" rx="45" ry="50" fill="hsl(213 89% 18%)" />
			<rect x="260" y="150" width="80" height="100" rx="10" fill="hsl(213 89% 18%)" />
			{/* Raised arm */}
			<rect x="320" y="80" width="16" height="70" rx="8" fill="hsl(213 89% 18%)" transform="rotate(-20 328 115)" />
			{/* Pointing hand circle */}
			<circle cx="340" cy="45" r="8" fill="hsl(213 89% 50%)" />
		</svg>
	)
}

export function NewsletterBlock({ heading, ctaLabel, ctaUrl, imageUrl, imageAlt }: NewsletterBlockProps) {
	return (
		<div className="grid grid-cols-1 overflow-hidden rounded-npi-2xl bg-npi-gray-50 md:grid-cols-2">
			<div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
				{heading && (
					<h2 className="font-npi-sans text-[length:var(--npi-font-size-4xl)] font-bold italic leading-tight text-npi-blue">
						{heading}
					</h2>
				)}
				{ctaLabel && (
					<div className="mt-8">
						<a
							href={ctaUrl ?? '#'}
							className="inline-flex items-center gap-2 rounded-npi-lg bg-npi-blue px-8 py-4 font-npi-sans text-[length:var(--npi-font-size-base)] font-semibold text-white"
						>
							{ctaLabel}
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
							className="h-full max-h-80 w-full object-contain"
						/>
					)
					: <DecorativeIllustration />}
			</div>
		</div>
	)
}
