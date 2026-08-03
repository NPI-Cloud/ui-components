'use client'

import { useState } from 'react'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { type IconName, iconRegistryM } from '../icons'
import { normalizeRichContent, TextBlock, type TextBlockRichContent } from './TextBlock'

export type ButtonBlockVariant = 'primary' | 'secondary' | 'tertiary' | 'tertiarySmall' | 'icon'

/** What the button does when clicked — navigate to `url`, or open `modal`. */
export type ButtonBlockAction = 'link' | 'modal'

/** A modal footer action either navigates to its own destination or just closes the dialog. */
export type ButtonBlockModalActionKind = 'link' | 'close'

export interface ButtonBlockModalAction {
	label?: string | null
	kind?: ButtonBlockModalActionKind | null
	/** Destination for a `link` action; ignored when the action closes the dialog. */
	url?: string | null
}

export interface ButtonBlockModal {
	title?: string | null
	/** The same rich-text document the text block renders, so modal copy formats identically. */
	body?: TextBlockRichContent | string | null
	primaryAction?: ButtonBlockModalAction | null
	/** Rendered only when given — the authoring side decides between one and two actions. */
	secondaryAction?: ButtonBlockModalAction | null
}

export interface ButtonBlockProps {
	label?: string | null
	url?: string | null
	/** Open the destination in a new browser tab (target="_blank", with safe rel). */
	newTab?: boolean | null
	variant?: ButtonBlockVariant | null
	inverted?: boolean | null
	disabled?: boolean | null
	iconBefore?: string | null
	iconAfter?: string | null
	/** `link` (the default) navigates to `url`; `modal` opens `modal` instead. */
	action?: ButtonBlockAction | null
	modal?: ButtonBlockModal | null
}

const variantMap: Record<ButtonBlockVariant, 'primary' | 'secondary' | 'tertiary' | 'tertiary-s' | 'icon'> = {
	primary: 'primary',
	secondary: 'secondary',
	tertiary: 'tertiary',
	tertiarySmall: 'tertiary-s',
	icon: 'icon',
}

const toIconName = (raw: string | null | undefined): IconName | undefined => raw && raw in iconRegistryM ? raw as IconName : undefined

export function ButtonBlock({ label, url, newTab, variant, inverted, disabled, iconBefore, iconAfter, action, modal }: ButtonBlockProps) {
	const [modalOpen, setModalOpen] = useState(false)
	const opensModal = action === 'modal'
	const closeModal = () => setModalOpen(false)
	return (
		<>
			<Button
				label={label || 'Tlačítko'}
				// A modal button is a real <button>: it must not navigate, so it carries no href even
				// when the block still holds a link destination authored before the action was switched.
				href={opensModal ? undefined : url || undefined}
				target={!opensModal && newTab ? '_blank' : undefined}
				rel={!opensModal && newTab ? 'noopener noreferrer' : undefined}
				onClick={opensModal ? () => setModalOpen(true) : undefined}
				variant={variant ? variantMap[variant] : 'primary'}
				inverted={inverted ?? false}
				disabled={disabled ?? false}
				iconBefore={toIconName(iconBefore)}
				iconAfter={toIconName(iconAfter)}
			/>
			{opensModal && (
				<Modal
					open={modalOpen}
					onClose={closeModal}
					title={modal?.title || undefined}
					actions={renderModalActions(modal, closeModal)}
				>
					{renderModalBody(modal?.body)}
				</Modal>
			)}
		</>
	)
}

// Empty (or whitespace-only) rich text renders nothing at all — TextBlock's own "Textový blok"
// placeholder is an editor affordance and would read as real copy inside a dialog.
function renderModalBody(body: ButtonBlockModal['body']) {
	return normalizeRichContent(body) ? <TextBlock variant="m" content={body} /> : null
}

// The footer row: primary action first, optional secondary beside it. Their visual weight is fixed
// (primary / secondary button) so every modal keeps the same hierarchy regardless of what its
// actions do.
function renderModalActions(modal: ButtonBlockModal | null | undefined, close: () => void) {
	if (!modal) return null
	const primary = renderModalAction(modal.primaryAction, 'primary', close)
	const secondary = renderModalAction(modal.secondaryAction, 'secondary', close)
	if (!primary && !secondary) return null
	return (
		<>
			{primary}
			{secondary}
		</>
	)
}

function renderModalAction(action: ButtonBlockModalAction | null | undefined, variant: 'primary' | 'secondary', close: () => void) {
	if (!action) return null
	const label = action.label?.trim()
	if (!label) return null
	// A `link` action whose destination isn't filled in yet closes the dialog instead of rendering a
	// dead button.
	const href = action.kind === 'link' ? action.url || undefined : undefined
	return <Button label={label} variant={variant} href={href} onClick={href ? undefined : close} />
}
