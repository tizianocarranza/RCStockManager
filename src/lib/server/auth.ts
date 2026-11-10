import { env } from '$env/dynamic/private';

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 días (segundos)

const enc = new TextEncoder();

const secret = () => {
	const s = env.SESSION_SECRET;
	if (!s || s.length < 32) {
		throw new Error('SESSION_SECRET no está definida o tiene menos de 32 caracteres.');
	}
	return s;
};

const hmacKey = (key: string) =>
	crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
		'verify'
	]);

const toB64Url = (buf: ArrayBuffer) =>
	btoa(String.fromCharCode(...new Uint8Array(buf)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');

const fromB64Url = (s: string): Uint8Array | null => {
	try {
		const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'));
		return Uint8Array.from(bin, (c) => c.charCodeAt(0));
	} catch {
		return null;
	}
};

/** Token `<expiraEnMs>.<hmac>` firmado con SESSION_SECRET. */
export async function createSession(now = Date.now(), key = secret()) {
	const expiresAt = String(now + SESSION_MAX_AGE * 1000);
	const sig = await crypto.subtle.sign('HMAC', await hmacKey(key), enc.encode(expiresAt));
	return `${expiresAt}.${toB64Url(sig)}`;
}

export async function verifySession(token: string | undefined, now = Date.now(), key?: string) {
	if (!token) return false;
	const [expiresAt, signature, ...rest] = token.split('.');
	if (!expiresAt || !signature || rest.length > 0) return false;
	const sig = fromB64Url(signature);
	if (!sig) return false;
	// subtle.verify compara en tiempo constante
	const valid = await crypto.subtle.verify(
		'HMAC',
		await hmacKey(key ?? secret()),
		sig,
		enc.encode(expiresAt)
	);
	const exp = Number(expiresAt);
	return valid && Number.isFinite(exp) && exp > now;
}

/** Comparación en tiempo constante contra ADMIN_PASSWORD. */
export async function checkPassword(password: unknown, expected = env.ADMIN_PASSWORD) {
	if (!expected || typeof password !== 'string') return false;
	// Firmar ambos lados iguala longitudes; luego comparar sin cortocircuito
	const key = await hmacKey('password-compare');
	const [a, b] = await Promise.all(
		[password, expected].map(async (s) => new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(s))))
	);
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}
