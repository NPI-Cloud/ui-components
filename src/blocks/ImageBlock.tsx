export interface ImageBlockProps {
	imageUrl?: string | null
	imageAlt?: string | null
	imageCaption?: string | null
}

export function ImageBlock({ imageUrl, imageAlt, imageCaption }: ImageBlockProps) {
	return (
		<figure className="space-y-2">
			{imageUrl
				? (
					<img
						src={imageUrl}
						alt={imageAlt ?? ''}
						className="w-full rounded-xs object-cover"
					/>
				)
				: (
					<div className="flex h-48 w-full items-center justify-center rounded-xs bg-npi-gray-100 text-npi-gray-400">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
							/>
						</svg>
					</div>
				)}
			{imageCaption && (
				<figcaption className="font-npi-sans text-[length:var(--npi-font-size-sm)] text-npi-gray-500 text-center">
					{imageCaption}
				</figcaption>
			)}
		</figure>
	)
}
