import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.usuario) throw redirect(303, '/login');
    if (locals.usuario.rol !== 'admin' && locals.usuario.rol !== 'superadmin') throw redirect(303, '/');
    return { usuario: locals.usuario };
};
