import { clsx } from 'clsx'
import { ProfileCard } from '../components/ProfileCard'

export interface OrgEmployeeItem {
	/** Full name including academic titles ("Mgr. Jan Novák, Ph.D."). */
	name: string
	/** Job position shown under the name. */
	position?: string | null
	/** Work e-mail — rendered as a `mailto:` link. */
	email?: string | null
	/** Work phone — rendered as a `tel:` link. */
	phone?: string | null
}

export interface OrgEmployeesBlockProps {
	items?: OrgEmployeeItem[] | null
	/** Grid columns on tablet+ (mobile is always one column). */
	columns?: number | null
}

// Editor-canvas placeholder shown when no items are supplied (`items == null`) — the live-data
// `orgEmployees` canvas previews a representative sample instead of a blank block.
const placeholderItems: OrgEmployeeItem[] = [
	{ name: 'Jan Novák', position: 'Pozice', email: 'jan.novak@npi.cz', phone: '774 089 047' },
	{ name: 'Jana Nováková', position: 'Pozice', email: 'jana.novakova@npi.cz', phone: '774 089 048' },
	{ name: 'Petr Svoboda', position: 'Pozice', email: 'petr.svoboda@npi.cz', phone: '774 089 049' },
	{ name: 'Eva Dvořáková', position: 'Pozice', email: 'eva.dvorakova@npi.cz', phone: '774 089 050' },
]

// Literal strings so Tailwind (scanning this file) generates them.
const gridColsClass = (cols: number | null | undefined): string => {
	switch (cols) {
		case 1:
			return ''
		case 3:
			return '@npi-tablet:grid-cols-3'
		default:
			return '@npi-tablet:grid-cols-2'
	}
}

/**
 * Grid of NPI staff contact cards (`ProfileCard` size S) — name, position, e-mail and phone per
 * person. The staff directory carries no photos, so every avatar renders the initials fallback.
 *
 * `items-start`: a grid row stretches to its tallest card by default, which would push a short
 * card's vertically-centered text away from its avatar — keep every card at intrinsic height.
 */
export function OrgEmployeesBlock({ items, columns }: OrgEmployeesBlockProps) {
	const resolved = items ?? placeholderItems
	if (resolved.length === 0) return null
	return (
		<div className={clsx('grid w-full grid-cols-1 items-start gap-x-npi-10 gap-y-npi-8', gridColsClass(columns))}>
			{resolved.map((item, index) => (
				<ProfileCard
					key={index}
					size="S"
					name={item.name}
					role={item.position ?? undefined}
					email={item.email ?? undefined}
					phone={item.phone ?? undefined}
				/>
			))}
		</div>
	)
}
