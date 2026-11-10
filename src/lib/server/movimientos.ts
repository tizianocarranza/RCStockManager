import { Movimiento } from './models/Movimiento';
import type { Tipo } from '$lib/logic/productTypes';

type ProductLike = {
	_id: unknown;
	tipo?: string;
	codigo?: string;
	detalle?: string;
	marca?: string;
	cantidad?: number;
};

type LogInput = {
	product: ProductLike;
	tipo: Tipo;
	kind: 'ingreso' | 'egreso' | 'ajuste';
	cantidad: number;
	motivo?: 'alta' | 'edicion';
	fecha?: Date;
};

/**
 * Guarda un movimiento en el historial. Es "best effort": si falla se loguea
 * pero no se interrumpe la operación de stock (el stock es la fuente de verdad).
 */
export async function logMovimiento({ product, tipo, kind, cantidad, motivo, fecha }: LogInput) {
	if (!cantidad) return;
	try {
		await Movimiento.create({
			productId: product._id,
			tipo,
			codigo: product.codigo,
			detalle: product.detalle,
			marca: product.marca,
			kind,
			cantidad,
			stockResultante: product.cantidad,
			motivo,
			fecha: fecha ?? new Date()
		});
	} catch (error) {
		console.error('No se pudo registrar el movimiento:', error);
	}
}
