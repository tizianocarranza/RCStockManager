import { fail, redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { SESSION_COOKIE, SESSION_MAX_AGE, checkPassword, createSession } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();

		if (!(await checkPassword(data.get('password')))) {
			return fail(401, {
				actionResult: {
					success: false,
					message: 'Contraseña incorrecta.'
				}
			});
		}

		cookies.set(SESSION_COOKIE, await createSession(), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: !dev,
			maxAge: SESSION_MAX_AGE
		});
		// Limpiar la cookie insegura anterior si existiera
		cookies.delete('admin', { path: '/' });

		redirect(303, '/');
	},

	logout: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		redirect(303, '/login');
	}
};
