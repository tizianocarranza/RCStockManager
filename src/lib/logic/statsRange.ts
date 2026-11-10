/**
 * Rangos de tiempo y agrupación (hora / día / semana / mes) para las estadísticas.
 * Las fechas se agrupan en hora de Argentina (UTC-3, sin horario de verano).
 */
export const TIMEZONE = 'America/Argentina/Buenos_Aires';
const TZ_OFFSET_MS = -3 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** `phrase` completa frases como "sin egresos …". */
export const RANGES = [
	{ key: 'hoy', label: 'Hoy', phrase: 'hoy', days: 1 },
	{ key: '7d', label: '7 días', phrase: 'en los últimos 7 días', days: 7 },
	{ key: '30d', label: '30 días', phrase: 'en los últimos 30 días', days: 30 },
	{ key: '90d', label: '90 días', phrase: 'en los últimos 90 días', days: 90 },
	{ key: '12m', label: '12 meses', phrase: 'en los últimos 12 meses', days: 365 },
	{ key: 'all', label: 'Todo', phrase: 'en todo el historial', days: null }
] as const;

export type RangeKey = (typeof RANGES)[number]['key'];
export type Bucket = 'hour' | 'day' | 'week' | 'month';

export const DEFAULT_RANGE: RangeKey = '30d';

export const isRangeKey = (v: unknown): v is RangeKey => RANGES.some((r) => r.key === v);

/** Agrupación según la cantidad de días del rango. */
export function bucketFor(days: number): Bucket {
	if (days <= 1) return 'hour';
	if (days <= 31) return 'day';
	if (days <= 183) return 'week';
	return 'month';
}

/** Medianoche (hora Argentina) del día de `d`, como instante UTC. */
const startOfLocalDay = (d: Date) => {
	const local = d.getTime() + TZ_OFFSET_MS;
	return new Date(local - (((local % DAY_MS) + DAY_MS) % DAY_MS) - TZ_OFFSET_MS);
};

/**
 * Rango `[from, to]`. `from` es la medianoche local de hace (días - 1) días, así
 * "7 días" incluye hoy y los 6 anteriores. Para 'all', `from` es null.
 */
export function parseRange(key: RangeKey, now = new Date()) {
	const def = RANGES.find((r) => r.key === key) ?? RANGES[2];
	if (def.days === null) return { key: def.key, from: null, to: now, bucket: 'month' as Bucket };
	const from = new Date(startOfLocalDay(now).getTime() - (def.days - 1) * DAY_MS);
	return { key: def.key, from, to: now, bucket: bucketFor(def.days) };
}

/** Clave del período al que pertenece `d` (en hora Argentina). */
export function bucketKey(d: Date, bucket: Bucket): string {
	const local = new Date(d.getTime() + TZ_OFFSET_MS);
	if (bucket === 'week') {
		const dow = (local.getUTCDay() + 6) % 7; // lunes = 0
		local.setUTCDate(local.getUTCDate() - dow);
	}
	const iso = local.toISOString();
	if (bucket === 'hour') return iso.slice(0, 13); // 2026-03-15T10
	return bucket === 'month' ? iso.slice(0, 7) : iso.slice(0, 10);
}

/** Todas las claves de período entre `from` y `to`, en orden. */
export function bucketKeys(from: Date, to: Date, bucket: Bucket): string[] {
	const keys: string[] = [];
	const cursor = new Date(from.getTime() + TZ_OFFSET_MS);
	cursor.setUTCHours(0, 0, 0, 0);
	if (bucket === 'month') cursor.setUTCDate(1);
	const end = bucketKey(to, bucket);
	// Límite de seguridad: nunca más de ~10 años de días
	for (let i = 0; i < 4000; i++) {
		const key = bucketKey(new Date(cursor.getTime() - TZ_OFFSET_MS), bucket);
		if (keys[keys.length - 1] !== key) keys.push(key);
		if (key >= end) break;
		if (bucket === 'month') cursor.setUTCMonth(cursor.getUTCMonth() + 1);
		else if (bucket === 'hour') cursor.setTime(cursor.getTime() + HOUR_MS);
		else cursor.setUTCDate(cursor.getUTCDate() + (bucket === 'week' ? 7 : 1));
	}
	return keys;
}

export type SeriePoint = { key: string; ingreso: number; egreso: number };

/** Completa con ceros los períodos sin movimientos para que el gráfico no saltee fechas. */
export function fillBuckets(
	points: SeriePoint[],
	from: Date,
	to: Date,
	bucket: Bucket
): SeriePoint[] {
	const byKey = new Map(points.map((p) => [p.key, p]));
	return bucketKeys(from, to, bucket).map(
		(key) => byKey.get(key) ?? { key, ingreso: 0, egreso: 0 }
	);
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/** Etiqueta corta para el eje: "09:00", "14/03", "sem 10/03", "mar 2026". */
export function bucketLabel(key: string, bucket: Bucket): string {
	if (bucket === 'hour') return `${key.slice(11, 13)}:00`;
	const [y, m, d] = key.split('-');
	if (bucket === 'month') return `${MESES[Number(m) - 1]} ${y}`;
	return `${bucket === 'week' ? 'sem ' : ''}${d}/${m}`;
}
