import type { PipelineStage } from 'mongoose';
import { connectToDB } from './db/db';
import { modelBySlug } from './models';
import { Movimiento } from './models/Movimiento';
import { TIPO_SLUGS, pluralOf, type Tipo } from '$lib/logic/productTypes';
import {
	TIMEZONE,
	fillBuckets,
	parseRange,
	type Bucket,
	type RangeKey,
	type SeriePoint
} from '$lib/logic/statsRange';

const TOP_N = 10;
const LIST_N = 15;
const LOW_STOCK = 2; // mismo umbral que el indicador rojo de productCard

export type ProductRef = {
	_id: string;
	tipo: Tipo;
	codigo?: string;
	detalle?: string;
	marca?: string;
	cantidad?: number;
};
export type TopItem = ProductRef & { unidades: number; movimientos: number };

export type Stats = {
	range: { key: RangeKey; from: string | null; to: string; bucket: Bucket };
	totales: { ingreso: number; egreso: number; ajuste: number; movimientos: number };
	serie: SeriePoint[];
	masVendidos: TopItem[];
	masIngresados: TopItem[];
	porTipo: { tipo: Tipo; label: string; ingreso: number; egreso: number }[];
	stock: {
		productos: number;
		unidades: number;
		sinStock: number;
		stockBajo: ProductRef[];
		sinRotacion: { total: number; items: ProductRef[] };
	};
};

const FORMAT: Record<Bucket, string> = {
	hour: '%Y-%m-%dT%H',
	day: '%Y-%m-%d', week: '%Y-%m-%d', month: '%Y-%m' };

const topPipeline = (kind: 'ingreso' | 'egreso'): PipelineStage.FacetPipelineStage[] => [
	{ $match: { kind } },
	{ $sort: { fecha: 1 } },
	{
		$group: {
			_id: '$productId',
			unidades: { $sum: '$cantidad' },
			movimientos: { $sum: 1 },
			tipo: { $last: '$tipo' },
			codigo: { $last: '$codigo' },
			detalle: { $last: '$detalle' },
			marca: { $last: '$marca' }
		}
	},
	{ $sort: { unidades: -1, movimientos: -1 } },
	{ $limit: TOP_N }
];

const idToString = <T extends { _id: unknown }>(x: T) => ({ ...x, _id: String(x._id) });

export async function getStats(rangeKey: RangeKey, now = new Date()): Promise<Stats> {
	await connectToDB();
	const { key, from, to, bucket } = parseRange(rangeKey, now);

	const fechaMatch = from ? { fecha: { $gte: from, $lte: to } } : { fecha: { $lte: to } };

	const [facets] = await Movimiento.aggregate([
		{ $match: fechaMatch },
		{
			$facet: {
				totales: [{ $group: { _id: '$kind', unidades: { $sum: '$cantidad' }, n: { $sum: 1 } } }],
				serie: [
					{ $match: { kind: { $in: ['ingreso', 'egreso'] } } },
					{
						$group: {
							_id: {
								key: {
									$dateToString: {
										format: FORMAT[bucket],
										timezone: TIMEZONE,
										date: {
											$dateTrunc: {
												date: '$fecha',
												unit: bucket,
												timezone: TIMEZONE,
												startOfWeek: 'monday'
											}
										}
									}
								},
								kind: '$kind'
							},
							unidades: { $sum: '$cantidad' }
						}
					}
				],
				masVendidos: topPipeline('egreso'),
				masIngresados: topPipeline('ingreso'),
				porTipo: [
					{ $match: { kind: { $in: ['ingreso', 'egreso'] } } },
					{ $group: { _id: { tipo: '$tipo', kind: '$kind' }, unidades: { $sum: '$cantidad' } } }
				],
				primero: [{ $group: { _id: null, fecha: { $min: '$fecha' } } }]
			}
		}
	]);

	// Totales
	const totales = { ingreso: 0, egreso: 0, ajuste: 0, movimientos: 0 };
	for (const t of facets.totales as { _id: keyof typeof totales; unidades: number; n: number }[]) {
		totales[t._id] = t.unidades;
		totales.movimientos += t.n;
	}

	// Serie temporal con períodos vacíos completados
	const points = new Map<string, SeriePoint>();
	for (const s of facets.serie as {
		_id: { key: string; kind: 'ingreso' | 'egreso' };
		unidades: number;
	}[]) {
		const p = points.get(s._id.key) ?? { key: s._id.key, ingreso: 0, egreso: 0 };
		p[s._id.kind] = s.unidades;
		points.set(s._id.key, p);
	}
	const serieFrom = from ?? (facets.primero[0]?.fecha as Date | undefined);
	const serie = serieFrom
		? fillBuckets([...points.values()], serieFrom, to, bucket)
		: [...points.values()];

	// Por tipo (en el orden del registro)
	const porTipoMap = new Map<string, { ingreso: number; egreso: number }>();
	for (const p of facets.porTipo as {
		_id: { tipo: Tipo; kind: 'ingreso' | 'egreso' };
		unidades: number;
	}[]) {
		const v = porTipoMap.get(p._id.tipo) ?? { ingreso: 0, egreso: 0 };
		v[p._id.kind] = p.unidades;
		porTipoMap.set(p._id.tipo, v);
	}
	const porTipo = TIPO_SLUGS.filter((t) => porTipoMap.has(t)).map((tipo) => ({
		tipo,
		label: pluralOf(tipo) ?? tipo,
		...porTipoMap.get(tipo)!
	}));

	return {
		range: { key, from: from?.toISOString() ?? null, to: to.toISOString(), bucket },
		totales,
		serie,
		masVendidos: (facets.masVendidos as TopItem[]).map(idToString),
		masIngresados: (facets.masIngresados as TopItem[]).map(idToString),
		porTipo,
		stock: await getStockSnapshot(from)
	};
}

