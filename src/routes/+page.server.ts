import type { Products } from "$lib/types/types";
import { capitalize } from "$lib/logic/utils";
import { getProductsByType, updateProduct, increaseProductQuantity, decreaseProductQuantity, deleteProduct, typeMap } from "$lib/server/data";
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { connectToDB } from '$lib/server/db/db';
import { selectedProduct } from "$lib/shared/products.svelte";
import { Radiador as RadiadorModel } from "$lib/server/models/Radiador";
import { Panel as PanelModel } from "$lib/server/models/Panel";
import { Electroventilador as ElectroventiladorModel } from "$lib/server/models/Electroventilador";
import { Calefactor as CalefactorModel } from "$lib/server/models/Calefactor";
import { Evaporador as EvaporadorModel } from "$lib/server/models/Evaporador";
import { Condensador as CondensadorModel } from "$lib/server/models/Condensador";
import { Intercooler as IntercoolerModel } from "$lib/server/models/Intercooler";
import { Encauzador as EncauzadorModel } from "$lib/server/models/Encauzador";
import { TanqueCombustible as TanqueCombustibleModel } from "$lib/server/models/TanqueCombustible";
import { Compresor as CompresorModel } from "$lib/server/models/Compresor";
import { VasoRecuperador as VasoRecuperadorModel } from "$lib/server/models/VasoRecuperador";
import { EnfriadorAceite as EnfriadorAceiteModel } from "$lib/server/models/EnfriadorAceite";
import { Otro as OtroModel } from "$lib/server/models/Otro";
import { app } from "$lib/shared/app.svelte";

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
	// Only load radiadores initially for better performance
	app.loading = true;
	const radiadores = await getProductsByType('Radiadores');

	const allProducts: Products = {
		"Radiadores": radiadores,
		"Paneles": [],
		"Electroventiladores": [],
		"Calefactores": [],
		"Evaporadores": [],
		"Condensadores": [],
		"Intercoolers": [],
		"Encauzadores": [],
		"Tanques de combustible": [],
		"Compresores": [],
		"Vasos recuperadores": [],
		"Enfriadores de aceite": [],
		"Otros": []
	};

	app.loading = false;
	return {
		allProducts
	}
};



/* FORM ACTIONS */
export const actions: Actions = {
	createProduct: async ({ request }) => {
		await connectToDB();
		const data = await request.formData();

		// Convertir a minúsculas para asegurar coincidencia
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

		// Campos opcionales para tipos especiales
		const material = data.get('material')?.toString();
		const numero = data.get('numero-filas')?.toString();
		const tipoFila = data.get('tipo-filas')?.toString();
		const filas: { numero?: number; tipo?: string } = {};
		if (numero) filas.numero = parseInt(numero);
		if (tipoFila) filas.tipo = tipoFila;
		const diametro = data.get('diametro')?.toString();
		const aspas = data.get('aspas')?.toString();
		const electroventilador: { diametro?: number; aspas?: number } = {};
		if (diametro) electroventilador.diametro = parseFloat(diametro);
		if (aspas) electroventilador.aspas = parseInt(aspas);

		try {
			let newProduct;
			switch (tipo) {
				case 'radiador':
					const materialRadiador = data.get('material')?.toString();
					if (!materialRadiador) return fail(400, {
						success: false,
						message: 'El material es requerido para Radiador.'
					});
					newProduct = await RadiadorModel.create({ ...base, tipo: 'radiador', material: materialRadiador });
					break;
				case 'panel':
					const materialPanel = data.get('material')?.toString();
					if (!materialPanel) return fail(400, {
						success: false,
						message: 'El material es requerido para Panel.'
					});
					const numero = data.get('numero-filas')?.toString();
					const tipoFila = data.get('tipo-filas')?.toString();
					const filas: { numero?: number; tipo?: string } = {};
					if (numero) filas.numero = parseInt(numero);
					if (tipoFila) filas.tipo = tipoFila;
					newProduct = await PanelModel.create({
						...base,
						tipo: 'panel',
						material: materialPanel,
						...(Object.keys(filas).length > 0 && { filas })
					});
					break;
				case 'electroventilador':
					const diametro = data.get('diametro')?.toString();
					const aspas = data.get('aspas')?.toString();
					newProduct = await ElectroventiladorModel.create({
						...base,
						tipo: 'electroventilador',
						...(diametro && { diametro: parseFloat(diametro) }),
						...(aspas && { aspas: parseInt(aspas) })
					});
					break;
				case 'calefactor':
					newProduct = await CalefactorModel.create({ ...base, tipo: 'calefactor' });
					break;
				case 'evaporador':
					newProduct = await EvaporadorModel.create({ ...base, tipo: 'evaporador' });
					break;
				case 'condensador':
					newProduct = await CondensadorModel.create({ ...base, tipo: 'condensador' });
					break;
				case 'intercooler':
					newProduct = await IntercoolerModel.create({ ...base, tipo: 'intercooler' });
					break;
				case 'encauzador':
					newProduct = await EncauzadorModel.create({ ...base, tipo: 'encauzador' });
					break;
				case 'tanque de combustible':
					newProduct = await TanqueCombustibleModel.create({ ...base, tipo: 'tanque-combustible' });
					break;
				case 'compresor':
					newProduct = await CompresorModel.create({ ...base, tipo: 'compresor' });
					break;
				case 'vaso recuperador':
					newProduct = await VasoRecuperadorModel.create({ ...base, tipo: 'vaso-recuperador' });
					break;
				case 'enfriador de aceite':
					newProduct = await EnfriadorAceiteModel.create({ ...base, tipo: 'enfriador-aceite' });
					break;
				case 'otro':
					newProduct = await OtroModel.create({ ...base, tipo: 'otro' });
					break;
				default:
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
		// Normalizar y mapear el tipo
		const rawTipo = formData.get('tipo')?.toString() || '';
		const tipo = typeMap[rawTipo] ?? rawTipo.trim().toLowerCase().replace(/\s+/g, '-');

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
				tipo,
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
		const tipo = formData.get('tipo')?.toString().toLowerCase();
		const amount = Number(formData.get('stock-in'));

		if (!id || !tipo || !amount) return fail(400, {
			success: false,
			message: 'ID, tipo y cantidad son requeridos'
		});

		try {
			const result = await increaseProductQuantity(id, tipo, amount);
			return {
				success: true,
				message: `Stock aumentado en ${amount} unidades.`,
				producto: JSON.parse(JSON.stringify(result.producto))
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
			return {
				success: true,
				message: `Stock reducido en ${amount} unidades.`,
				producto: JSON.parse(JSON.stringify(result.producto))
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
		// Normalizar y mapear el tipo
		let tipo = formData.get('tipo')?.toString().toLowerCase();
		switch (tipo) {
			case 'tanque de combustible':
				tipo = 'tanque-combustible';
				break;
			case 'enfriador de aceite':
				tipo = 'enfriador-aceite';
				break;
			case 'vaso recuperador':
				tipo = 'vaso-recuperador';
				break;
			// Puedes agregar más mapeos si es necesario
		}

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

