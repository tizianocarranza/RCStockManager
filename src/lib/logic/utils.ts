import { PRODUCT_TYPES } from './productTypes';


/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified delay has elapsed since the last time it was invoked.
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout>;

	return (...args: Parameters<T>) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
}

export function formatStockLogDate(date: Date) {
	const d = new Date(date);
	return d.toLocaleString('es-AR', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).replace(',', ''); // "16 Oct 2025 10:45"
}

export function formatTime(date: Date) {
	return date.toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false
	});
}

/** slug de tipo ('tanque-combustible') → etiqueta plural ('Tanques de combustible') */
export const modelTypeToCategoryLabel = Object.fromEntries(
	PRODUCT_TYPES.map((t) => [t.slug, t.plural])
) as Record<string, string>;
