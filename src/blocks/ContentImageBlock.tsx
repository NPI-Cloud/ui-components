export interface ContentImageBlockProps {
	heading?: string | null
	bodyContent?: string | null
	ctaLabel?: string | null
	ctaUrl?: string | null
	imageUrl?: string | null
	imageAlt?: string | null
	imagePosition?: 'left' | 'right'
}

export function ContentImageBlock({ heading, bodyContent, ctaLabel, ctaUrl, imageUrl, imageAlt, imagePosition = 'right' }: ContentImageBlockProps) {
	const textColumn = (
		<div className="flex flex-col justify-center p-6 md:p-8">
			{heading && (
				<h3 className="font-npi-sans text-(length:--npi-font-size-2xl) font-bold leading-tight text-npi-gray-900">
					{heading}
				</h3>
			)}
			{bodyContent && (
				<p className="mt-3 font-npi-sans text-(length:--npi-font-size-base) leading-relaxed text-npi-gray-700">
					{bodyContent}
				</p>
			)}
			{ctaLabel && (
				<div className="mt-4">
					<a
						href={ctaUrl ?? '#'}
						className="inline-flex items-center gap-1 font-npi-sans text-(length:--npi-font-size-base) font-semibold text-npi-blue"
					>
						{ctaLabel}
						<span aria-hidden="true">&gt;</span>
					</a>
				</div>
			)}
		</div>
	)

	const imageColumn = (
		<div className="flex items-center justify-center p-4 md:p-6">
			{imageUrl
				? (
					<img
						src={imageUrl}
						alt={imageAlt ?? ''}
						className="h-full w-full rounded-npi-xl object-cover"
					/>
				)
				: (
					<div className="flex h-full min-h-50 w-full items-center justify-center rounded-npi-xl bg-npi-gray-100 text-npi-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
							/>
						</svg>
					</div>
				)}
		</div>
	)

	return (
		<div className="grid grid-cols-1 overflow-hidden rounded-npi-xl bg-white md:grid-cols-[40%_60%]">
			{imagePosition === 'left'
				? (
					<>
						{imageColumn}
						{textColumn}
					</>
				)
				: (
					<>
						{textColumn}
						{imageColumn}
					</>
				)}
		</div>
	)
}
