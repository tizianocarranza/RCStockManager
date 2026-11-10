import { DEFAULT_RANGE } from '$lib/logic/statsRange';

/** Estado del panel de estadísticas: rango elegido y contador para forzar recarga. */
export let statsState = $state({
	range: DEFAULT_RANGE,
	version: 0
});
