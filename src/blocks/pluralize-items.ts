/** Czech plural of „položka" for an item count shown on the editor marker bars. */
export function pluralizeItems(count: number): string {
	if (count === 1) return 'položka'
	if (count >= 2 && count <= 4) return 'položky'
	return 'položek'
}