/** Estado actual del stock (no depende del rango, salvo "sin rotación"). */
async function getStockSnapshot(from: Date | null): Promise<Stats['stock']> {
	const projection = { tipo: 1, codigo: 1, detalle: 1, marca: 1, cantidad: 1 };
	// Sin rotación: tiene stock pero no tuvo egresos en el período (o nunca, si es "Todo")
	const sinRotacionFilter = {
		cantidad: { $gt: 0 },
		$or: [
			{ 'ultimoEgreso.fecha': { $exists: false } },
			{ 'ultimoEgreso.fecha': null },
			...(from ? [{ 'ultimoEgreso.fecha': { $lt: from } }] : [])
		]
	};

	const perType = await Promise.all(
		TIPO_SLUGS.map(async (tipo) => {
			const model = modelBySlug[tipo];
			const [agg, bajo, sinRot, sinRotCount] = await Promise.all([
				model.aggregate([
					{
						$group: {
							_id: null,
							productos: { $sum: 1 },
							unidades: { $sum: { $ifNull: ['$cantidad', 0] } },
							sinStock: { $sum: { $cond: [{ $lte: ['$cantidad', 0] }, 1, 0] } }
						}
					}
				]),
				model
					.find({ cantidad: { $lt: LOW_STOCK } }, projection)
					.sort({ cantidad: 1 })
					.limit(LIST_N)
					.lean(),
				model.find(sinRotacionFilter, projection).sort({ cantidad: -1 }).limit(LIST_N).lean(),
				model.countDocuments(sinRotacionFilter)
			]);
			return { agg: agg[0], bajo, sinRot, sinRotCount };
		})
	);

	const toRef = (p: Record<string, unknown>) => idToString(p as ProductRef & { _id: unknown });
	const stock = {
		productos: 0,
		unidades: 0,
		sinStock: 0,
		stockBajo: [] as ProductRef[],
		sinRotacion: { total: 0, items: [] as ProductRef[] }
	};
	for (const t of perType) {
		stock.productos += t.agg?.productos ?? 0;
		stock.unidades += t.agg?.unidades ?? 0;
		stock.sinStock += t.agg?.sinStock ?? 0;
		stock.stockBajo.push(...t.bajo.map(toRef));
		stock.sinRotacion.items.push(...t.sinRot.map(toRef));
		stock.sinRotacion.total += t.sinRotCount;
	}
	stock.stockBajo = stock.stockBajo
		.sort((a, b) => (a.cantidad ?? 0) - (b.cantidad ?? 0))
		.slice(0, LIST_N);
	stock.sinRotacion.items = stock.sinRotacion.items
		.sort((a, b) => (b.cantidad ?? 0) - (a.cantidad ?? 0))
		.slice(0, LIST_N);
	return stock;
}
