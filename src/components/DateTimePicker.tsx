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
	/** Month grids shown side by side in the calendar. Defaults to 2 for `date-range`, 1 otherwise. */
	visibleMonths?: 1 | 2
}

const monthNamesCs = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec']
const weekdayNamesCs = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne']
// Every 15-minute slot of the day: 00:00, 00:15, … 23:45.
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
	const hour = Math.floor(i / 4)
	const minute = (i % 4) * 15
	return { hour, minute, label: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}` }
})

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
		visibleMonths,
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
	// Two months don't fit on mobile — force a single-month calendar below the tablet breakpoint.
	const [forceSingleMonth, setForceSingleMonth] = useState(false)
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

	// Anchor the visible month to the value only on the open transition — not on every value change,
	// otherwise selecting a day (which now keeps the popover open) would snap the calendar back.
	const wasOpenRef = useRef(false)
	useEffect(() => {
		if (open && !wasOpenRef.current) setVisibleMonth(initialMonthAnchor)
		wasOpenRef.current = open
	}, [open, initialMonthAnchor])

	// Close on outside click / Escape. Bind to the document that owns our DOM (`ownerDocument`) rather than the
	// global `document` — when the component is mounted inside an iframe/portal, the global `document` belongs to
	// a different window and never receives these events.
	useEffect(() => {
		if (!open) return
		const doc = wrapperRef.current?.ownerDocument ?? document
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
		doc.addEventListener('mousedown', onDocClick)
		doc.addEventListener('keydown', onKey)
		return () => {
			doc.removeEventListener('mousedown', onDocClick)
			doc.removeEventListener('keydown', onKey)
		}
	}, [open])

	// Track the tablet breakpoint on the component's OWN window (`ownerDocument.defaultView`) so it follows the
	// showcase iframe / a portaled context, not the top window.
	useEffect(() => {
		const win = wrapperRef.current?.ownerDocument?.defaultView
		if (!win) return
		const mq = win.matchMedia('(max-width: 767.98px)')
		const update = () => setForceSingleMonth(mq.matches)
		update()
		mq.addEventListener('change', update)
		return () => mq.removeEventListener('change', update)
	}, [])

	// Range selection defaults to a two-month view (Figma); single date shows one. Mobile is always one month.
	const monthsShown: 1 | 2 = forceSingleMonth ? 1 : (visibleMonths ?? (mode === 'date-range' ? 2 : 1))

	const hasError = error != null && error !== ''
	const effectivePlaceholder = placeholder ?? (mode === 'time' ? 'Vyberte' : mode === 'date-range' ? 'Vyplňte období' : 'Zadejte datum')

	const triggerLabel: string = (() => {
		if (mode === 'time' && isDateValue(value)) return formatTime(value)
		if (mode === 'date' && isDateValue(value)) return formatDate(value)
		if (mode === 'date-range' && isRangeValue(value)) return formatRange(value)
		return ''
	})()
	const showPlaceholder = triggerLabel === ''

	// Time uses the solid filled caret ("Šipka plná dolů"); date/range use the calendar glyph.
	const triggerIcon: 'kalendar' | 'sipkaPlnaDolu' = mode === 'time' ? 'sipkaPlnaDolu' : 'kalendar'

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

	// Selecting keeps the popover open so the choice is visible in the calendar; it closes on
	// outside click / Escape (handled by the effect above).
	const handleDayClick = (day: Date) => {
		if (mode === 'date') {
			commit(day)
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
	// Stay open so hour and minute can both be picked; closes on outside click / Escape.
	const handlePickTime = (hour: number, minute: number) => {
		const base = isDateValue(value) ? new Date(value) : new Date()
		base.setHours(hour, minute, 0, 0)
		commit(base)
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
					// Focus replaces the border with a 4px npi-blue-light frame (Figma). Plain `focus:` (not
					// `focus-visible:`) so it also shows when the field is opened by mouse click. border-box keeps
					// the 48px outer height — the thicker border eats inward instead of shifting layout.
					'focus:border-4 focus:border-npi-blue-light focus:outline-none',
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
					className={clsx('inline-flex shrink-0 items-center justify-center', disabled ? 'text-npi-text-secondary' : 'text-npi-blue')}
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
							<TimeList
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
								monthsShown={monthsShown}
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
	/** How many month grids to render side by side (2 for range selection per Figma). */
	monthsShown: 1 | 2
}

function Calendar(props: CalendarProps) {
	const { visibleMonth, onPrevMonth, onNextMonth, monthsShown, range, mode, ...rest } = props
	const [hoveredDay, setHoveredDay] = useState<Date | null>(null)

	// While picking a range (start chosen, end not yet), preview the range live up to the hovered day so the
	// highlight band follows the cursor. The hovered day acts as a tentative endpoint.
	const isPickingEnd = mode === 'date-range' && range.start != null && range.end == null
	const effectiveRange: DateRange = isPickingEnd && hoveredDay
		? hoveredDay.getTime() < range.start!.getTime()
			? { start: hoveredDay, end: range.start }
			: { start: range.start, end: hoveredDay }
		: range

	const shared = { ...rest, mode, range: effectiveRange, onDayHover: setHoveredDay }

	// Range selection shows two consecutive months side by side (Figma); the right grid carries the nav that
	// moves the whole pair. onMouseLeave on the wrapper clears the hover preview when the cursor leaves.
	if (monthsShown === 2) {
		const secondMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1)
		return (
			<div className="flex gap-npi-6" onMouseLeave={() => setHoveredDay(null)}>
				<MonthGrid month={visibleMonth} showNav={false} {...shared} />
				<MonthGrid month={secondMonth} showNav onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} {...shared} />
			</div>
		)
	}

	return (
		<div onMouseLeave={() => setHoveredDay(null)}>
			<MonthGrid month={visibleMonth} showNav onPrevMonth={onPrevMonth} onNextMonth={onNextMonth} {...shared} />
		</div>
	)
}

interface MonthGridProps {
	month: Date
	/** Render the prev/next nav chevrons (single-month + the right grid of a two-month view). */
	showNav: boolean
	onPrevMonth?: () => void
	onNextMonth?: () => void
	onDayClick: (day: Date) => void
	/** Sets the hovered day to drive the range-selection preview. */
	onDayHover: (day: Date | null) => void
	selectedDate: Date | null
	range: DateRange
	mode: DateTimePickerMode
	today: Date
	isDayDisabled: (day: Date) => boolean
}

function MonthGrid(props: MonthGridProps) {
	const { month: visibleMonth, showNav, onPrevMonth, onNextMonth, onDayClick, onDayHover, selectedDate, range, mode, today, isDayDisabled } = props
	const year = visibleMonth.getFullYear()
	const month = visibleMonth.getMonth()
	const weeks = useMemo(() => getMonthGrid(year, month), [year, month])
	// True when the range covers more than one day — drives the half-cell band that connects the endpoints.
	const rangeSpans = Boolean(range.start && range.end && !isSameDay(range.start, range.end))

	return (
		<div className="flex w-[280px] flex-col">
			{/* Header (Figma): month/year on the left, prev/next chevrons on the right. Fixed 40px height so a
			    nav-less grid (the left month in a two-month range) lines up with the grid that carries the nav. */}
			<div className="mb-npi-2 flex h-npi-10 items-center justify-between">
				<span className="font-npi-sans text-[1rem] font-bold leading-[1.5] text-npi-text-primary">
					{monthNamesCs[month]} {year}
				</span>
				{showNav && (
					<div className="flex items-center">
						<button
							type="button"
							aria-label="Předchozí měsíc"
							onClick={onPrevMonth}
							className="inline-flex size-npi-10 items-center justify-center rounded-npi-xxs text-npi-blue transition-colors hover:bg-npi-bg-light focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-npi-blue-light"
						>
							<Icon name="arrowVlevo" size="m" className="size-4" />
						</button>
						<button
							type="button"
							aria-label="Další měsíc"
							onClick={onNextMonth}
							className="inline-flex size-npi-10 items-center justify-center rounded-npi-xxs text-npi-blue transition-colors hover:bg-npi-bg-light focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-npi-blue-light"
						>
							<Icon name="arrowVpravo" size="m" className="size-4" />
						</button>
					</div>
				)}
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
								connectRight={rangeSpans && range.start ? isSameDay(day, range.start) : false}
								connectLeft={rangeSpans && range.end ? isSameDay(day, range.end) : false}
								disabled={isDayDisabled(day)}
								mode={mode}
								onClick={() => onDayClick(day)}
								onHover={() => onDayHover(day)}
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
	/** Extend the range band under the right half of this cell (range start, so it connects to the band on its right). */
	connectRight: boolean
	/** Extend the range band under the left half of this cell (range end, so it connects to the band on its left). */
	connectLeft: boolean
	disabled: boolean
	mode: DateTimePickerMode
	onClick: () => void
	onHover: () => void
}

function DayCell(props: DayCellProps) {
	const { day, inCurrentMonth, isToday, isSelected, isRangeStart, isRangeEnd, isInRange, connectRight, connectLeft, disabled, mode, onClick, onHover } = props
	const isRangeEndpoint = isRangeStart || isRangeEnd
	const showRangeBackground = mode === 'date-range' && isInRange && !isRangeEndpoint
	const showSelectedDot = isSelected || isRangeEndpoint

	return (
		<button
			type="button"
			disabled={disabled}
			onClick={onClick}
			onMouseEnter={onHover}
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
				// Hover (Figma): a 1px navy ring outline (rounded-full), not a grey fill. `ring-inset` keeps the
				// 40px cell size — no layout shift — and matches the today-ring look.
				!disabled && inCurrentMonth && !showSelectedDot && !showRangeBackground
					&& 'hover:rounded-full hover:ring-1 hover:ring-inset hover:ring-npi-blue-dark',
				showRangeBackground && 'bg-npi-blue-lighter',
			)}
		>
			{/* Half-cell band under an endpoint so the light-blue range connects seamlessly into the solid circle. */}
			{connectRight && <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-npi-blue-lighter" />}
			{connectLeft && <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-npi-blue-lighter" />}
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

// ---------- Time list (single scrollable list of 15-minute slots)

interface TimeListProps {
	hour: number | null
	minute: number | null
	onPick: (hour: number, minute: number) => void
}

function TimeList(props: TimeListProps) {
	const { hour, minute, onPick } = props
	const containerRef = useRef<HTMLDivElement | null>(null)
	const selectedRef = useRef<HTMLButtonElement | null>(null)

	// On open, center the current value in the scroll viewport (or leave at top when there's no value).
	useEffect(() => {
		const container = containerRef.current
		const selected = selectedRef.current
		if (!container || !selected) return
		container.scrollTop = selected.offsetTop - container.clientHeight / 2 + selected.clientHeight / 2
	}, [])

	return (
		<div
			ref={containerRef}
			role="listbox"
			aria-label="Vyberte čas"
			className="relative flex max-h-[280px] w-npi-40 flex-col overflow-y-auto"
		>
			{TIME_OPTIONS.map(opt => {
				const isSelected = opt.hour === hour && opt.minute === minute
				return (
					<button
						key={opt.label}
						ref={isSelected ? selectedRef : undefined}
						type="button"
						role="option"
						aria-selected={isSelected}
						onClick={() => onPick(opt.hour, opt.minute)}
						className={clsx(
							'flex h-npi-10 shrink-0 items-center justify-center rounded-npi-xxs font-npi-sans text-[1rem] leading-[1.5] transition-colors',
							'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-npi-blue-light',
							isSelected
								? 'bg-npi-blue font-bold text-npi-white'
								: 'text-npi-text-primary hover:bg-npi-bg-light',
						)}
					>
						{opt.label}
					</button>
				)
			})}
		</div>
	)
}
