import { json, redirect, type Handle } from '@sveltejs/kit';
import { SESSION_COOKIE, verifySession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const isAdmin = await verifySession(event.cookies.get(SESSION_COOKIE));
	const { pathname } = event.url;

	if (pathname === '/login') {
		// Ya logueado: no mostrar el login (salvo para cerrar sesión)
		if (isAdmin && event.request.method === 'GET') redirect(303, '/');
		return resolve(event);
	}

	if (!isAdmin) {
		if (pathname.startsWith('/api/')) {
			return json({ error: 'No autorizado' }, { status: 401 });
		}
		redirect(303, '/login');
	}

	return resolve(event);
};
