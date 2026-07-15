'use client'

import type { ReactNode } from 'react'
import { Tab, TabList, TabPanel, Tabs, type TabVariant } from '../components/Tab'

export const tabsBlockVariants = ['segmented', 'pill'] as const
export type TabsBlockVariant = (typeof tabsBlockVariants)[number]

export interface TabsBlockTab {
	/** Stable identity of the tab (the `tabItem` marker block's id). */
	id: string
	/** Tab label — falls back to `Záložka N` when the editor left it blank. */
	title: string | null | undefined
	children: ReactNode
}

export interface TabsBlockProps {
	variant?: TabsBlockVariant | null
	tabs: TabsBlockTab[]
	className?: string
}

export const tabsBlockTabFallbackTitle = (index: number): string => `Záložka ${index + 1}`

// Tabs group renderer shared by the public site and the admin's read-only section view. The
// editor canvas renders its own controlled tab bar (drop zones, selection) from the same atomics.
export function TabsBlock({ variant, tabs, className }: TabsBlockProps) {
	if (tabs.length === 0) return null
	return (
		<Tabs defaultValue={tabs[0]!.id} variant={(variant ?? 'segmented') satisfies TabVariant} className={className}>
			<TabList>
				{tabs.map((tab, i) => (
					<Tab key={tab.id} value={tab.id}>
						{tab.title?.trim() || tabsBlockTabFallbackTitle(i)}
					</Tab>
				))}
			</TabList>
			{tabs.map(tab => (
				<TabPanel key={tab.id} value={tab.id}>
					{tab.children}
				</TabPanel>
			))}
		</Tabs>
	)
}
