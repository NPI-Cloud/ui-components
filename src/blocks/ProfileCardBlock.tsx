import { ProfileCard, type ProfileCardOrientation, type ProfileCardSize } from '../components/ProfileCard'

export type ProfileCardBlockSize = 's' | 'm'
export type ProfileCardBlockOrientation = 'horizontal' | 'vertical'

export interface ProfileCardBlockProps {
	/** Full name — stored on shared `heading`. */
	name?: string | null
	/** Role / position — stored on shared `subtitle`. */
	role?: string | null
	/** Avatar image URL — from `imageAsset.image.url`. */
	avatarSrc?: string | null
	avatarAlt?: string | null
	email?: string | null
	phone?: string | null
	size?: ProfileCardBlockSize | null
	orientation?: ProfileCardBlockOrientation | null
}

const sizeMap: Record<ProfileCardBlockSize, ProfileCardSize> = { s: 'S', m: 'M' }

export function ProfileCardBlock({
	name,
	role,
	avatarSrc,
	avatarAlt,
	email,
	phone,
	size,
	orientation,
}: ProfileCardBlockProps) {
	return (
		<ProfileCard
			name={name || 'Jméno Příjmení'}
			role={role || undefined}
			avatarSrc={avatarSrc || undefined}
			avatarAlt={avatarAlt || undefined}
			email={email || undefined}
			phone={phone || undefined}
			size={size ? sizeMap[size] : 'M'}
			orientation={(orientation as ProfileCardOrientation) || 'horizontal'}
		/>
	)
}
