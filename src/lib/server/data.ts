import { connectToDB } from './db/db';
import { modelBySlug } from './models';
import { toSerializableArray, toSerializableObject } from '$lib/logic/serialization';
import { resolveTipo, type Tipo } from '$lib/logic/productTypes';
import { logMovimiento } from './movimientos';

/** Error de negocio: se intentó sacar stock de un producto con cantidad 0. */
export class SinStockError extends Error {
	constructor() {
		super('El producto no tiene stock.');
	}
}

const modelFor = (tipo: string) => {
	const slug = resolveTipo(tipo);
	if (!slug) throw new Error(`Tipo de producto no reconocido: ${tipo}`);
	return { slug, model: modelBySlug[slug] };
};

/** Productos de un tipo (acepta slug, singular o plural). */
export const getProductsByType = async (productType: string) => {
	await connectToDB();
	const { model } = modelFor(productType);
	const products = await model.find().lean();
	return toSerializableArray(products);
};

type UpdateInput = {
	id: string;
	originalTipo: Tipo;
	tipo: Tipo;
	fields: Record<string, unknown>;
};

/**
 * Actualiza un producto. Si cambia el tipo, mueve el documento a la colección
 * nueva conservando _id, marca e historial de movimientos.
 */
export const updateProduct = async ({ id, originalTipo, tipo, fields }: UpdateInput) => {
	await connectToDB();
	const oldModel = modelBySlug[originalTipo];

	if (originalTipo === tipo) {
		const before = await oldModel
			.findByIdAndUpdate(id, fields, { new: false, runValidators: true })
			.lean<Record<string, unknown>>();
		if (!before) throw new Error('Producto no encontrado');
		const updated = await oldModel.findById(id).lean<Record<string, unknown>>();
		if (!updated) throw new Error('Producto no encontrado');
		await logAjusteEdicion(before, updated, tipo);
		return toSerializableObject(updated);
	}

	const original = await oldModel.findById(id).lean<Record<string, unknown>>();
	if (!original) throw new Error('Producto no encontrado');

	const newModel = modelBySlug[tipo];
	const created = await newModel.create({
		_id: original._id,
		marca: original.marca,
		ultimoIngreso: original.ultimoIngreso ?? null,
		ultimoEgreso: original.ultimoEgreso ?? null,
		...fields,
		tipo
	});

	try {
		await oldModel.findByIdAndDelete(id);
	} catch (error) {
		// Revertir para no dejar el producto duplicado
		await newModel.findByIdAndDelete(created._id).catch(() => {});
		throw error;
	}

	const createdObj = created.toObject();
	await logAjusteEdicion(original, createdObj, tipo);
	return toSerializableObject(createdObj);
};

/** Si una edición cambió la cantidad, se registra como ajuste (no es venta ni compra). */
async function logAjusteEdicion(
	before: Record<string, unknown>,
	after: Record<string, unknown>,
	tipo: Tipo
) {
	const delta = Number(after.cantidad ?? 0) - Number(before.cantidad ?? 0);
	if (delta !== 0) {
		await logMovimiento({
			product: after as { _id: unknown },
			tipo,
			kind: 'ajuste',
			cantidad: delta,
			motivo: 'edicion'
		});
	}
}

const movimiento = (cantidad: number) => ({ fecha: new Date(), cantidad });

/** Suma stock de forma atómica y registra el último ingreso. */
export async function increaseProductQuantity(id: string, tipo: Tipo, amount: number) {
	await connectToDB();
	const updated = await modelBySlug[tipo]
		.findByIdAndUpdate(
			id,
			{ $inc: { cantidad: amount }, $set: { ultimoIngreso: movimiento(amount) } },
			{ new: true }
		)
		.lean<Record<string, unknown> & { _id: unknown }>();
	if (!updated) throw new Error('Producto no encontrado');
	await logMovimiento({ product: updated, tipo, kind: 'ingreso', cantidad: amount });
	return { producto: toSerializableObject(updated) };
}

/**
 * Resta stock de forma atómica sin bajar de 0. Registra como egreso la cantidad
 * realmente retirada: pedir 5 con 3 en stock registra 3.
 * Lanza SinStockError si el producto tiene 0 unidades.
 */
export async function decreaseProductQuantity(id: string, tipo: Tipo, amount: number) {
	await connectToDB();
	const model = modelBySlug[tipo];
	const updated = await model
		.findOneAndUpdate(
			{ _id: id, cantidad: { $gt: 0 } },
			[
				{
					// Dentro de un mismo $set las expresiones ven los valores previos
					$set: {
						cantidad: { $max: [0, { $subtract: ['$cantidad', amount] }] },
						ultimoEgreso: { fecha: new Date(), cantidad: { $min: ['$cantidad', amount] } }
					}
				}
			],
			{ new: true }
		)
		.lean<Record<string, unknown> & { _id: unknown; ultimoEgreso: { cantidad: number } }>();

	if (!updated) {
		if (await model.exists({ _id: id })) throw new SinStockError();
		throw new Error('Producto no encontrado');
	}

	await logMovimiento({
		product: updated,
		tipo,
		kind: 'egreso',
		cantidad: updated.ultimoEgreso.cantidad
	});
	return { producto: toSerializableObject<typeof updated>(updated) };
}

export const deleteProduct = async (id: string, tipo: Tipo) => {
	await connectToDB();
	const deleted = await modelBySlug[tipo].findByIdAndDelete(id).lean();
	if (!deleted) throw new Error('Producto no encontrado');
	return { producto: toSerializableObject(deleted) };
};
