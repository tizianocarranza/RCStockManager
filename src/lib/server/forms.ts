import type { Tipo } from '$lib/logic/productTypes';

export type ParseResult =
	| { ok: true; fields: Record<string, unknown> }
	| { ok: false; message: string };

const str = (data: FormData, key: string) => {
	const v = data.get(key)?.toString().trim();
	return v ? v : undefined;
};

/**
 * Lee y valida los campos de producto de un formulario (crear / editar).
 * Devuelve los campos listos para Mongoose según el tipo.
 */
export function parseProductForm(data: FormData, tipo: Tipo): ParseResult {
	const errors: string[] = [];

	const num = (key: string, label: string, opts: { int?: boolean } = {}) => {
		const raw = str(data, key);
		if (raw === undefined) return undefined;
		const n = Number(raw.replace(',', '.'));
		if (!Number.isFinite(n) || n < 0 || (opts.int && !Number.isInteger(n))) {
			errors.push(`${label} inválido.`);
			return undefined;
		}
		return n;
	};

	const codigo = str(data, 'codigo')?.toUpperCase();
	const detalle = str(data, 'detalle');
	const cantidad = num('cantidad', 'Cantidad', { int: true }) ?? 0;
	if (!codigo) errors.push('El código es requerido.');
	if (!detalle) errors.push('El detalle es requerido.');

	const fields: Record<string, unknown> = {
		codigo,
		detalle,
		cantidad,
		notas: str(data, 'notas') ?? ''
	};

	const dimensiones: Record<string, number> = {};
	for (const [key, label] of [
		['alto', 'Alto'],
		['ancho', 'Ancho'],
		['espesor', 'Espesor']
	] as const) {
		const v = num(key, label);
		if (v !== undefined) dimensiones[key] = v;
	}
	if (Object.keys(dimensiones).length > 0) fields.dimensiones = dimensiones;

	if (tipo === 'radiador' || tipo === 'panel') {
		const material = str(data, 'material');
		if (!material) errors.push('El material es requerido.');
		fields.material = material;
	}

	if (tipo === 'panel') {
		const filas: Record<string, unknown> = {};
		const numero = num('numero-filas', 'Número de filas', { int: true });
		const tipoFilas = str(data, 'tipo-filas');
		if (numero !== undefined) filas.numero = numero;
		if (tipoFilas) filas.tipo = tipoFilas;
		if (Object.keys(filas).length > 0) fields.filas = filas;
	}

	if (tipo === 'electroventilador') {
		const diametro = num('diametro', 'Diámetro');
		const aspas = num('aspas', 'Número de aspas', { int: true });
		if (diametro !== undefined) fields.diametro = diametro;
		if (aspas !== undefined) fields.aspas = aspas;
	}

	if (errors.length > 0) return { ok: false, message: errors.join(' ') };
	return { ok: true, fields };
}

/** Cantidad de movimiento de stock: entero positivo. */
export function parseAmount(raw: unknown): number | null {
	const n = Number(raw);
	return Number.isInteger(n) && n > 0 ? n : null;
}
