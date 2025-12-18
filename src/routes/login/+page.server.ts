import { fail, redirect } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const password = data.get('password');

        if (password !== ADMIN_PASSWORD) {
            return fail(401, { 
                actionResult: {
                    success: false,
                    message: 'Contraseña incorrecta.'
			}});
        }

        // Seteamos una cookie para marcar al admin
        cookies.set('admin', 'true', {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
        });

        // Redirigimos al administrador a la ruta principal
        throw redirect(303, '/');
        
    },
};
