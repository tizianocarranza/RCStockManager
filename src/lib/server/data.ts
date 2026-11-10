import { connectToDB } from './db/db';
import { modelBySlug } from './models';
import { toSerializableArray, toSerializableObject } from '$lib/logic/serialization';
import { resolveTipo, type Tipo } from '$lib/logic/productTypes';

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
		const updated = await oldModel
			.findByIdAndUpdate(id, fields, { new: true, runValidators: true })
			.lean();
		if (!updated) throw new Error('Producto no encontrado');
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

	return toSerializableObject(created.toObject());
};

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
		.lean();
	if (!updated) throw new Error('Producto no encontrado');
	return { producto: toSerializableObject(updated) };
}

/** Resta stock de forma atómica (sin bajar de 0) y registra el último egreso. */
export async function decreaseProductQuantity(id: string, tipo: Tipo, amount: number) {
	await connectToDB();
	const updated = await modelBySlug[tipo]
		.findByIdAndUpdate(
			id,
			[
				{
					$set: {
						cantidad: { $max: [0, { $subtract: ['$cantidad', amount] }] },
						ultimoEgreso: movimiento(amount)
					}
				}
			],
			{ new: true }
		)
		.lean();
	if (!updated) throw new Error('Producto no encontrado');
	return { producto: toSerializableObject(updated) };
}

export const deleteProduct = async (id: string, tipo: Tipo) => {
	await connectToDB();
	const deleted = await modelBySlug[tipo].findByIdAndDelete(id).lean();
	if (!deleted) throw new Error('Producto no encontrado');
	return { producto: toSerializableObject(deleted) };
};
