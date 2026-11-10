import { describe, expect, it } from 'vitest';
import {
	bucketFor,
	bucketKey,
	bucketKeys,
	bucketLabel,
	fillBuckets,
	parseRange
} from './statsRange';

// 2026-03-15 10:00 hora Argentina (13:00 UTC), domingo
const NOW = new Date('2026-03-15T13:00:00Z');

describe('parseRange', () => {
	it('7d starts at local midnight 6 days ago and groups by day', () => {
		const r = parseRange('7d', NOW);
		expect(r.from?.toISOString()).toBe('2026-03-09T03:00:00.000Z'); // 09/03 00:00 ART
		expect(r.bucket).toBe('day');
	});

	it('chooses bucket by length', () => {
		expect(parseRange('30d', NOW).bucket).toBe('day');
		expect(parseRange('90d', NOW).bucket).toBe('week');
		expect(parseRange('12m', NOW).bucket).toBe('month');
		expect(parseRange('all', NOW)).toMatchObject({ from: null, bucket: 'month' });
		expect([bucketFor(31), bucketFor(32), bucketFor(183), bucketFor(184)]).toEqual([
			'day',
			'week',
			'week',
			'month'
		]);
	});
});

describe('bucketKey', () => {
	it('uses Argentina time, not UTC', () => {
		// 01:30 UTC del 16/03 = 22:30 del 15/03 en Argentina
		expect(bucketKey(new Date('2026-03-16T01:30:00Z'), 'day')).toBe('2026-03-15');
		expect(bucketKey(new Date('2026-04-01T02:00:00Z'), 'month')).toBe('2026-03');
	});

	it('weeks start on Monday', () => {
		expect(bucketKey(NOW, 'week')).toBe('2026-03-09'); // domingo 15 → lunes 9
		expect(bucketKey(new Date('2026-03-16T13:00:00Z'), 'week')).toBe('2026-03-16');
	});
});

describe('bucketKeys / fillBuckets', () => {
	it('lists every day of a 7d range, including today', () => {
		const { from, to } = parseRange('7d', NOW);
		expect(bucketKeys(from!, to, 'day')).toEqual([
			'2026-03-09',
			'2026-03-10',
			'2026-03-11',
			'2026-03-12',
			'2026-03-13',
			'2026-03-14',
			'2026-03-15'
		]);
	});

	it('lists months across a year boundary', () => {
		const keys = bucketKeys(new Date('2025-11-20T12:00:00Z'), NOW, 'month');
		expect(keys).toEqual(['2025-11', '2025-12', '2026-01', '2026-02', '2026-03']);
	});

	it('fills missing periods with zeros and keeps existing ones', () => {
		const { from, to } = parseRange('7d', NOW);
		const filled = fillBuckets([{ key: '2026-03-12', ingreso: 4, egreso: 1 }], from!, to, 'day');
		expect(filled).toHaveLength(7);
		expect(filled[0]).toEqual({ key: '2026-03-09', ingreso: 0, egreso: 0 });
		expect(filled[3]).toEqual({ key: '2026-03-12', ingreso: 4, egreso: 1 });
	});
});

describe('bucketLabel', () => {
	it('formats per bucket', () => {
		expect(bucketLabel('2026-03-14', 'day')).toBe('14/03');
		expect(bucketLabel('2026-03-09', 'week')).toBe('sem 09/03');
		expect(bucketLabel('2026-03', 'month')).toBe('mar 2026');
	});
});
