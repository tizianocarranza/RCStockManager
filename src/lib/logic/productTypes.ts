/**
 * Registro único de tipos de producto.
 * Para agregar un tipo: sumar una entrada acá y crear su modelo en
 * `src/lib/server/models/` (registrándolo en `models/index.ts`).
 */
export const PRODUCT_TYPES = [
	{ slug: 'radiador', singular: 'Radiador', plural: 'Radiadores' },
	{ slug: 'panel', singular: 'Panel', plural: 'Paneles' },
	{ slug: 'electroventilador', singular: 'Electroventilador', plural: 'Electroventiladores' },
	{ slug: 'calefactor', singular: 'Calefactor', plural: 'Calefactores' },
	{ slug: 'evaporador', singular: 'Evaporador', plural: 'Evaporadores' },
	{ slug: 'condensador', singular: 'Condensador', plural: 'Condensadores' },
	{ slug: 'intercooler', singular: 'Intercooler', plural: 'Intercoolers' },
	{ slug: 'encauzador', singular: 'Encauzador', plural: 'Encauzadores' },
	{
		slug: 'tanque-combustible',
		singular: 'Tanque de combustible',
		plural: 'Tanques de combustible'
	},
	{ slug: 'kit-distribucion', singular: 'Kit de distribucion', plural: 'Kits de distribucion' },
	{ slug: 'bomba-agua', singular: 'Bomba de agua', plural: 'Bombas de agua' },
	{ slug: 'termostato', singular: 'Termostato', plural: 'Termostatos' },
	{ slug: 'compresor', singular: 'Compresor', plural: 'Compresores' },
	{ slug: 'vaso-recuperador', singular: 'Vaso recuperador', plural: 'Vasos recuperadores' },
	{
		slug: 'enfriador-aceite',
		singular: 'Enfriador de aceite',
		plural: 'Enfriadores de aceite'
	},
	{ slug: 'otro', singular: 'Otro', plural: 'Otros' }
] as const;

export type ProductTypeDef = (typeof PRODUCT_TYPES)[number];
export type Tipo = ProductTypeDef['slug'];
export type PluralLabel = ProductTypeDef['plural'];

export const TIPO_SLUGS = PRODUCT_TYPES.map((t) => t.slug) as Tipo[];
export const PLURAL_LABELS = PRODUCT_TYPES.map((t) => t.plural) as PluralLabel[];
export const SINGULAR_LABELS = PRODUCT_TYPES.map((t) => t.singular);

const normalize = (s: string) =>
	s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, '-');

// Índice: slug / singular / plural normalizados (y slug sin preposición "de") → slug
const lookup = new Map<string, Tipo>();
for (const t of PRODUCT_TYPES) {
	for (const key of [t.slug, t.singular, t.plural]) {
		const n = normalize(key);
		lookup.set(n, t.slug);
		lookup.set(n.replace(/-de-/g, '-'), t.slug);
	}
}

/** Convierte slug, etiqueta singular o plural (cualquier capitalización) al slug. */
export function resolveTipo(input: unknown): Tipo | null {
	if (typeof input !== 'string' || !input.trim()) return null;
	const n = normalize(input);
	return lookup.get(n) ?? lookup.get(n.replace(/-de-/g, '-')) ?? null;
}

const bySlug = new Map<Tipo, ProductTypeDef>(PRODUCT_TYPES.map((t) => [t.slug, t]));

export const pluralOf = (tipo: string): PluralLabel | undefined => {
	const slug = resolveTipo(tipo);
	return slug ? bySlug.get(slug)?.plural : undefined;
};

export const singularOf = (tipo: string): string | undefined => {
	const slug = resolveTipo(tipo);
	return slug ? bySlug.get(slug)?.singular : undefined;
};

/** Mapa vacío { "Radiadores": [], ... } para todos los tipos. */
export const emptyProductsMap = <T = unknown>() =>
	Object.fromEntries(PLURAL_LABELS.map((p) => [p, [] as T[]])) as Record<PluralLabel, T[]>;
