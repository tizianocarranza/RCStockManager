import { describe, expect, it } from 'vitest';
import { parseAmount, parseProductForm } from './forms';

const form = (entries: Record<string, string>) => {
	const fd = new FormData();
	for (const [k, v] of Object.entries(entries)) fd.set(k, v);
	return fd;
};

describe('parseProductForm', () => {
	it('parses a panel with material, dimensions and rows', () => {
		const r = parseProductForm(
			form({
				codigo: 'ab-12',
				detalle: 'Panel Gol',
				cantidad: '3',
				material: 'Cobre y bronce',
				alto: '40,5',
				'numero-filas': '2',
				'tipo-filas': 'Aletado'
			}),
			'panel'
		);
		expect(r).toEqual({
			ok: true,
			fields: {
				codigo: 'AB-12',
				detalle: 'Panel Gol',
				cantidad: 3,
				notas: '',
				material: 'Cobre y bronce',
				dimensiones: { alto: 40.5 },
				filas: { numero: 2, tipo: 'Aletado' }
			}
		});
	});

	it('requires material for radiador', () => {
		const r = parseProductForm(form({ codigo: 'X', detalle: 'Y', cantidad: '1' }), 'radiador');
		expect(r.ok).toBe(false);
	});

	it('ignores type-specific fields for other types', () => {
		const r = parseProductForm(
			form({ codigo: 'X', detalle: 'Y', cantidad: '0', material: 'Brazado', aspas: '5' }),
			'otro'
		);
		expect(r.ok && r.fields).toEqual({ codigo: 'X', detalle: 'Y', cantidad: 0, notas: '' });
	});

	it('rejects negative or non-numeric values', () => {
		expect(parseProductForm(form({ codigo: 'X', detalle: 'Y', cantidad: '-1' }), 'otro').ok).toBe(
			false
		);
		expect(
			parseProductForm(form({ codigo: 'X', detalle: 'Y', cantidad: '1', alto: 'abc' }), 'otro').ok
		).toBe(false);
	});
});

describe('parseAmount', () => {
	it('accepts only positive integers', () => {
		expect(parseAmount('5')).toBe(5);
		expect(parseAmount('0')).toBeNull();
		expect(parseAmount('-2')).toBeNull();
		expect(parseAmount('1.5')).toBeNull();
		expect(parseAmount('abc')).toBeNull();
		expect(parseAmount(null)).toBeNull();
	});
});
