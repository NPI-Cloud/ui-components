'use client'

import { clsx } from 'clsx'
import { forwardRef, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { Icon } from '../icons'

export const dateTimePickerModes = ['time', 'date', 'date-range'] as const
export type DateTimePickerMode = typeof dateTimePickerModes[number]

export interface DateRange {
	/** Inclusive start date of the range. May be `null` while the user is still picking. */
	start: Date | null
	/** Inclusive end date of the range. `null` if only the start has been picked so far. */
	end: Date | null
}

export type DateTimePickerValue = Date | DateRange | null

export interface DateTimePickerProps {
	/** Label rendered above the trigger. */
	label?: ReactNode
	/** Renders a red asterisk after the label (purely visual; pair with `aria-required` for semantics). */
	required?: boolean
	/** Tooltip text exposed via the info icon next to the label. */
	helperText?: string
	/** Error message rendered below the trigger. When set, the trigger gets a red border. */
	error?: ReactNode
	/** Placeholder shown inside an empty trigger (italic, secondary text). */
	placeholder?: string
	/** Selected value. `Date` for `mode="time"`/`mode="date"`, `DateRange` for `mode="date-range"`. */
	value?: DateTimePickerValue
	/** Initial value when uncontrolled. */
	defaultValue?: DateTimePickerValue
	/** Fires whenever the user picks a new value. */
	onChange?: (value: DateTimePickerValue) => void
	/** Which kind of value the picker collects. Defaults to `'date'`. */
	mode?: DateTimePickerMode
	/** Earliest date a user can pick (calendar dates outside the range are visually muted and unselectable). */
	min?: Date
	/** Latest date a user can pick. */
	max?: Date
	/** Visually marks the trigger as disabled and blocks interaction. */
	disabled?: boolean
	/** Native `name` attribute mirrored to a hidden input — useful inside HTML forms. */
	name?: string
	/** Forwarded to the trigger button. */
	id?: string
	/** Extra classes applied to the outer wrapper. */
	className?: string
	/** Force the popover open. Useful for stories / tests. */
	defaultOpen?: boolean
}

const monthNamesCs = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec']
const weekdayNamesCs = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => h)
const MINUTE_OPTIONS = [0, 15, 30, 45]

function formatDate(date: Date): string {
	return `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`
}

function formatTime(date: Date): string {
	const h = date.getHours().toString().padStart(2, '0')
	const m = date.getMinutes().toString().padStart(2, '0')
	return `${h}:${m}`
}

function formatRange(range: DateRange): string {
	if (range.start && range.end) return `${formatDate(range.start)} – ${formatDate(range.end)}`
	if (range.start) return `${formatDate(range.start)} – …`
	return ''
}

