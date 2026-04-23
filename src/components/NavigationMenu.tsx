import * as RadixNavMenu from '@radix-ui/react-navigation-menu'
import { clsx } from 'clsx'
import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	createContext,
	forwardRef,
	type HTMLAttributes,
	type ReactNode,
	useContext,
	useState,
} from 'react'
import { createPortal } from 'react-dom'
import { twMerge } from 'tailwind-merge'
import { Icon, type IconName } from '../icons'
import { Heading } from './Heading'
import { Text } from './Text'

export const navigationMenuItemTrailings = ['chevron', 'badge', 'none'] as const
export type NavigationMenuItemTrailing = (typeof navigationMenuItemTrailings)[number]

export const navigationMenuItemStates = ['default', 'select', 'open'] as const
export type NavigationMenuItemState = (typeof navigationMenuItemStates)[number]

export const navigationSubnavVariants = ['wide', 'narrow'] as const
export type NavigationSubnavVariant = (typeof navigationSubnavVariants)[number]

export const navigationPromoVariants = ['icon', 'cover'] as const
export type NavigationPromoVariant = (typeof navigationPromoVariants)[number]

/**
 * Signals to nested `NavigationMenuItem`s that they live inside the Radix NavigationMenu.Root
 * rendered by `NavigationMenuItems`. When `true`, items render as Radix Trigger/Link so hover
 * and focus open/close the associated Subnav; when `false` they render as plain `<a>` / `<button>`.
 */
const InsideItemsContext = createContext(false)

/**
 * Target element where wide Subnavs portal themselves so they can span the full nav layout width
 * regardless of which trigger is hovered. Narrow Subnavs don't use this — they anchor directly to
 * their trigger's `<li>`. `null` when rendered outside `NavigationMenuItems` (standalone usage).
 */
const WidePortalContext = createContext<HTMLElement | null>(null)

export interface NavigationMenuProps extends HTMLAttributes<HTMLElement> {}

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
	({ className, children, ...props }, ref) => (
		<header
			ref={ref}
			className={twMerge(clsx('relative flex flex-col font-npi-sans bg-npi-white', className))}
			{...props}
		>
			{children}
		</header>
	),
)
NavigationMenu.displayName = 'NavigationMenu'

export interface NavigationMenuSiteSwitcherSite {
	/** Visible label */
	label: string
	/** Link target. Required — clicking switches to that site. */
	href: string
}

export interface NavigationMenuSiteSwitcherProps extends HTMLAttributes<HTMLDivElement> {
	/** Ordered list of NPI sites. Order should be stable across sites. */
	sites: NavigationMenuSiteSwitcherSite[]
	/** Label of the currently-active site. When it's in `sites`, that tab is highlighted. When absent, the current site is prepended as the first tab. */
	currentLabel: string
}

export const NavigationMenuSiteSwitcher = forwardRef<HTMLDivElement, NavigationMenuSiteSwitcherProps>(
	({ sites, currentLabel, className, ...props }, ref) => {
		const inList = sites.some(site => site.label === currentLabel)
		const resolved = inList ? sites : [{ label: currentLabel, href: '#' }, ...sites]

		return (
			<div
				ref={ref}
				className={twMerge(
					clsx('bg-npi-bg-dark py-npi-3 text-[0.875rem] leading-[1.3] text-npi-white', className),
				)}
				{...props}
			>
				<ul className="mx-auto flex max-w-npi-layout items-center gap-npi-10 px-npi-6">
					{resolved.map(site => {
						const isCurrent = site.label === currentLabel
						return (
							<li key={site.label} className="flex">
								<a
									href={site.href}
									aria-current={isCurrent ? 'page' : undefined}
									className={clsx(
										'inline-flex items-center whitespace-nowrap transition-colors focus-visible:outline-none',
										isCurrent
											? '-mx-npi-4 -mt-1.5 -mb-npi-3 rounded-t-npi-xxs bg-npi-white px-npi-4 pt-1.5 pb-npi-3 text-npi-blue-dark'
											: 'text-npi-white hover:text-npi-white/80 focus-visible:shadow-[0_3px_0_0_currentColor]',
									)}
								>
									{site.label}
								</a>
							</li>
						)
					})}
				</ul>
			</div>
		)
	},
)
NavigationMenuSiteSwitcher.displayName = 'NavigationMenuSiteSwitcher'

export interface NavigationMenuBarProps extends HTMLAttributes<HTMLDivElement> {}

