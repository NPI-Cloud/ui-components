import { Accordion, AccordionItem } from '../components/Accordion'
import { OrgEmployeesBlock, type OrgEmployeeItem } from './OrgEmployeesBlock'

export interface OrgStructureAccordionUnit {
	/** Stable key (org-unit id). */
	id: string
	/** Unit name — the accordion header. */
	title: string
	/** Staff of the unit, shown inside the expanded panel. */
	employees: OrgEmployeeItem[]
	/** Initially expanded. */
	defaultOpen?: boolean
}

export interface OrgStructureAccordionBlockProps {
	units?: OrgStructureAccordionUnit[] | null
}

// Editor-canvas placeholder shown when no units are supplied (`units == null`) — the live-data
// `orgStructureAccordion` canvas previews a representative sample instead of a blank block.
const placeholderUnits: OrgStructureAccordionUnit[] = [
	{
		id: 'sample-1',
		title: 'Kancelář ředitele',
		defaultOpen: true,
		employees: [
			{ name: 'Jan Novák', position: 'Pozice', email: 'jan.novak@npi.cz', phone: '774 089 047' },
			{ name: 'Jana Nováková', position: 'Pozice', email: 'jana.novakova@npi.cz', phone: '774 089 048' },
		],
	},
	{ id: 'sample-2', title: 'Interní komunikace a rozvoj lidí', employees: [] },
	{ id: 'sample-3', title: 'Revizní pracoviště', employees: [] },
]

/**
 * Accordion of organizational units — one row per unit, its staff contact grid inside the
 * expanded panel. A unit with no staff still renders (the panel is just empty), so the
 * structure stays complete.
 */
export function OrgStructureAccordionBlock({ units }: OrgStructureAccordionBlockProps) {
	const resolved = units ?? placeholderUnits
	if (resolved.length === 0) return null
	return (
		<Accordion variant="plain" size="m" className="w-full">
			{resolved.map(unit => (
				<AccordionItem key={unit.id} title={unit.title} defaultOpen={unit.defaultOpen}>
					{unit.employees.length > 0 && <OrgEmployeesBlock items={unit.employees} columns={2} />}
				</AccordionItem>
			))}
		</Accordion>
	)
}