function isSameDay(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfDay(date: Date): Date {
	const next = new Date(date)
	next.setHours(0, 0, 0, 0)
	return next
}

function isInRange(day: Date, start: Date, end: Date): boolean {
	const t = startOfDay(day).getTime()
	return t >= startOfDay(start).getTime() && t <= startOfDay(end).getTime()
}

function getMonthGrid(year: number, month: number): Date[][] {
	// First day of the visible grid: most recent Monday on or before the 1st.
	const firstOfMonth = new Date(year, month, 1)
	const dayOfWeek = (firstOfMonth.getDay() + 6) % 7 // 0 = Monday
	const gridStart = new Date(year, month, 1 - dayOfWeek)
	const weeks: Date[][] = []
	for (let w = 0; w < 6; w++) {
		const week: Date[] = []
		for (let d = 0; d < 7; d++) {
			const day = new Date(gridStart)
			day.setDate(gridStart.getDate() + w * 7 + d)
			week.push(day)
		}
		weeks.push(week)
	}
	return weeks
}

function isDateValue(v: DateTimePickerValue): v is Date {
	return v instanceof Date
}

function isRangeValue(v: DateTimePickerValue): v is DateRange {
	return v !== null && typeof v === 'object' && !(v instanceof Date) && 'start' in v && 'end' in v
}

export const DateTimePicker = forwardRef<HTMLButtonElement, DateTimePickerProps>((props, ref) => {
	const {
		label,
		required = false,
		helperText,
		error,
		placeholder,
		value: controlledValue,
		defaultValue,
		onChange,
		mode = 'date',
		min,
		max,
		disabled = false,
		name,
		id: idProp,
		className,
		defaultOpen = false,
	} = props

	const reactId = useId()
	const id = idProp ?? `datetimepicker-${reactId}`
	const popoverId = `${id}-popover`

	const isControlled = controlledValue !== undefined
	const [uncontrolledValue, setUncontrolledValue] = useState<DateTimePickerValue>(() => {
		if (defaultValue !== undefined) return defaultValue
		return mode === 'date-range' ? { start: null, end: null } : null
	})
	const value = isControlled ? controlledValue : uncontrolledValue

	const [open, setOpen] = useState(defaultOpen)
	const wrapperRef = useRef<HTMLDivElement | null>(null)
	const triggerRef = useRef<HTMLButtonElement | null>(null)

	const setRefs = useCallback(
		(node: HTMLButtonElement | null) => {
			triggerRef.current = node
			if (typeof ref === 'function') ref(node)
			else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
		},
		[ref],
	)

	const commit = useCallback(
		(next: DateTimePickerValue) => {
			if (!isControlled) setUncontrolledValue(next)
			onChange?.(next)
		},
		[isControlled, onChange],
	)

	// Calendar visible month state.
	const initialMonthAnchor = useMemo(() => {
		if (isDateValue(value)) return value
		if (isRangeValue(value) && value.start) return value.start
		return new Date()
	}, [value])
	const [visibleMonth, setVisibleMonth] = useState<Date>(initialMonthAnchor)

	useEffect(() => {
		if (open) setVisibleMonth(initialMonthAnchor)
	}, [open, initialMonthAnchor])

	// Close on outside click / Escape.
	useEffect(() => {
		if (!open) return
		const onDocClick = (event: MouseEvent) => {
			const target = event.target as Node
			if (wrapperRef.current && !wrapperRef.current.contains(target)) setOpen(false)
		}
		const onKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false)
				triggerRef.current?.focus()
			}
		}
		document.addEventListener('mousedown', onDocClick)
		document.addEventListener('keydown', onKey)
		return () => {
			document.removeEventListener('mousedown', onDocClick)
			document.removeEventListener('keydown', onKey)
		}
	}, [open])

	const hasError = error != null && error !== ''
	const effectivePlaceholder = placeholder ?? (mode === 'time' ? 'Vyberte' : mode === 'date-range' ? 'Vyplňte období' : 'Zadejte datum')

	const triggerLabel: string = (() => {
		if (mode === 'time' && isDateValue(value)) return formatTime(value)
		if (mode === 'date' && isDateValue(value)) return formatDate(value)
		if (mode === 'date-range' && isRangeValue(value)) return formatRange(value)
		return ''
	})()
	const showPlaceholder = triggerLabel === ''

	const triggerIcon: 'kalendar' | 'sipkaDolu' = mode === 'time' ? 'sipkaDolu' : 'kalendar'

	// Width per mode — matches Figma symbol widths (160 / 240 / 300). 240 and 300 fall outside the npi spacing scale (capped at 200=`npi-50`); flagged in token_gaps.
	const widthClass = mode === 'time' ? 'w-npi-40' : mode === 'date' ? 'w-[240px]' : 'w-[300px]'

	// ---- Calendar handlers
	const goToMonth = (delta: number) => {
		setVisibleMonth(prev => {
			const next = new Date(prev)
			next.setDate(1)
			next.setMonth(next.getMonth() + delta)
			return next
		})
	}

	const handleDayClick = (day: Date) => {
		if (mode === 'date') {
			commit(day)
			setOpen(false)
			triggerRef.current?.focus()
			return
		}
		if (mode === 'date-range') {
			const range = isRangeValue(value) ? value : { start: null, end: null }
			if (!range.start || (range.start && range.end)) {
				commit({ start: day, end: null })
				return
			}
			// Has start but no end.
			if (day.getTime() < range.start.getTime()) {
				commit({ start: day, end: range.start })
			} else {
				commit({ start: range.start, end: day })
			}
			setOpen(false)
			triggerRef.current?.focus()
		}
	}

	const isDayDisabled = (day: Date): boolean => {
		if (min && startOfDay(day).getTime() < startOfDay(min).getTime()) return true
		if (max && startOfDay(day).getTime() > startOfDay(max).getTime()) return true
		return false
	}

	const today = useMemo(() => new Date(), [])

	const selectedDate: Date | null = (() => {
		if (mode === 'date' && isDateValue(value)) return value
		return null
	})()

	const range: DateRange = (() => {
		if (mode === 'date-range' && isRangeValue(value)) return value
		return { start: null, end: null }
	})()

	// ---- Time handlers
	const handlePickTime = (hour: number, minute: number) => {
		const base = isDateValue(value) ? new Date(value) : new Date()
		base.setHours(hour, minute, 0, 0)
		commit(base)
		setOpen(false)
		triggerRef.current?.focus()
	}

	const currentHour = isDateValue(value) ? value.getHours() : null
	const currentMinute = isDateValue(value) ? value.getMinutes() : null

	const hiddenInputValue: string = (() => {
		if (mode === 'time' && isDateValue(value)) return formatTime(value)
		if (mode === 'date' && isDateValue(value)) return value.toISOString().slice(0, 10)
		if (mode === 'date-range' && isRangeValue(value)) {
			const s = value.start ? value.start.toISOString().slice(0, 10) : ''
			const e = value.end ? value.end.toISOString().slice(0, 10) : ''
			return `${s}/${e}`
		}
		return ''
	})()

	return (
		<div ref={wrapperRef} className={twMerge(clsx('relative flex flex-col gap-npi-2 font-npi-sans', widthClass, className))}>
			{label && (
				<label
					htmlFor={id}
					className={clsx(
						'flex items-center gap-npi-2 font-npi-sans text-[1rem] leading-[1.5]',
						disabled ? 'text-npi-text-secondary' : 'text-npi-text-primary',
					)}
				>
					<span className="flex flex-1 items-center gap-npi-2">
						<span>{label}</span>
						{helperText && (
							<span
								className="inline-flex shrink-0 cursor-help text-npi-text-primary"
								role="img"
								aria-label={helperText}
								title={helperText}
							>
								<Icon name="info" size="s" className="size-4" />
							</span>
						)}
					</span>
					{required && (
						<span className="whitespace-nowrap text-[0.875rem] leading-[1.3] text-npi-status-error">
							Povinné pole
						</span>
					)}
				</label>
			)}
			<button
				ref={setRefs}
				id={id}
				type="button"
				disabled={disabled}
				aria-haspopup="dialog"
				aria-expanded={open}
				aria-controls={popoverId}
				aria-invalid={hasError || undefined}
				onClick={() => !disabled && setOpen(o => !o)}
				className={clsx(
					'flex h-npi-12 w-full items-center gap-npi-3 rounded-npi-xxs border bg-npi-bg-white px-npi-4 text-left transition-colors',
					'focus-visible:outline-4 focus-visible:outline-npi-blue-light',
					hasError
						? 'border-npi-status-error'
						: disabled
						? 'cursor-not-allowed border-npi-gray-300 bg-npi-gray-50'
						: 'cursor-pointer border-npi-gray-300 hover:border-npi-blue',
				)}
			>
				<span
					className={clsx(
						'min-w-0 flex-1 truncate text-[1rem] leading-[1.5]',
						showPlaceholder
							? 'font-normal italic text-npi-text-secondary'
							: clsx('font-bold', disabled ? 'text-npi-text-secondary' : 'text-npi-text-primary'),
					)}
				>
					{showPlaceholder ? effectivePlaceholder : triggerLabel}
				</span>
				<span
					aria-hidden
					className={clsx('inline-flex shrink-0 items-center justify-center', disabled ? 'text-npi-text-secondary' : 'text-npi-blue-dark')}
				>
					<Icon name={triggerIcon} size="m" className="size-6" />
				</span>
			</button>
			{name && <input type="hidden" name={name} value={hiddenInputValue} />}
			{open && !disabled && (
				<div
					id={popoverId}
					role="dialog"
					className={clsx(
						'absolute left-0 top-full z-50 mt-npi-1 flex flex-col overflow-hidden rounded-npi-xs bg-npi-bg-white p-npi-4 shadow-npi-m',
					)}
				>
					{mode === 'time'
						? (
							<TimeScroller
								hour={currentHour}
								minute={currentMinute}
								onPick={handlePickTime}
							/>
						)
						: (
							<Calendar
								visibleMonth={visibleMonth}
								onPrevMonth={() => goToMonth(-1)}
								onNextMonth={() => goToMonth(1)}
								onDayClick={handleDayClick}
								selectedDate={selectedDate}
								range={range}
								mode={mode}
								today={today}
								isDayDisabled={isDayDisabled}
							/>
						)}
				</div>
			)}
			{hasError && (
				<p className="text-right font-npi-sans text-[0.875rem] leading-[1.3] text-npi-status-error">
					{error}
				</p>
			)}
		</div>
	)
})
DateTimePicker.displayName = 'DateTimePicker'

