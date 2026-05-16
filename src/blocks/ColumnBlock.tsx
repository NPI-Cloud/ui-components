'use client'

export function ColumnBlock({ label }: { label?: string }) {
	return (
		<div className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium text-slate-400">
			{label ?? 'Další sloupec'}
		</div>
	)
}
