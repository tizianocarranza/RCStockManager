import { json } from '@sveltejs/kit';
import { getStats } from '$lib/server/stats';
import { DEFAULT_RANGE, isRangeKey } from '$lib/logic/statsRange';
import type { RequestHandler } from './$types';

// Protegido por hooks.server.ts (401 sin sesión)
export const GET: RequestHandler = async ({ url }) => {
	const range = url.searchParams.get('range') ?? DEFAULT_RANGE;
	if (!isRangeKey(range)) {
		return json({ error: 'Rango inválido' }, { status: 400 });
	}

	try {
		return json(await getStats(range));
	} catch (error) {
		console.error('Error al calcular estadísticas:', error);
		return json({ error: 'Error al calcular estadísticas' }, { status: 500 });
	}
};
