import { ContactCard } from '../components/ProfileCard'

export interface ContactCardBlockProps {
	/** Full name — stored on shared `heading`. */
	name?: string | null
	/** Role / affiliation — stored on shared `subtitle`. */
	role?: string | null
	phone?: string | null
	email?: string | null
}

export function ContactCardBlock({ name, role, phone, email }: ContactCardBlockProps) {
	return (
		<ContactCard
			name={name || 'Jméno Příjmení'}
			role={role || undefined}
			phone={phone || undefined}
			email={email || undefined}
		/>
	)
}