export const NavigationMenuBar = forwardRef<HTMLDivElement, NavigationMenuBarProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={twMerge(
				clsx('mx-auto flex h-24 w-full max-w-npi-layout items-center justify-between gap-npi-6 px-npi-6', className),
			)}
			{...props}
		>
			{children}
		</div>
	),
)
NavigationMenuBar.displayName = 'NavigationMenuBar'

export interface NavigationMenuBrandProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
	/** URL of the square NPI logo symbol (48×48). */
	logoSrc: string
	/** Site name rendered next to the logo. Omit to show only the logo. */
	title?: string
	/** Accessible label for the logo link when `title` is omitted. */
	logoAlt?: string
}

export const NavigationMenuBrand = forwardRef<HTMLAnchorElement, NavigationMenuBrandProps>(
	({ logoSrc, title, logoAlt, className, ...props }, ref) => (
		<a
			ref={ref}
			className={twMerge(
				clsx(
					'flex shrink-0 items-center gap-npi-8 rounded-npi-xxs text-npi-text-primary',
					'focus-visible:outline-3 focus-visible:outline-npi-blue-light',
					className,
				),
			)}
			{...props}
		>
			<img src={logoSrc} alt={title ? '' : logoAlt ?? ''} className="size-npi-12 shrink-0" />
			{title && (
				<Heading level={7} className="whitespace-nowrap font-semibold">
					{title}
				</Heading>
			)}
		</a>
	),
)
NavigationMenuBrand.displayName = 'NavigationMenuBrand'

export interface NavigationMenuSearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'onSubmit'> {
	/** Accessible label — not visually shown (placeholder handles visible prompt). */
	label: string
	/** Label for the submit/search button (default: "Hledat"). */
	submitLabel?: string
	/** Called when the user submits the form (enter or clicks the search button). */
	onSubmit?: (value: string) => void
}

export const NavigationMenuSearch = forwardRef<HTMLInputElement, NavigationMenuSearchProps>(
	({ label, submitLabel = 'Hledat', placeholder, className, onSubmit, defaultValue, ...props }, ref) => (
		<form
			role="search"
			className={twMerge(
				clsx(
					'flex w-[328px] max-w-full shrink items-center justify-between gap-npi-2 rounded-full border border-npi-gray-200 bg-npi-white py-npi-1 pl-npi-6 pr-npi-1',
					'focus-within:border-npi-blue',
					className,
				),
			)}
			onSubmit={event => {
				event.preventDefault()
				const formData = new FormData(event.currentTarget)
				onSubmit?.(String(formData.get('q') ?? ''))
			}}
		>
			<input
				ref={ref}
				type="search"
				name="q"
				aria-label={label}
				placeholder={placeholder}
				defaultValue={defaultValue}
				className="min-w-0 flex-1 bg-transparent text-[1rem] leading-[22px] text-npi-text-primary placeholder:text-npi-gray-700 focus:outline-none"
				{...props}
			/>
			<button
				type="submit"
				aria-label={submitLabel}
				className="inline-flex size-npi-10 shrink-0 items-center justify-center rounded-full bg-npi-blue text-npi-white transition-colors hover:bg-npi-blue-hover focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light"
			>
				<Icon name="lupa" className="size-6" aria-hidden="true" />
			</button>
		</form>
	),
)
NavigationMenuSearch.displayName = 'NavigationMenuSearch'

export interface NavigationMenuActionsProps extends HTMLAttributes<HTMLDivElement> {}

export const NavigationMenuActions = forwardRef<HTMLDivElement, NavigationMenuActionsProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={twMerge(clsx('flex shrink-0 items-center gap-npi-8', className))}
			{...props}
		>
			{children}
		</div>
	),
)
NavigationMenuActions.displayName = 'NavigationMenuActions'

export type NavigationMenuItemsProps = React.ComponentPropsWithoutRef<typeof RadixNavMenu.Root>

export const NavigationMenuItems = forwardRef<
	React.ElementRef<typeof RadixNavMenu.Root>,
	NavigationMenuItemsProps
