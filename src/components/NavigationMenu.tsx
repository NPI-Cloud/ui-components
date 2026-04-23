import * as RadixNavMenu from '@radix-ui/react-navigation-menu'
import { clsx } from 'clsx'
import {
	type AnchorHTMLAttributes,
	type ButtonHTMLAttributes,
	Children,
	createContext,
	forwardRef,
	type HTMLAttributes,
	isValidElement,
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

/**
 * Signals to nested `NavigationMenuItem`s / `NavigationSubnav`s that they live inside a
 * `NavigationMenuDrawer`. Items render as accordion rows with inline expansion; subnavs render
 * inline (no portal, no panel styling, no wide/narrow width).
 */
const InsideDrawerContext = createContext(false)

/**
 * Signals to nested `NavigationMenuItem`s that they live inside an expanded drawer group
 * (a `NavigationSubnav` child rendered under a drawer accordion). Items render as lighter
 * 14px regular links with no divider borders.
 */
const InsideDrawerGroupContext = createContext(false)

type MobileState = { open: boolean; toggle: () => void; close: () => void }
const MobileContext = createContext<MobileState>({ open: false, toggle: () => {}, close: () => {} })

export interface NavigationMenuProps extends HTMLAttributes<HTMLElement> {}

export const NavigationMenu = forwardRef<HTMLElement, NavigationMenuProps>(
	({ className, children, ...props }, ref) => {
		const [open, setOpen] = useState(false)
		const mobile: MobileState = {
			open,
			toggle: () => setOpen(v => !v),
			close: () => setOpen(false),
		}
		return (
			<MobileContext.Provider value={mobile}>
				<header
					ref={ref}
					data-mobile-open={open ? '' : undefined}
					className={twMerge(clsx('relative flex flex-col font-npi-sans bg-npi-white', className))}
					{...props}
				>
					{children}
				</header>
			</MobileContext.Provider>
		)
	},
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
		const insideDrawer = useContext(InsideDrawerContext)
		const inList = sites.some(site => site.label === currentLabel)
		const resolved = inList ? sites : [{ label: currentLabel, href: '#' }, ...sites]

		// Inside the mobile drawer: render as a full-bleed dark block with a vertical list. Negates the
		// drawer's side/bottom padding so the dark surface reaches the viewport edges and the drawer bottom.
		if (insideDrawer) {
			return (
				<div
					ref={ref}
					className={twMerge(
						clsx(
							'-mx-npi-6 -mb-npi-8 bg-npi-bg-dark px-npi-6 py-npi-6 text-[0.875rem] leading-[1.3] text-npi-white',
							className,
						),
					)}
					{...props}
				>
					<ul className="flex flex-col gap-npi-4">
						{resolved.map(site => {
							const isCurrent = site.label === currentLabel
							return (
								<li key={site.label} className="flex">
									<a
										href={site.href}
										aria-current={isCurrent ? 'page' : undefined}
										className={clsx(
											'inline-flex items-center transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light rounded-npi-xxs',
											isCurrent
												? 'text-npi-white underline underline-offset-4'
												: 'text-npi-white/80 hover:text-npi-white',
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
		}

		return (
			<div
				ref={ref}
				className={twMerge(
					clsx('bg-npi-bg-dark py-npi-3 text-[0.875rem] leading-[1.3] text-npi-white max-npi-desktop:hidden', className),
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
				<Heading level={7} className="whitespace-nowrap text-[1rem] font-semibold">
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
					'flex w-[328px] max-w-full shrink items-center justify-between gap-npi-2 rounded-full border border-npi-gray-200 bg-npi-white py-npi-1 pl-npi-6 pr-npi-1 max-npi-desktop:w-full',
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

export interface NavigationMenuMobileToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
	/** Accessible label for the closed (hamburger) state. Defaults to "Otevřít menu". */
	openLabel?: string
	/** Accessible label for the open (X) state. Defaults to "Zavřít menu". */
	closeLabel?: string
}

/**
 * Hamburger/close button shown only below 1064px. Toggles the `NavigationMenuDrawer` open
 * state. Place it inside `NavigationMenuBar` next to the brand — the drawer opens in-place.
 */
export const NavigationMenuMobileToggle = forwardRef<HTMLButtonElement, NavigationMenuMobileToggleProps>(
	({ openLabel = 'Otevřít menu', closeLabel = 'Zavřít menu', className, onClick, ...props }, ref) => {
		const { open, toggle } = useContext(MobileContext)
		return (
			<button
				ref={ref}
				type="button"
				aria-expanded={open}
				aria-label={open ? closeLabel : openLabel}
				onClick={event => {
					toggle()
					onClick?.(event)
				}}
				className={twMerge(
					clsx(
						'inline-flex size-npi-8 shrink-0 cursor-pointer items-center justify-center rounded-npi-xxs text-npi-blue',
						'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
						'npi-desktop:hidden',
						className,
					),
				)}
				{...props}
			>
				<Icon name={open ? 'zavrit' : 'seznam'} className="size-6" aria-hidden="true" />
			</button>
		)
	},
)
NavigationMenuMobileToggle.displayName = 'NavigationMenuMobileToggle'

export interface NavigationMenuDrawerProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Mobile drawer panel. Renders only below 1064px and only when the `NavigationMenuMobileToggle`
 * is toggled open. Children render as a vertical stack with dividers — pass `NavigationMenuSearch`,
 * `Button`, and `NavigationMenuItem`s (parents with `NavigationSubnav` become accordion sections).
 */
export const NavigationMenuDrawer = forwardRef<HTMLDivElement, NavigationMenuDrawerProps>(
	({ className, children, ...props }, ref) => {
		const { open } = useContext(MobileContext)
		if (!open) return null
		return (
			<InsideDrawerContext.Provider value={true}>
				<div
					ref={ref}
					className={twMerge(
						clsx(
							'flex w-full flex-col gap-npi-6 bg-npi-white px-npi-6 pt-npi-2 pb-npi-8 npi-desktop:hidden',
							className,
						),
					)}
					{...props}
				>
					{children}
				</div>
			</InsideDrawerContext.Provider>
		)
	},
)
NavigationMenuDrawer.displayName = 'NavigationMenuDrawer'

export type NavigationMenuItemsProps = React.ComponentPropsWithoutRef<typeof RadixNavMenu.Root>

export const NavigationMenuItems = forwardRef<
	React.ElementRef<typeof RadixNavMenu.Root>,
	NavigationMenuItemsProps
>(({ className, children, ...props }, ref) => {
	const insideDrawer = useContext(InsideDrawerContext)
	const [widePortalEl, setWidePortalEl] = useState<HTMLDivElement | null>(null)

	// Inside the drawer: render items as a tight vertical list. No Radix Root (no popovers), no
	// horizontal max-width, no gap between rows — each row's own py + border-b handles spacing so
	// the label sits visually centered in its cell.
	if (insideDrawer) {
		return (
			<ul
				className={twMerge(clsx('flex w-full flex-col', className as string | undefined))}
				aria-label="Hlavní navigace"
			>
				{children}
			</ul>
		)
	}

	return (
		<RadixNavMenu.Root
			ref={ref}
			aria-label="Hlavní navigace"
			className={twMerge(
				clsx('relative mx-auto flex w-full max-w-npi-layout justify-center px-npi-6 max-npi-desktop:hidden', className),
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
	const insideDrawer = useContext(InsideDrawerContext)
	const insideGroup = useContext(InsideDrawerGroupContext)
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

	const hasSubnav = children != null && (insideItems || insideDrawer)
	const trailing = trailingProp ?? (hasSubnav ? 'chevron' : 'none')
	const isIconOnly = !label && icon != null

	// Inside NavigationMenuDrawer: render accordion row (with children) or plain divider-separated row.
	// Inside an expanded drawer group: render as a lighter 14px regular link, no divider.
	if (insideDrawer) {
		const anchorProps = rest as AnchorHTMLAttributes<HTMLAnchorElement>

		// Account-style row (icon + label, no children): borderless, tight, left-aligned.
		// Use for the profile / cart buttons at the bottom of the drawer.
		if (icon && label && !insideGroup && !hasSubnav) {
			const showBadge = trailing === 'badge' && badgeCount != null
			return (
				<a
					ref={ref as React.Ref<HTMLAnchorElement>}
					className={twMerge(
						clsx(
							'inline-flex items-center gap-npi-2 py-npi-2 font-bold text-[1rem] leading-[1.5] text-npi-blue hover:text-npi-blue-dark',
							'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light rounded-npi-xxs',
							className,
						),
					)}
					aria-current={state === 'select' ? 'page' : undefined}
					{...anchorProps}
				>
					{showBadge
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
						: <Icon name={icon} className="size-6 shrink-0" aria-hidden="true" />}
					<span className="whitespace-nowrap">{label}</span>
				</a>
			)
		}

		if (insideGroup) {
			return (
				<li className="flex w-full">
					<a
						ref={ref as React.Ref<HTMLAnchorElement>}
						className={twMerge(
							clsx(
								'w-full font-normal text-[0.875rem] leading-[20px] text-npi-blue hover:text-npi-blue-dark',
								'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light rounded-npi-xxs',
								className,
							),
						)}
						aria-current={state === 'select' ? 'page' : undefined}
						{...anchorProps}
					>
						<span className="whitespace-nowrap">{label}</span>
					</a>
				</li>
			)
		}

		const drawerRowClass =
			'flex w-full items-center justify-between py-npi-4 font-bold text-[1rem] leading-[1.5] text-npi-blue hover:text-npi-blue-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light rounded-npi-xxs cursor-pointer'
		const liClass = 'flex w-full flex-col border-b border-npi-gray-200'

		if (hasSubnav) {
			return (
				<li className={liClass}>
					<details className="group flex w-full flex-col">
						<summary
							className={twMerge(clsx(drawerRowClass, 'list-none [&::-webkit-details-marker]:hidden', className))}
						>
							<span className="whitespace-nowrap">{label}</span>
							<Icon
								name="arrowDolu"
								className="size-6 shrink-0 transition-transform group-open:-rotate-180"
								aria-hidden="true"
							/>
						</summary>
						<div className="flex flex-col gap-npi-4 pb-npi-4 pl-npi-6">{children}</div>
					</details>
				</li>
			)
		}

		return (
			<li className={liClass}>
				<a
					ref={ref as React.Ref<HTMLAnchorElement>}
					className={twMerge(clsx(drawerRowClass, className))}
					aria-current={state === 'select' ? 'page' : undefined}
					{...anchorProps}
				>
					<span className="whitespace-nowrap">{label}</span>
				</a>
			</li>
		)
	}

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
						{
							/* Content has no visual styling — the Subnav child places itself (narrow: anchored here; wide: portals to nav root).
						    top offset accounts for the List's bottom `py-npi-4` so narrow panels align with wide ones (which anchor to the List's bottom). */
						}
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
		const insideDrawer = useContext(InsideDrawerContext)
		const widePortalEl = useContext(WidePortalContext)

		// Inside the mobile drawer: render children inline with no panel styling. Wide/narrow variant is
		// irrelevant — columns flatten to a single vertical stack. Signal `InsideDrawerGroup` so nested
		// items render as lighter 14px regular links with no dividers (per Figma spec).
		if (insideDrawer) {
			return (
				<InsideDrawerGroupContext.Provider value={true}>
					<div ref={ref} className={twMerge(clsx('flex w-full flex-col gap-npi-4', className))} {...props}>
						{children}
					</div>
				</InsideDrawerGroupContext.Provider>
			)
		}

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
	({ className, children, ...props }, ref) => {
		const insideDrawer = useContext(InsideDrawerContext)

		if (insideDrawer) {
			// Split children: Promo cards vs. everything else (link columns). At tablet+ when a Promo
			// exists, render as 2 cols — all link columns stacked in col 1, Promo in col 2.
			const kids = Children.toArray(children)
			const promos = kids.filter(c => isValidElement(c) && c.type === NavigationPromo)
			const items = kids.filter(c => !(isValidElement(c) && c.type === NavigationPromo))
			const hasPromo = promos.length > 0

			return (
				<div
					ref={ref}
					className={twMerge(
						clsx(
							'flex flex-col gap-npi-4',
							hasPromo && 'npi-tablet:grid npi-tablet:grid-cols-2 npi-tablet:gap-npi-8',
							className,
						),
					)}
					{...props}
				>
					<div className="flex flex-col gap-npi-4">{items}</div>
					{hasPromo && <div className="flex flex-col pb-npi-2 npi-tablet:pb-0">{promos}</div>}
				</div>
			)
		}

		return (
			<div
				ref={ref}
				className={twMerge(clsx('grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-npi-10', className))}
				{...props}
			>
				{children}
			</div>
		)
	},
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
	({ heading, headingHref, className, children, ...props }, ref) => {
		const insideDrawer = useContext(InsideDrawerContext)
		const headingClass = insideDrawer
			? 'font-normal text-[0.875rem] leading-[20px] text-npi-blue hover:text-npi-blue-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light rounded-npi-xxs'
			: 'font-bold text-[1rem] leading-[1.5] text-npi-blue hover:text-npi-blue-dark focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light'
		return (
			<li ref={ref} className={twMerge(clsx('flex flex-col', insideDrawer ? 'gap-npi-2' : 'gap-npi-3', className))} {...props}>
				<a href={headingHref} className={headingClass}>
					{heading}
				</a>
				<ul className={clsx('flex flex-col pl-npi-4', insideDrawer ? 'gap-npi-2' : 'gap-npi-2')}>{children}</ul>
			</li>
		)
	},
)
NavigationSubnavGroup.displayName = 'NavigationSubnavGroup'

/** Nested item used inside a NavigationSubnavGroup — regular weight, indented by the group. */
export interface NavigationSubnavItemProps extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export const NavigationSubnavItem = forwardRef<HTMLAnchorElement, NavigationSubnavItemProps>(
	({ className, children, ...props }, ref) => {
		const insideDrawer = useContext(InsideDrawerContext)
		return (
			<li className="flex">
				<a
					ref={ref}
					className={twMerge(
						clsx(
							insideDrawer
								? 'font-normal text-[0.875rem] leading-[20px] text-npi-blue hover:text-npi-blue-dark'
								: 'font-normal text-[1rem] leading-[1.5] text-npi-blue hover:text-npi-blue-dark',
							'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
							className,
						),
					)}
					{...props}
				>
					{children}
				</a>
			</li>
		)
	},
)
NavigationSubnavItem.displayName = 'NavigationSubnavItem'

export interface NavigationPromoProps extends Omit<HTMLAttributes<HTMLAnchorElement>, 'title'> {
	/** `icon` = horizontal card with an icon and a bold title. `cover` = label above a cover image. */
	variant?: NavigationPromoVariant
	/** Small label shown above the title in the `icon` variant (e.g. "Nejnovější podcast"). Not used in `cover`. */
	eyebrow?: string
	/** Primary text — bold navy for `icon`, regular label above the image for `cover`. */
	title: ReactNode
	/** Link target for the card. */
	href?: string
	/** Leading icon (used by `icon` variant). */
	icon?: IconName
	/** Cover image URL (used by `cover` variant). */
	coverSrc?: string
}

export const NavigationPromo = forwardRef<HTMLAnchorElement, NavigationPromoProps>(
	({ variant = 'icon', eyebrow, title, icon = 'podcast', coverSrc, href, className, ...props }, ref) => {
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
					<Icon name={icon} className="size-8 shrink-0 text-npi-blue" aria-hidden="true" />
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
						'flex flex-col gap-npi-2',
						'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-npi-blue-light',
						className,
					),
				)}
				{...props}
			>
				<Text asChild variant="m" secondary>
					<span>{title}</span>
				</Text>
				{coverSrc && <img src={coverSrc} alt="" className="aspect-video w-full rounded-npi-xs object-cover" />}
			</a>
		)
	},
)
NavigationPromo.displayName = 'NavigationPromo'
