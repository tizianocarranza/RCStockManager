import type { Products } from "$lib/types/types";
import { capitalize } from "$lib/logic/utils";
import { getAllProducts, updateProduct, increaseProductQuantity, decreaseProductQuantity, deleteProduct } from "$lib/server/data";
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { connectToDB } from '$lib/server/db/db';
import { Panel } from '$lib/server/models/Panel';
import { Radiador } from '$lib/server/models/Radiador';
import { Electroventilador } from '$lib/server/models/Electroventilador';
import { selectedProduct } from "$lib/shared/products.svelte";

type BaseProduct = {
	codigo?: string;
	detalle?: string;
	cantidad: number;
	notas?: string;
	dimensiones?: {
		alto?: number;
		ancho?: number;
		espesor?: number;
	};
};

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

		const tipo = data.get('tipo')?.toString().toLowerCase();
		if (!tipo) return fail(400, { 
			success: false,
			message: 'El tipo de producto es requerido.'
		});

		const base: BaseProduct = {
			codigo: data.get('codigo')?.toString().toUpperCase(),
			detalle: data.get('detalle')?.toString(),
			cantidad: parseInt(data.get('cantidad')?.toString() || '0'),
			notas: data.get('notas')?.toString(),
		};

		// Only add dimensions if at least one value is provided
		const alto = data.get('alto')?.toString();
		const ancho = data.get('ancho')?.toString();
		const espesor = data.get('espesor')?.toString();
		
		if (alto || ancho || espesor) {
			base.dimensiones = {
				...(alto && { alto: parseFloat(alto) }),
				...(ancho && { ancho: parseFloat(ancho) }),
				...(espesor && { espesor: parseFloat(espesor) })
			};
		}

		try {
			let newProduct;
			if (tipo === 'radiador') {
				const material = data.get('material')?.toString();
				if (!material) return fail(400, { 
					success: false,
					message: 'El material es requerido para Radiador.'
				});
				newProduct = await Radiador.create({ ...base, tipo: 'radiador', material });
			} else if (tipo === 'panel') {
				const material = data.get('material')?.toString();
				if (!material) return fail(400, { 
					success: false,
					message: 'El material es requerido para Panel.'
				});

				const numero = data.get('numero-filas')?.toString();
				const tipoFila = data.get('tipo-filas')?.toString();

				const filas: { numero?: number; tipo?: string } = {};
				if (numero) filas.numero = parseInt(numero);
				if (tipoFila) filas.tipo = tipoFila;

				newProduct = await Panel.create({
					...base,
					tipo: 'panel',
					material,
					...(Object.keys(filas).length > 0 && { filas })
				});
			} else if (tipo === 'electroventilador') {
				const diametro = data.get('diametro')?.toString();
				const aspas = data.get('aspas')?.toString();

				newProduct = await Electroventilador.create({
					...base,
					tipo: 'electroventilador',
					...(diametro && { diametro: parseFloat(diametro) }),
					...(aspas && { aspas: parseInt(aspas) })
				});
			} else {
				return fail(400, { 
					success: false,
					message: 'Tipo de producto no válido.'
				});
			}

			return {
				success: true,
				message: 'Producto creado exitosamente.',
				producto: JSON.parse(JSON.stringify(newProduct))
			};
		} catch (error) {
			console.error(error);
			return fail(500, { 
				success: false,
				message: 'Error al guardar el producto.'
			});
		}
	},
	editProduct: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');
		const tipo = formData.get('tipo');

		// Build dimensions object only if values are provided
		const alto = formData.get('alto')?.toString();
		const ancho = formData.get('ancho')?.toString();
		const espesor = formData.get('espesor')?.toString();
		
		const dimensiones: { alto?: number; ancho?: number; espesor?: number } = {};
		if (alto) dimensiones.alto = Number(alto);
		if (ancho) dimensiones.ancho = Number(ancho);
		if (espesor) dimensiones.espesor = Number(espesor);

		// Build electroventilador object only if values are provided
		const diametro = formData.get('diametro')?.toString();
		const aspas = formData.get('aspas')?.toString();
		const electroventilador: { diametro?: number; aspas?: number } = {};
		if (diametro) electroventilador.diametro = Number(diametro);
		if (aspas) electroventilador.aspas = Number(aspas);

		// Build filas object only if values are provided
		const numeroFilas = formData.get('numero-filas')?.toString();
		const tipoFilas = formData.get('tipo-filas')?.toString();
		const filas: { numero?: number; tipo?: string } = {};
		if (numeroFilas) filas.numero = Number(numeroFilas);
		if (tipoFilas) filas.tipo = tipoFilas;

		try {
			const result = await updateProduct({
				id: formData.get('id'),
				codigo: formData.get('codigo'),
				tipo: formData.get('tipo'),
				detalle: formData.get('detalle'),
				cantidad: Number(formData.get('cantidad')),
				notas: formData.get('notas'),
				material: formData.get('material'),
				dimensiones: Object.keys(dimensiones).length > 0 ? dimensiones : undefined,
				filas: Object.keys(filas).length > 0 ? filas : undefined,
				electroventilador: Object.keys(electroventilador).length > 0 ? electroventilador : undefined
			});

			return {
				success: true,
				message: 'Producto actualizado exitosamente.',
				producto: JSON.parse(JSON.stringify(result))
			};
		} catch (error) {
			console.error('Error al actualizar el producto:', error);
			return fail(500, { 
				success: false,
				message: 'Error al actualizar el producto.'
			});
		}
	},
	increaseProductQuantity: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const tipo = capitalize(formData.get('tipo')?.toString() || '');
		const amount = Number(formData.get('stock-in'));

		if (!id || !tipo || !amount) return fail(400, { 
			success: false,
			message: 'ID, tipo y cantidad son requeridos'
		});

		try {
			const result = await increaseProductQuantity(id, tipo, amount);
			
			// Get the updated product data
			let updatedProduct;
			if (tipo.toLowerCase() === 'radiador') {
				updatedProduct = await Radiador.findById(id);
			} else if (tipo.toLowerCase() === 'panel') {
				updatedProduct = await Panel.findById(id);
			} else if (tipo.toLowerCase() === 'electroventilador') {
				updatedProduct = await Electroventilador.findById(id);
			}

			return {
				success: true,
				message: `Stock aumentado en ${amount} unidades.`,
				producto: JSON.parse(JSON.stringify(updatedProduct))
			};
		} catch (error) {
			console.error(error);
			return fail(500, { 
				success: false,
				message: 'No se pudo aumentar la cantidad'
			});
		}
	},

	decreaseProductQuantity: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const tipo = capitalize(formData.get('tipo')?.toString() || '');
		const amount = Number(formData.get('stock-out'));

		if (!id || !tipo || !amount) return fail(400, { 
			success: false,
			message: 'ID, tipo y cantidad son requeridos'
		});

		try {
			const result = await decreaseProductQuantity(id, tipo, amount);
			
			// Get the updated product data
			let updatedProduct;
			if (tipo.toLowerCase() === 'radiador') {
				updatedProduct = await Radiador.findById(id);
			} else if (tipo.toLowerCase() === 'panel') {
				updatedProduct = await Panel.findById(id);
			} else if (tipo.toLowerCase() === 'electroventilador') {
				updatedProduct = await Electroventilador.findById(id);
			}

			return {
				success: true,
				message: `Stock reducido en ${amount} unidades.`,
				producto: JSON.parse(JSON.stringify(updatedProduct))
			};
		} catch (error) {
			console.error(error);
			return fail(500, { 
				success: false,
				message: 'No se pudo reducir la cantidad'
			});
		}
	},
	deleteProduct: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id')?.toString();
		const tipo = capitalize(formData.get('tipo')?.toString() || '');

		if (!id || !tipo) return fail(400, { 
			success: false,
			message: 'ID y tipo son requeridos'
		});

		try {
			const result = await deleteProduct(id, tipo);
			return {
				success: true,
				message: 'Producto eliminado exitosamente.',
				producto: JSON.parse(JSON.stringify(result.producto))
			};
		} catch (error) {
			console.error(error);
			return fail(500, { 
				success: false,
				message: 'No se pudo eliminar el producto.'
			});
		}
	}
};