>(({ className, children, ...props }, ref) => {
	const [widePortalEl, setWidePortalEl] = useState<HTMLDivElement | null>(null)

	return (
		<RadixNavMenu.Root
			ref={ref}
			aria-label="Hlavní navigace"
			className={twMerge(
				clsx('relative mx-auto flex w-full max-w-npi-layout justify-center px-npi-6', className),
			)}
			{...props}
		>
			<InsideItemsContext.Provider value={true}>
				<WidePortalContext.Provider value={widePortalEl}>
					<RadixNavMenu.List className="flex items-center gap-npi-8 pt-npi-4 pb-npi-6">
						{children}
					</RadixNavMenu.List>
					{/* Wide-subnav portal target: spans full Root width, centered below the List. */}
					<div
						ref={setWidePortalEl}
						className="pointer-events-none absolute left-0 right-0 top-full z-20 flex justify-center"
					/>
				</WidePortalContext.Provider>
			</InsideItemsContext.Provider>
		</RadixNavMenu.Root>
	)
})
NavigationMenuItems.displayName = 'NavigationMenuItems'

type NavigationMenuItemAnchor = AnchorHTMLAttributes<HTMLAnchorElement> & { as?: 'a' }
type NavigationMenuItemButton = ButtonHTMLAttributes<HTMLButtonElement> & { as: 'button' }

export type NavigationMenuItemProps =
	& (NavigationMenuItemAnchor | NavigationMenuItemButton)
	& {
		/** Visible label. Omit when using only an icon (pass `aria-label` instead). */
		label?: string
		/** Leading icon (24×24). */
		icon?: IconName
		/** Trailing visual — `chevron` for items that expand a subnav, `badge` for counters (e.g. cart), `none` for plain links. Defaults to `none` unless the item has children (then `chevron`). */
		trailing?: NavigationMenuItemTrailing
		/** Number shown in the `badge` trailing slot. */
		badgeCount?: number
		/** Force a visual state. `default` is the resting blue; `select` adds an underline to mark the current page. Open state is handled automatically by Radix when the item has a Subnav. */
		state?: 'default' | 'select'
		/** Indent used inside narrow Subnav nested groups. `0` is flush with the column; `1` matches the 16px indent used by regular sub-sub items. */
		indent?: 0 | 1
		/** Subnav panel shown when the item is hovered or focused. Only effective inside `NavigationMenuItems`. */
		children?: ReactNode
	}

