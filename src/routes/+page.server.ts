import type { Products } from '$lib/types/types';
import { emptyProductsMap, resolveTipo } from '$lib/logic/productTypes';
import {
	getProductsByType,
	updateProduct,
	increaseProductQuantity,
	decreaseProductQuantity,
	deleteProduct,
	SinStockError
} from '$lib/server/data';
import { logMovimiento } from '$lib/server/movimientos';
import { parseAmount, parseProductForm } from '$lib/server/forms';
import { modelBySlug } from '$lib/server/models';
import { connectToDB } from '$lib/server/db/db';
import { fail, type Actions } from '@sveltejs/kit';

const failWith = (status: number, message: string) =>
	fail(status, { actionResult: { success: false, message } });

const succeed = (message: string, producto: unknown) => ({
	actionResult: { success: true, message, producto: JSON.parse(JSON.stringify(producto)) }
});

export async function load() {
	// Solo se cargan radiadores al inicio; el resto se carga bajo demanda
	const allProducts = emptyProductsMap() as Products;
	allProducts['Radiadores'] = (await getProductsByType('radiador')) as Products['Radiadores'];
	return { allProducts };
}

/* FORM ACTIONS */
export const actions: Actions = {
	createProduct: async ({ request }) => {
		const data = await request.formData();

		const tipo = resolveTipo(data.get('tipo'));
		if (!tipo) return failWith(400, 'Tipo de producto no válido.');

		const parsed = parseProductForm(data, tipo);
		if (!parsed.ok) return failWith(400, parsed.message);

		try {
			await connectToDB();
			const newProduct = await modelBySlug[tipo].create({ ...parsed.fields, tipo });
			await logMovimiento({
				product: newProduct,
				tipo,
				kind: 'ajuste',
				cantidad: newProduct.cantidad,
				motivo: 'alta'
			});
			return succeed('Producto creado exitosamente.', newProduct);
		} catch (error) {
			console.error('Error al crear el producto:', error);
			return failWith(500, 'Error al guardar el producto.');
		}
	},

	editProduct: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const tipo = resolveTipo(data.get('tipo'));
		const originalTipo = resolveTipo(data.get('originalTipo'));

		if (!id) return failWith(400, 'ID requerido.');
		if (!tipo || !originalTipo) return failWith(400, 'Tipo de producto no válido.');

		const parsed = parseProductForm(data, tipo);
		if (!parsed.ok) return failWith(400, parsed.message);

		try {
			const result = await updateProduct({ id, originalTipo, tipo, fields: parsed.fields });
			return succeed('Producto actualizado exitosamente.', result);
		} catch (error) {
			console.error('Error al actualizar el producto:', error);
			return failWith(500, 'Error al actualizar el producto.');
		}
	},

	increaseProductQuantity: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const tipo = resolveTipo(data.get('tipo'));
		const amount = parseAmount(data.get('stock-in'));

		if (!id || !tipo) return failWith(400, 'ID y tipo son requeridos.');
		if (!amount) return failWith(400, 'La cantidad debe ser un entero mayor a 0.');

		try {
			const { producto } = await increaseProductQuantity(id, tipo, amount);
			return succeed(`Stock aumentado en ${amount} unidades.`, producto);
		} catch (error) {
			console.error('Error al aumentar stock:', error);
			return failWith(500, 'No se pudo aumentar la cantidad.');
		}
	},

	decreaseProductQuantity: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const tipo = resolveTipo(data.get('tipo'));
		const amount = parseAmount(data.get('stock-out'));

		if (!id || !tipo) return failWith(400, 'ID y tipo son requeridos.');
		if (!amount) return failWith(400, 'La cantidad debe ser un entero mayor a 0.');

		try {
			const { producto } = await decreaseProductQuantity(id, tipo, amount);
			const retirado = producto.ultimoEgreso.cantidad;
			const message =
				retirado < amount
					? `Solo había ${retirado} en stock: se retiraron ${retirado} unidades.`
					: `Stock reducido en ${retirado} unidades.`;
			return succeed(message, producto);
		} catch (error) {
			if (error instanceof SinStockError) return failWith(400, error.message);
			console.error('Error al reducir stock:', error);
			return failWith(500, 'No se pudo reducir la cantidad.');
		}
	},

	deleteProduct: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id')?.toString();
		const tipo = resolveTipo(data.get('tipo'));

		if (!id || !tipo) return failWith(400, 'ID y tipo son requeridos.');

		try {
			const { producto } = await deleteProduct(id, tipo);
			return succeed('Producto eliminado exitosamente.', producto);
		} catch (error) {
			console.error('Error al eliminar el producto:', error);
			return failWith(500, 'No se pudo eliminar el producto.');
		}
	}
};
