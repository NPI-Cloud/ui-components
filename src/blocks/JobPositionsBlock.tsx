import { Icon } from '../icons'
import { Link } from '../components/ui-primitives'

export interface JobPositionsBlockItem {
	/** Position title — the row's link text. */
	title: string
	/** Contract type ("Hlavní pracovní poměr", "DPP", …). */
	workType?: string | null
	/** Work location ("Praha", "Remote", …). */
	location?: string | null
	/** Detail-page URL. A row without a link renders as plain text. */
	href?: string | null
}

export interface JobPositionsBlockProps {
	items?: JobPositionsBlockItem[] | null
}

// Editor-canvas placeholder shown when no items are supplied (`items == null`) — the live-data
// `jobPositions` canvas has no ATS access, so it previews a representative sample instead of a
// blank block.
const placeholderItems: JobPositionsBlockItem[] = [
	{ title: 'Tvůrce věcného obsahu vzdělávacího programu Koordinátor tvorby ŠVP', workType: 'Hlavní pracovní poměr', location: 'Praha, České Budějovice', href: '#' },
	{ title: 'Lektoři a lektorky vzdělávacích programů k revizím RVP', workType: 'Hlavní pracovní poměr', location: 'Praha', href: '#' },
	{ title: 'Lektor adresné podpory', workType: 'Brigáda', location: 'Remote', href: '#' },
]

function Row({ item }: { item: JobPositionsBlockItem }) {
	const content = (
		<>
			<p className="min-w-0 flex-1 font-npi-serif text-[1.25rem] font-medium leading-[1.4] text-npi-blue transition-colors group-hover:text-npi-blue-hover">
				{item.title}
			</p>
			{item.workType && <p className="text-[1rem] leading-[1.5] text-npi-text-primary @npi-tablet:w-[220px] @npi-tablet:shrink-0">{item.workType}</p>}
			{item.location && <p className="text-[1rem] leading-[1.5] text-npi-text-primary @npi-tablet:w-[220px] @npi-tablet:shrink-0">{item.location}</p>}
			<Icon name="arrowVpravo" size="m" className="hidden size-6 shrink-0 text-npi-blue @npi-tablet:block" aria-hidden="true" />
		</>
	)
	const rowClass = 'group flex flex-col gap-npi-2 border-t border-npi-gray-200 py-npi-6 @npi-tablet:flex-row @npi-tablet:items-center @npi-tablet:gap-npi-10'
	if (!item.href) return <div className={rowClass}>{content}</div>
	return (
		<Link href={item.href} className={rowClass}>
			{content}
		</Link>
	)
}

/**
 * Job positions list — one row per open position (title, contract type, location), each row
 * linking to the position's detail page. Divider lines above every row and below the last one
 * are part of the design.
 */
export function JobPositionsBlock({ items }: JobPositionsBlockProps) {
	const resolved = items ?? placeholderItems
	if (resolved.length === 0) return null
	return (
		<div className="flex w-full flex-col border-b border-npi-gray-200 font-npi-sans">
			{resolved.map((item, index) => <Row key={index} item={item} />)}
		</div>
	)
}