export const NavigationMenuItem = forwardRef<HTMLElement, NavigationMenuItemProps>((props, ref) => {
	const insideItems = useContext(InsideItemsContext)
	const {
		label,
		icon,
		trailing: trailingProp,
		badgeCount,
		state = 'default',
		indent = 0,
		children,
		className,
		as = 'a',
		...rest
	} = props as NavigationMenuItemProps & { as?: 'a' | 'button' }

	const hasSubnav = children != null && insideItems
	const trailing = trailingProp ?? (hasSubnav ? 'chevron' : 'none')
	const isIconOnly = !label && icon != null

	const baseClass = twMerge(
		clsx(
			'group inline-flex h-npi-6 items-center gap-[2px] font-bold text-[1rem] leading-[1.5]',
			'rounded-npi-xxs focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
			'bg-transparent cursor-pointer',
			isIconOnly ? 'size-6 justify-center gap-0' : '',
			indent === 1 ? 'pl-npi-4' : '',
			state === 'select'
				? 'text-npi-blue-dark'
				: 'text-npi-blue hover:text-npi-blue-dark data-[state=open]:text-npi-blue-dark',
			className,
		),
	)

	const labelNode = label && (
		<span
			className={clsx(
				'relative whitespace-nowrap',
				state === 'select'
					&& 'after:absolute after:left-0 after:right-0 after:top-full after:h-0.5 after:bg-current',
			)}
		>
			{label}
		</span>
	)

	const chevronNode = trailing === 'chevron' && (
		<Icon
			name="arrowDolu"
			className="size-6 shrink-0 transition-transform group-hover:-rotate-180 group-focus-visible:-rotate-180 group-data-[state=open]:-rotate-180"
			aria-hidden="true"
		/>
	)

	const showBadge = trailing === 'badge' && badgeCount != null
	const iconNode = icon && (
		showBadge
			? (
				<span className="relative inline-flex shrink-0">
					<Icon name={icon} className="size-6" aria-hidden="true" />
					<span
						aria-label={`${badgeCount}`}
						className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-npi-blue text-center text-npi-white text-[12px] font-bold leading-none tabular-nums"
					>
						{badgeCount}
					</span>
				</span>
			)
			: <Icon name={icon} className="size-6 shrink-0" aria-hidden="true" />
	)

	const content = (
		<>
			{iconNode}
			{labelNode}
			{chevronNode}
		</>
	)

	// Inside NavigationMenuItems: use Radix primitives so hover/focus/keyboard open the subnav.
	if (insideItems) {
		const { onMouseEnter, onFocus, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement>

		if (hasSubnav) {
			return (
				<RadixNavMenu.Item asChild>
					<li className="relative flex">
						<RadixNavMenu.Trigger asChild>
							<a
								ref={ref as React.Ref<HTMLAnchorElement>}
								className={baseClass}
								aria-current={state === 'select' ? 'page' : undefined}
								onMouseEnter={onMouseEnter}
								onFocus={onFocus}
								{...anchorProps}
							>
								{content}
							</a>
						</RadixNavMenu.Trigger>
						{/* Content has no visual styling — the Subnav child places itself (narrow: anchored here; wide: portals to nav root).
						    top offset accounts for the List's bottom `py-npi-4` so narrow panels align with wide ones (which anchor to the List's bottom). */}
						<RadixNavMenu.Content className="absolute left-0 top-[calc(100%+var(--spacing-npi-4))] z-20">
							{children}
						</RadixNavMenu.Content>
					</li>
				</RadixNavMenu.Item>
			)
		}

		return (
			<RadixNavMenu.Item asChild>
				<li className="relative flex">
					<RadixNavMenu.Link asChild>
						<a
							ref={ref as React.Ref<HTMLAnchorElement>}
							className={baseClass}
							aria-current={state === 'select' ? 'page' : undefined}
							{...anchorProps}
						>
							{content}
						</a>
					</RadixNavMenu.Link>
				</li>
			</RadixNavMenu.Item>
		)
	}

	// Outside NavigationMenuItems (subnav columns, right actions, standalone): plain HTML.
	if (as === 'button') {
		const { type, ...buttonProps } = rest as ButtonHTMLAttributes<HTMLButtonElement>
		return (
			<li className="flex">
				<button
					ref={ref as React.Ref<HTMLButtonElement>}
					type={type ?? 'button'}
					className={baseClass}
					{...buttonProps}
				>
					{content}
				</button>
			</li>
		)
	}

	const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>
	return (
		<li className="flex">
			<a
				ref={ref as React.Ref<HTMLAnchorElement>}
				className={baseClass}
				aria-current={state === 'select' ? 'page' : undefined}
				{...anchorProps}
			>
				{content}
			</a>
		</li>
	)
})
NavigationMenuItem.displayName = 'NavigationMenuItem'

export interface NavigationSubnavProps extends HTMLAttributes<HTMLDivElement> {
	/** `wide` = 1064px panel, up to 4 columns, optional Promo card. `narrow` = 320px panel, single column. */
	variant?: NavigationSubnavVariant
}

export const NavigationSubnav = forwardRef<HTMLDivElement, NavigationSubnavProps>(
	({ variant = 'wide', className, children, ...props }, ref) => {
		const insideItems = useContext(InsideItemsContext)
		const widePortalEl = useContext(WidePortalContext)

		const panel = (
			<div
				ref={ref}
				className={twMerge(
					clsx(
						'pointer-events-auto rounded-npi-xs bg-npi-white shadow-npi-m',
						variant === 'wide' ? 'w-[1064px] p-npi-10' : 'w-[320px] p-npi-8',
						className,
					),
				)}
				{...props}
			>
				{children}
			</div>
		)

		// Standalone (not inside NavigationMenuItems): render inline, no absolute positioning.
		if (!insideItems) return panel

		// Wide: portal to the nav Root's target so it spans the full layout width regardless of trigger.
		if (variant === 'wide' && widePortalEl) return createPortal(panel, widePortalEl)

		// Narrow: anchor to the trigger's <li> (Content already positions it absolutely).
		return panel
	},
)
NavigationSubnav.displayName = 'NavigationSubnav'

export interface NavigationSubnavColumnsProps extends HTMLAttributes<HTMLDivElement> {}

export const NavigationSubnavColumns = forwardRef<HTMLDivElement, NavigationSubnavColumnsProps>(
	({ className, children, ...props }, ref) => (
		<div
			ref={ref}
			className={twMerge(clsx('grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-npi-10', className))}
			{...props}
		>
			{children}
		</div>
	),
)
NavigationSubnavColumns.displayName = 'NavigationSubnavColumns'

export interface NavigationSubnavColumnProps extends HTMLAttributes<HTMLUListElement> {}

export const NavigationSubnavColumn = forwardRef<HTMLUListElement, NavigationSubnavColumnProps>(
	({ className, children, ...props }, ref) => (
		<ul ref={ref} className={twMerge(clsx('flex flex-col gap-npi-4', className))} {...props}>
			{children}
		</ul>
	),
)
NavigationSubnavColumn.displayName = 'NavigationSubnavColumn'

export interface NavigationSubnavGroupProps extends HTMLAttributes<HTMLLIElement> {
	/** Group heading — rendered as a bold link (acts as a MenuItem). */
	heading: ReactNode
	/** Optional href for the heading. Omit for a non-link heading. */
	headingHref?: string
}

/** Groups a bold heading with its nested (indented, regular-weight) items. Used inside narrow Subnavs. */
export const NavigationSubnavGroup = forwardRef<HTMLLIElement, NavigationSubnavGroupProps>(
	({ heading, headingHref, className, children, ...props }, ref) => (
		<li ref={ref} className={twMerge(clsx('flex flex-col gap-npi-3', className))} {...props}>
			<a
				href={headingHref}
				className="font-bold text-[1rem] leading-[1.5] text-npi-blue hover:text-npi-blue-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light"
			>
				{heading}
			</a>
			<ul className="flex flex-col gap-npi-2 pl-npi-4">{children}</ul>
		</li>
	),
)
NavigationSubnavGroup.displayName = 'NavigationSubnavGroup'

/** Nested item used inside a NavigationSubnavGroup — regular weight, indented by the group. */
export interface NavigationSubnavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const NavigationSubnavItem = forwardRef<HTMLAnchorElement, NavigationSubnavItemProps>(
	({ className, children, ...props }, ref) => (
		<li className="flex">
			<a
				ref={ref}
				className={twMerge(
					clsx(
						'font-normal text-[1rem] leading-[1.5] text-npi-blue hover:text-npi-blue-dark',
						'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
						className,
					),
				)}
				{...props}
			>
				{children}
			</a>
		</li>
	),
)
NavigationSubnavItem.displayName = 'NavigationSubnavItem'

export interface NavigationPromoProps extends Omit<HTMLAttributes<HTMLAnchorElement>, 'title'> {
	/** `icon` = small card with an icon medallion and a title. `cover` = large card with a photo background and title overlay. */
	variant?: NavigationPromoVariant
	/** Small label shown above the title (e.g. "Nejnovější podcast"). */
	eyebrow?: string
	/** Main title — bold, dark-navy. */
	title: ReactNode
	/** Link target for the card. */
	href?: string
	/** Leading icon (used by `icon` variant). */
	icon?: IconName
	/** Cover image URL (used by `cover` variant). */
	coverSrc?: string
	/** Optional caption below the cover (only `cover` variant). */
	caption?: ReactNode
}

export const NavigationPromo = forwardRef<HTMLAnchorElement, NavigationPromoProps>(
	({ variant = 'icon', eyebrow, title, icon = 'podcast', coverSrc, caption, href, className, ...props }, ref) => {
		if (variant === 'icon') {
			return (
				<a
					ref={ref}
					href={href}
					className={twMerge(
						clsx(
							'flex items-start gap-npi-4 rounded-npi-xs bg-npi-bg-light p-npi-6',
							'hover:bg-npi-blue-lighter focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
							className,
						),
					)}
					{...props}
				>
					<span className="inline-flex size-npi-10 shrink-0 items-center justify-center text-npi-blue">
						<Icon name={icon} className="size-6" aria-hidden="true" />
					</span>
					<span className="flex min-w-0 flex-col gap-npi-1">
						{eyebrow && (
							<Text asChild variant="m" secondary>
								<span>{eyebrow}</span>
							</Text>
						)}
						<Text asChild variant="l" weight="bold">
							<span>{title}</span>
						</Text>
					</span>
				</a>
			)
		}

		return (
			<a
				ref={ref}
				href={href}
				className={twMerge(
					clsx(
						'flex flex-col gap-npi-2 rounded-npi-xs',
						'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
						className,
					),
				)}
				{...props}
			>
				{eyebrow && (
					<Text asChild variant="m" secondary>
						<span>{eyebrow}</span>
					</Text>
				)}
				<div className="relative overflow-hidden rounded-npi-xs bg-npi-blue">
					{coverSrc && <img src={coverSrc} alt="" className="h-[180px] w-full object-cover" />}
					<div className="absolute inset-0 flex items-center p-npi-6">
						<Text asChild variant="xl" weight="bold" inverted>
							<span>{title}</span>
						</Text>
					</div>
				</div>
				{caption && (
					<Text asChild variant="m" secondary>
						<span>{caption}</span>
					</Text>
				)}
			</a>
		)
	},
)
NavigationPromo.displayName = 'NavigationPromo'
