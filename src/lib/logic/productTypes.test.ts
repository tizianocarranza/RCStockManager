import { describe, expect, it } from 'vitest';
import { PRODUCT_TYPES, emptyProductsMap, pluralOf, resolveTipo, singularOf } from './productTypes';

describe('resolveTipo', () => {
	it('resolves every slug, singular and plural label of every type', () => {
		for (const t of PRODUCT_TYPES) {
			expect(resolveTipo(t.slug)).toBe(t.slug);
			expect(resolveTipo(t.singular)).toBe(t.slug);
			expect(resolveTipo(t.plural)).toBe(t.slug);
		}
	});

	it('is case/spacing/accent insensitive for multi-word types', () => {
		expect(resolveTipo('tanque de combustible')).toBe('tanque-combustible');
		expect(resolveTipo('  TANQUES DE COMBUSTIBLE ')).toBe('tanque-combustible');
		expect(resolveTipo('Kit de distribución')).toBe('kit-distribucion');
		expect(resolveTipo('enfriador de aceite')).toBe('enfriador-aceite');
		expect(resolveTipo('tanque combustible')).toBe('tanque-combustible');
	});

	it('returns null for unknown or invalid input', () => {
		expect(resolveTipo('motor')).toBeNull();
		expect(resolveTipo('')).toBeNull();
		expect(resolveTipo(null)).toBeNull();
		expect(resolveTipo(42)).toBeNull();
	});
});

describe('label helpers', () => {
	it('maps between forms', () => {
		expect(pluralOf('tanque-combustible')).toBe('Tanques de combustible');
		expect(singularOf('bomba-agua')).toBe('Bomba de agua');
		expect(pluralOf('otro')).toBe('Otros');
	});

	it('emptyProductsMap has one empty list per type, including Otros', () => {
		const map = emptyProductsMap();
		expect(Object.keys(map)).toHaveLength(PRODUCT_TYPES.length);
		expect(map['Otros']).toEqual([]);
	});
});
