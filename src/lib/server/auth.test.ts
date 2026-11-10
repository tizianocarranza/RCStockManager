import { describe, expect, it } from 'vitest';
import { SESSION_MAX_AGE, checkPassword, createSession, verifySession } from './auth';

const KEY = 'test-secret-'.padEnd(40, 'x');
const NOW = 1_700_000_000_000;

describe('session tokens', () => {
	it('accepts a freshly created token', async () => {
		expect(await verifySession(await createSession(NOW, KEY), NOW, KEY)).toBe(true);
	});

	it('rejects the old forgeable cookie value and garbage', async () => {
		for (const t of ['true', '', undefined, 'a.b.c', '123.%%%']) {
			expect(await verifySession(t, NOW, KEY)).toBe(false);
		}
	});

	it('rejects a tampered expiry or signature', async () => {
		const [exp, sig] = (await createSession(NOW, KEY)).split('.');
		expect(await verifySession(`${Number(exp) + 1000}.${sig}`, NOW, KEY)).toBe(false);
		const flipped = sig.slice(0, 5) + (sig[5] === 'A' ? 'B' : 'A') + sig.slice(6);
		expect(await verifySession(`${exp}.${flipped}`, NOW, KEY)).toBe(false);
	});

	it('rejects a token signed with another secret', async () => {
		const other = 'other-secret-'.padEnd(40, 'y');
		expect(await verifySession(await createSession(NOW, other), NOW, KEY)).toBe(false);
	});

	it('rejects an expired token', async () => {
		const token = await createSession(NOW, KEY);
		expect(await verifySession(token, NOW + SESSION_MAX_AGE * 1000 + 1, KEY)).toBe(false);
	});
});

describe('checkPassword', () => {
	it('matches only the exact password', async () => {
		expect(await checkPassword('hunter2', 'hunter2')).toBe(true);
		expect(await checkPassword('hunter3', 'hunter2')).toBe(false);
		expect(await checkPassword('', 'hunter2')).toBe(false);
		expect(await checkPassword(null, 'hunter2')).toBe(false);
		expect(await checkPassword('x', '')).toBe(false);
	});
});
