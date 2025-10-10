import { json } from '@sveltejs/kit';
import { getProductsByType } from '$lib/server/data';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { type } = params;
		
		if (!type) {
			return json({ error: 'Tipo de producto requerido' }, { status: 400 });
		}

		const products = await getProductsByType(type);
		
		return json({
			success: true,
			products,
			type
		});
	} catch (error) {
		console.error('Error fetching products by type:', error);
		return json(
			{ 
				error: 'Error al cargar productos',
				message: error instanceof Error ? error.message : 'Error desconocido'
			}, 
			{ status: 500 }
		);
	}
};
