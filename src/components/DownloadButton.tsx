'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { Icon } from '../icons'

export interface DownloadVariant {
	/** Public URL of the file */
	url: string
	/** File name; the displayed format label is derived from its extension when `format` is not set */
	fileName?: string | null
	/** MIME type — used as a fallback when fileName has no extension */
	fileType?: string | null
	/** Optional explicit format label (e.g. "PDF", "DOCX"). Overrides the extension-derived label */
	format?: string | null
}

export interface DownloadButtonProps {
	/** Visible trigger label. Defaults to `"Stáhnout"` */
	label?: string
	/**
	 * File variants. If exactly one is provided, clicking the trigger downloads it directly.
	 * If two or more, clicking opens a dropdown that lets the user pick a format.
	 */
	variants: DownloadVariant[]
	/** Render as `<a>` with `download` attribute (default true). When false, clicks are passed to `onSelect` */
	download?: boolean
	/** Called with the picked variant when the user activates one (useful for analytics or custom handling) */
	onSelect?: (variant: DownloadVariant) => void
	/** Additional class applied to the trigger button */
	className?: string
}

const EXTENSION_LABELS: Record<string, string> = {
	pdf: 'PDF',
	doc: 'DOC',
	docx: 'DOCX',
	xls: 'XLS',
	xlsx: 'XLSX',
	ppt: 'PPT',
	pptx: 'PPTX',
	odt: 'ODT',
	ods: 'ODS',
	odp: 'ODP',
	zip: 'ZIP',
	csv: 'CSV',
	txt: 'TXT',
}

function formatLabel(v: DownloadVariant): string {
	if (v.format) return v.format
	const ext = v.fileName?.split('.').pop()?.toLowerCase()
	if (ext && EXTENSION_LABELS[ext]) return EXTENSION_LABELS[ext]
	if (v.fileType) {
		const sub = v.fileType.split('/').pop()
		if (sub) return sub.toUpperCase().slice(0, 8)
	}
	return ext?.toUpperCase() ?? 'FILE'
}

export const DownloadButton = forwardRef<HTMLDivElement, DownloadButtonProps>(
	({ label = 'Stáhnout', variants, download = true, onSelect, className }, ref) => {
		const isMulti = variants.length > 1
		const [open, setOpen] = useState(false)
		const containerRef = useRef<HTMLDivElement>(null)

		useEffect(() => {
			if (!open) return
			const handler = (e: MouseEvent) => {
				if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
			}
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Escape') setOpen(false)
			}
			document.addEventListener('mousedown', handler)
			document.addEventListener('keydown', onKey)
			return () => {
				document.removeEventListener('mousedown', handler)
				document.removeEventListener('keydown', onKey)
			}
		}, [open])

		const setRefs = (node: HTMLDivElement | null) => {
			containerRef.current = node
			if (typeof ref === 'function') ref(node)
			else if (ref) ref.current = node
		}

		// Single-variant: render as a direct anchor download link.
		if (!isMulti) {
			const variant = variants[0]
			if (!variant) return null
			return (
				<div ref={setRefs} className="relative inline-block">
					<a
						href={variant.url}
						{...(download ? { download: variant.fileName ?? '' } : {})}
						onClick={() => onSelect?.(variant)}
						className={`inline-flex items-center gap-npi-2 font-npi-sans font-bold text-[1rem] leading-[1.5] text-npi-blue hover:text-npi-blue-hover active:text-npi-blue-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light rounded-npi-xxs ${
							className ?? ''
						}`}
					>
						<Icon name="stahnout" className="size-6 shrink-0" />
						<span>{label}</span>
					</a>
				</div>
			)
		}

		// Multi-variant: render a dropdown trigger.
		return (
			<div ref={setRefs} className="relative inline-block">
				<button
					type="button"
					aria-haspopup="menu"
					aria-expanded={open}
					onClick={() => setOpen(o => !o)}
					className={`inline-flex items-center gap-npi-2 font-npi-sans font-bold text-[1rem] leading-[1.5] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light rounded-npi-xxs ${
						open ? 'text-npi-blue-hover' : 'text-npi-blue hover:text-npi-blue-hover'
					} ${className ?? ''}`}
				>
					<span>{label}</span>
					<Icon name="arrowDolu" className={`size-6 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
				</button>
				{open && (
					<ul
						role="menu"
						className="absolute left-0 top-full z-10 mt-npi-2 flex w-[195px] flex-col overflow-clip rounded-npi-xs bg-white py-npi-2 shadow-[0_20px_45px_0_#F0F0F0]"
					>
						{variants.map((v, i) => (
							<li key={i} role="none">
								<a
									role="menuitem"
									href={v.url}
									{...(download ? { download: v.fileName ?? '' } : {})}
									onClick={() => {
										onSelect?.(v)
										setOpen(false)
									}}
									className="flex items-center gap-npi-2 bg-white px-npi-4 py-npi-3 text-npi-blue hover:text-npi-blue-hover active:text-npi-blue-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:bg-npi-bg-light"
								>
									<Icon name="stahnout" className="size-6 shrink-0" />
									<span className="font-npi-sans font-bold text-[1rem] leading-[1.5]">{formatLabel(v)}</span>
								</a>
							</li>
						))}
					</ul>
				)}
			</div>
		)
	},
)

DownloadButton.displayName = 'DownloadButton'
