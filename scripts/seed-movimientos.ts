/**
 * Carga inicial del historial de movimientos a partir de ultimoIngreso /
 * ultimoEgreso de cada producto. Se ejecuta una sola vez:
 *
 *   node --env-file=.env scripts/seed-movimientos.ts
 *
 * Es idempotente: si ya existen movimientos con motivo "seed", no hace nada.
 * Requiere Node 23.6+ (ejecuta TypeScript directamente).
 */
import { MongoClient, type Document } from 'mongodb';
import { TIPO_SLUGS } from '../src/lib/logic/productTypes.ts';

const uri = process.env.MONGODB_URI;
if (!uri) {
	console.error('MONGODB_URI no está definida. Usá: node --env-file=.env scripts/seed-movimientos.ts');
	process.exit(1);
}

const client = new MongoClient(uri);

try {
	await client.connect();
	const db = client.db();
	const movimientos = db.collection('movimientos');

	if (await movimientos.findOne({ motivo: 'seed' })) {
		console.log('Ya existen movimientos "seed". No se insertó nada.');
		process.exit(0);
	}

	const tipos = new Set<string>(TIPO_SLUGS);
	const collections = (await db.listCollections({}, { nameOnly: true }).toArray())
		.map((c) => c.name)
		.filter((name) => name !== 'movimientos' && !name.startsWith('system.'));

	const docs: Document[] = [];
	for (const name of collections) {
		const products = db.collection(name).find({
			tipo: { $in: [...tipos] },
			$or: [{ 'ultimoIngreso.fecha': { $ne: null } }, { 'ultimoEgreso.fecha': { $ne: null } }]
		});
		for await (const p of products) {
			const base = {
				productId: p._id,
				tipo: p.tipo,
				codigo: p.codigo,
				detalle: p.detalle,
				marca: p.marca,
				motivo: 'seed'
			};
			for (const [field, kind] of [
				['ultimoIngreso', 'ingreso'],
				['ultimoEgreso', 'egreso']
			] as const) {
				const mov = p[field];
				if (mov?.fecha && mov.cantidad > 0) {
					docs.push({ ...base, kind, cantidad: mov.cantidad, fecha: new Date(mov.fecha) });
				}
			}
		}
	}

	if (docs.length === 0) {
		console.log('No hay movimientos previos para cargar.');
	} else {
		const { insertedCount } = await movimientos.insertMany(docs);
		console.log(`Insertados ${insertedCount} movimientos desde ${collections.length} colecciones.`);
	}
} finally {
	await client.close();
}