// ---------- Calendar grid

interface CalendarProps {
	visibleMonth: Date
	onPrevMonth: () => void
	onNextMonth: () => void
	onDayClick: (day: Date) => void
	selectedDate: Date | null
	range: DateRange
	mode: DateTimePickerMode
	today: Date
	isDayDisabled: (day: Date) => boolean
}

function Calendar(props: CalendarProps) {
	const { visibleMonth, onPrevMonth, onNextMonth, onDayClick, selectedDate, range, mode, today, isDayDisabled } = props
	const year = visibleMonth.getFullYear()
	const month = visibleMonth.getMonth()
	const weeks = useMemo(() => getMonthGrid(year, month), [year, month])

	return (
		<div className="flex w-[280px] flex-col">
			{/* Header with month/year + navigation */}
			<div className="flex items-center justify-between pb-npi-2">
				<button
					type="button"
					aria-label="Předchozí měsíc"
					onClick={onPrevMonth}
					className="inline-flex size-npi-10 items-center justify-center rounded-npi-xxs text-npi-blue-dark transition-colors hover:bg-npi-bg-light focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-npi-blue-light"
				>
					<Icon name="sipkaVlevo" size="m" className="size-6" />
				</button>
				<div className="font-npi-sans text-[1rem] font-bold leading-[1.5] text-npi-text-primary">
					{monthNamesCs[month]} {year}
				</div>
				<button
					type="button"
					aria-label="Další měsíc"
					onClick={onNextMonth}
					className="inline-flex size-npi-10 items-center justify-center rounded-npi-xxs text-npi-blue-dark transition-colors hover:bg-npi-bg-light focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-npi-blue-light"
				>
					<Icon name="sipkaVpravo" size="m" className="size-6" />
				</button>
			</div>
			{/* Weekday labels */}
			<div className="flex">
				{weekdayNamesCs.map(name => (
					<div
						key={name}
						className="flex size-npi-10 items-center justify-center font-npi-sans text-[0.875rem] leading-[1.3] text-npi-text-secondary"
					>
						{name}
					</div>
				))}
			</div>
			{/* Day grid */}
			<div className="flex flex-col">
				{weeks.map((week, wi) => (
					<div key={wi} className="flex">
						{week.map(day => (
							<DayCell
								key={day.toISOString()}
								day={day}
								inCurrentMonth={day.getMonth() === month}
								isToday={isSameDay(day, today)}
								isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
								isRangeStart={range.start ? isSameDay(day, range.start) : false}
								isRangeEnd={range.end ? isSameDay(day, range.end) : false}
								isInRange={range.start && range.end ? isInRange(day, range.start, range.end) : false}
								disabled={isDayDisabled(day)}
								mode={mode}
								onClick={() => onDayClick(day)}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	)
}

interface DayCellProps {
	day: Date
	inCurrentMonth: boolean
	isToday: boolean
	isSelected: boolean
	isRangeStart: boolean
	isRangeEnd: boolean
	isInRange: boolean
	disabled: boolean
	mode: DateTimePickerMode
	onClick: () => void
}

function DayCell(props: DayCellProps) {
	const { day, inCurrentMonth, isToday, isSelected, isRangeStart, isRangeEnd, isInRange, disabled, mode, onClick } = props
	const isRangeEndpoint = isRangeStart || isRangeEnd
	const showRangeBackground = mode === 'date-range' && isInRange && !isRangeEndpoint
	const showSelectedDot = isSelected || isRangeEndpoint

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			aria-pressed={showSelectedDot || undefined}
			aria-current={isToday ? 'date' : undefined}
			className={clsx(
				'relative inline-flex size-npi-10 shrink-0 items-center justify-center font-npi-sans text-[1rem] leading-[1.5] transition-colors',
				'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-npi-blue-light',
				disabled
					? 'cursor-not-allowed text-npi-gray-300'
					: !inCurrentMonth
					? 'cursor-pointer text-npi-gray-400 hover:text-npi-text-primary'
					: 'cursor-pointer text-npi-text-primary',
				!disabled && inCurrentMonth && !showSelectedDot && !showRangeBackground && 'hover:bg-npi-bg-light',
				showRangeBackground && 'bg-npi-blue-lighter',
			)}
		>
			{showSelectedDot && (
				<span
					aria-hidden
					className="pointer-events-none absolute inset-0 m-auto size-npi-10 rounded-full bg-npi-blue"
				/>
			)}
			{!showSelectedDot && isToday && inCurrentMonth && !disabled && (
				<span
					aria-hidden
					className="pointer-events-none absolute inset-0 m-auto size-npi-10 rounded-full border border-npi-blue-dark"
				/>
			)}
			<span className={clsx('relative', showSelectedDot && 'font-normal text-npi-white')}>
				{day.getDate()}
			</span>
		</button>
	)
}

// ---------- Time scroller (simple list of hours + minutes)

interface TimeScrollerProps {
	hour: number | null
	minute: number | null
	onPick: (hour: number, minute: number) => void
}

function TimeScroller(props: TimeScrollerProps) {
	const { hour, minute, onPick } = props
	const selectedHour = hour ?? 10
	const selectedMinute = minute ?? 0
	return (
		<div className="flex w-npi-40 gap-npi-2" role="group" aria-label="Vyberte čas">
			<TimeColumn
				values={HOUR_OPTIONS}
				selected={selectedHour}
				onSelect={h => onPick(h, selectedMinute)}
				ariaLabel="Hodiny"
			/>
			<TimeColumn
				values={MINUTE_OPTIONS}
				selected={selectedMinute}
				onSelect={m => onPick(selectedHour, m)}
				ariaLabel="Minuty"
			/>
		</div>
	)
}

interface TimeColumnProps {
	values: number[]
	selected: number
	onSelect: (value: number) => void
	ariaLabel: string
}

function TimeColumn(props: TimeColumnProps) {
	const { values, selected, onSelect, ariaLabel } = props
	return (
		<div
			role="listbox"
			aria-label={ariaLabel}
			className="flex max-h-[200px] flex-1 flex-col overflow-y-auto"
		>
			{values.map(v => {
				const isSelected = v === selected
				return (
					<button
						key={v}
						type="button"
						role="option"
						aria-selected={isSelected}
						onClick={() => onSelect(v)}
						className={clsx(
							'flex h-npi-10 shrink-0 items-center justify-center rounded-npi-xxs font-npi-sans text-[1rem] leading-[1.5] transition-colors',
							'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-npi-blue-light',
							isSelected
								? 'bg-npi-blue font-bold text-npi-white'
								: 'text-npi-text-primary hover:bg-npi-bg-light',
						)}
					>
						{v.toString().padStart(2, '0')}
					</button>
				)
			})}
		</div>
	)
}
