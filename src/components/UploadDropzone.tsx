import { clsx } from 'clsx'
import {
	type DragEvent,
	forwardRef,
	type HTMLAttributes,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export interface UploadDropzoneProps
	extends Omit<HTMLAttributes<HTMLDivElement>, 'onDrop' | 'onChange' | 'onDragEnter' | 'onDragLeave' | 'onDragOver'>
{
	/** Called with the user-selected files (from drag-drop or click-to-browse). Files are filtered by `accept` and `maxSize` first. */
	onFilesAdd?: (files: File[]) => void
	/** Native `accept` attribute — MIME pattern (`'image/*'`), extensions (`'.pdf,.docx'`), or a mix. */
	accept?: string
	/** Allow selecting more than one file at a time. Defaults to `true`. */
	multiple?: boolean
	/** Maximum size per file in bytes. Files exceeding this are dropped with an error. */
	maxSize?: number
	/** Disables interaction and dims the dropzone. */
	disabled?: boolean
	/** Error message rendered below the dropzone. When set, the border turns red. */
	error?: ReactNode
	/** Helper text rendered below the dropzone (e.g. "Up to 10 MB. JPG, PNG."). Hidden when `error` is set. */
	helperText?: ReactNode
	/** Primary instruction text shown next to the link. Defaults to `'Přetáhněte nebo '`. */
	label?: ReactNode
	/** Link-styled call-to-action text. Defaults to `'vyberte ze souborů'`. */
	browseLabel?: ReactNode
	/** Force the drag-over visual state (for documentation/storybook). */
	forceDragOver?: boolean
	/** Optional content rendered below the dropzone (e.g. file list). */
	children?: ReactNode
}

const isFileAccepted = (file: File, accept: string | undefined): boolean => {
	if (!accept) return true
	const tokens = accept.split(',').map(t => t.trim()).filter(Boolean)
	if (tokens.length === 0) return true
	const fileName = file.name.toLowerCase()
	const fileType = file.type.toLowerCase()
	return tokens.some(token => {
		const lower = token.toLowerCase()
		if (lower.startsWith('.')) return fileName.endsWith(lower)
		if (lower.endsWith('/*')) {
			const prefix = lower.slice(0, -1)
			return fileType.startsWith(prefix)
		}
		return fileType === lower
	})
}

export const UploadDropzone = forwardRef<HTMLDivElement, UploadDropzoneProps>((props, ref) => {
	const {
		onFilesAdd,
		accept,
		multiple = true,
		maxSize,
		disabled = false,
		error,
		helperText,
		label = 'Přetáhněte nebo ',
		browseLabel = 'vyberte ze souborů',
		forceDragOver = false,
		children,
		className,
		onClick,
		onKeyDown,
		...rest
	} = props

	const inputRef = useRef<HTMLInputElement | null>(null)
	const rootRef = useRef<HTMLDivElement | null>(null)
	useImperativeHandle(ref, () => rootRef.current as HTMLDivElement)

	const [isDragOver, setIsDragOver] = useState(false)
	const dragCounterRef = useRef(0)

	const hasError = error != null && error !== ''
	const dragOverActive = !disabled && (isDragOver || forceDragOver)

	const openPicker = useCallback(() => {
		if (disabled) return
		inputRef.current?.click()
	}, [disabled])

	const handleFiles = useCallback(
		(fileList: FileList | null) => {
			if (!fileList || fileList.length === 0) return
			const files = Array.from(fileList).filter(file => {
				if (!isFileAccepted(file, accept)) return false
				if (maxSize != null && file.size > maxSize) return false
				return true
			})
			if (files.length === 0) return
			onFilesAdd?.(multiple ? files : files.slice(0, 1))
		},
		[accept, maxSize, multiple, onFilesAdd],
	)

	const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		if (disabled) return
		dragCounterRef.current += 1
		setIsDragOver(true)
	}

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		if (disabled) return
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
	}

	const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		if (disabled) return
		dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
		if (dragCounterRef.current === 0) setIsDragOver(false)
	}

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault()
		event.stopPropagation()
		dragCounterRef.current = 0
		setIsDragOver(false)
		if (disabled) return
		handleFiles(event.dataTransfer?.files ?? null)
	}

	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		onClick?.(event)
		if (event.defaultPrevented || disabled) return
		openPicker()
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		onKeyDown?.(event)
		if (event.defaultPrevented || disabled) return
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			openPicker()
		}
	}

	return (
		<div className={twMerge(clsx('flex w-full flex-col font-npi-sans', hasError ? 'gap-npi-2' : 'gap-npi-4', className))}>
			<div
				ref={rootRef}
				role="button"
				tabIndex={disabled ? -1 : 0}
				aria-disabled={disabled || undefined}
				aria-invalid={hasError || undefined}
				data-drag-over={dragOverActive || undefined}
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={clsx(
					'flex flex-col items-center gap-npi-4 rounded-npi-xs border-[1.5px] border-dashed bg-npi-bg-white px-npi-10 py-npi-6 transition-colors',
					'focus-visible:outline-4 focus-visible:outline-npi-blue-light',
					disabled
						? 'cursor-not-allowed opacity-60'
						: 'cursor-pointer',
					hasError
						? 'border-npi-status-error'
						: dragOverActive
						? 'border-npi-blue'
						: 'border-npi-gray-300',
				)}
				{...rest}
			>
				<Icon name="nahratDokument" size="m" className="size-npi-6 shrink-0 text-npi-blue" aria-hidden />
				<p className="text-center text-[1rem] leading-[1.5] text-npi-text-primary">
					{label}
					<span className="text-npi-blue">{browseLabel}</span>
				</p>
				<input
					ref={inputRef}
					type="file"
					tabIndex={-1}
					aria-hidden
					className="sr-only"
					accept={accept}
					multiple={multiple}
					disabled={disabled}
					onClick={event => event.stopPropagation()}
					onChange={event => {
						handleFiles(event.target.files)
						event.target.value = ''
					}}
				/>
			</div>
			{hasError
				? <p className="text-[0.875rem] leading-[1.3] text-npi-status-error">{error}</p>
				: helperText
				? <p className="text-[0.875rem] leading-[1.3] text-npi-text-primary">{helperText}</p>
				: null}
			{children}
		</div>
	)
})
UploadDropzone.displayName = 'UploadDropzone'
