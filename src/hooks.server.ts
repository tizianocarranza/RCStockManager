import { Handle } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$env/static/private';

export const handle: Handle = async ({ event, resolve }) => {
    // Verificamos si la cookie 'admin' está seteada
    const isAdmin = event.cookies.get('admin') === 'true';

    // Si el usuario no es admin y no está logueado, lo redirigimos al login
    if (!isAdmin) {
        // Verificamos si está accediendo a la página de login
        if (event.url.pathname !== '/login') {
            return new Response(null, {
                status: 302,
                headers: { Location: '/login' },
            });
        }
    }

    // Resolvemos la petición normalmente si es admin
    return resolve(event);
};
