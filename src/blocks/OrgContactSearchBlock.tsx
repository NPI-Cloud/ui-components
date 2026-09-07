import { SearchBar } from '../components/SearchBar'

export interface OrgContactSearchBlockProps {
	/**
	 * Where the form submits (a plain GET with `q`) — the site's contact results page. Omitted on the
	 * editor canvas, where `onSubmit` swallows the submit instead so a click cannot navigate the admin.
	 */
	action?: string
	onSubmit?: (value: string) => void
	/** Initial query — the results page seeds it with the active `q`. */
	defaultValue?: string
	className?: string
}

/**
 * The contact-search form of the NPI staff directory: a „Jméno" field with a Hledat button that
 * submits to the contact results page. The heading and intro around it are ordinary blocks; this is
 * only the form, so the results page can show the very same bar above its list.
 */
export function OrgContactSearchBlock({ action, onSubmit, defaultValue, className }: OrgContactSearchBlockProps) {
	return (
		<SearchBar
			label="Hledat v kontaktech"
			placeholder="Jméno"
			defaultValue={defaultValue}
			action={action}
			onSubmit={onSubmit}
			className={className}
		/>
	)
}
