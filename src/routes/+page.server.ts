import type { Products } from "$lib/types/types";
import { capitalize } from "$lib/logic/utils";
import { getAllProducts, updateProduct, increaseProductQuantity, decreaseProductQuantity } from "$lib/server/data";
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { connectToDB } from '$lib/server/db/db';
import { Panel } from '$lib/server/models/Panel';
import { Radiador } from '$lib/server/models/Radiador';
import { Electroventilador } from '$lib/server/models/Electroventilador';
import { selectedProduct } from "$lib/shared/products.svelte";


export async function load() {
	const allProducts: Products = await getAllProducts();

	return {
		allProducts
	}
};



/* FORM ACTIONS */
export const actions: Actions = {
	createProduct: async ({ request }) => {
		await connectToDB();
		const data = await request.formData();

		const tipo = data.get('tipo')?.toString().toLowerCase(); // Asegurar que coincida con el esquema
		if (!tipo) return fail(400, { error: 'Tipo de producto es requerido.' });

		const base = {
			codigo: data.get('codigo')?.toString().toUpperCase(),
			detalle: data.get('detalle')?.toString(),
			cantidad: parseInt(data.get('cantidad')?.toString() || '0'),
			notas: data.get('notas')?.toString(),
			dimensiones: {
				alto: parseFloat(data.get('alto')?.toString() || '0'),
				ancho: parseFloat(data.get('ancho')?.toString() || '0'),
				espesor: parseFloat(data.get('espesor')?.toString() || '0'),
			},
		};

		try {
			if (tipo === 'radiador') {
				const material = data.get('material')?.toString();
				if (!material) return fail(400, { error: 'Material requerido para Radiador.' });
				await Radiador.create({ ...base, tipo: 'radiador', material });
			} else if (tipo === 'panel') {
				const material = data.get('material')?.toString();
				const numero = parseInt(data.get('numero-filas')?.toString() || '0');
				const tipoFila = data.get('tipo-filas')?.toString();

				if (!material || !tipoFila)
					return fail(400, { error: 'Campos de filas y material requeridos para Panel.' });

				await Panel.create({
					...base,
					tipo: 'panel',
					material,
					filas: {
						numero,
						tipo: tipoFila as 'Supertubular' | 'Convencional',
					},
				});
			} else if (tipo === 'electroventilador') {
				const diametro = parseFloat(data.get('diametro')?.toString() || '0');
				const aspas = parseInt(data.get('aspas')?.toString() || '0');

				await Electroventilador.create({
					...base,
					tipo: 'electroventilador',
					diametro,
					aspas,
				});
			} else {
				return fail(400, { error: 'Tipo de producto no válido.' });
			}
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'Error guardando el producto.' });
		}
	},
	editProduct: async ({ request }) => {
		const formData = await request.formData();

		// Extraer los campos del formulario
		const id = formData.get('id');
		const codigo = formData.get('codigo');
		const tipo = formData.get('tipo');
		const detalle = formData.get('detalle');
		const cantidad = Number(formData.get('cantidad'));  // Convertir a número
		const notas = formData.get('notas');
		const material = formData.get('material');
		const alto = Number(formData.get('alto'));  // Convertir a número
		const ancho = Number(formData.get('ancho'));  // Convertir a número
		const espesor = Number(formData.get('espesor'));  // Convertir a número
		const numeroFilas = formData.get('numero-filas') ? Number(formData.get('numero-filas')) : undefined;  // Convertir a número
		const tipoFilas = formData.get('tipo-filas');
		const diametro = Number(formData.get('diametro'));  // Convertir a número
		const aspas = Number(formData.get('aspas'));

		// Llamar a la función que actualiza el producto
		try {
			await updateProduct({
				id,
				codigo,
				tipo,
				detalle,
				cantidad,
				notas,
				material,
				dimensiones: { alto, ancho, espesor },
				filas: { numero: numeroFilas, tipo: tipoFilas },
				electroventilador: { diametro, aspas }
			});
			selectedProduct.product = {
				id,
				codigo,
				tipo,
				detalle,
				cantidad,
				notas,
				material,
				dimensiones: { alto, ancho, espesor },
				filas: { numero: numeroFilas, tipo: tipoFilas },
				electroventilador: { diametro, aspas }
			};
		} catch (error) {
			console.error('Error al actualizar el producto:', error);
			return { status: 500, error: new Error('Error al actualizar el producto') };
		}
	},
	increaseProductQuantity: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const tipo = capitalize(formData.get('tipo')?.toString() || '');
		const amount = Number(formData.get('stock-in'));

		if (!id || !tipo || !amount)  return fail(400, { error: 'ID, tipo y cantidad son requeridos' });

		try {
			const result = await increaseProductQuantity(id, tipo, amount);
			return {
				success: true,
				message: result.message,
				producto: result.producto
			};
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'No se pudo aumentar la cantidad' });
		}
	},

	decreaseProductQuantity: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const tipo = capitalize(formData.get('tipo')?.toString() || '');
		const amount = Number(formData.get('stock-out'));

		if (!id || !tipo || !amount)  return fail(400, { error: 'ID, tipo y cantidad son requeridos' });

		try {
			const result = await decreaseProductQuantity(id, tipo, amount);
			return {
				success: true,
				message: result.message,
				producto: result.producto
			};
		} catch (error) {
			console.error(error);
			return fail(500, { error: 'No se pudo reducir la cantidad' });
		}
	}
};

