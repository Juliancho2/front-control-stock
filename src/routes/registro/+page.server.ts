import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.usuario) {
        throw redirect(303, '/');
    }
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const form = await request.formData();
        const nombreNegocio = form.get('nombreNegocio')?.toString().trim() ?? '';
        const slug = form.get('slug')?.toString().trim().toLowerCase() ?? '';
        const nombre = form.get('nombre')?.toString().trim() ?? '';
        const email = form.get('email')?.toString().trim() ?? '';
        const password = form.get('password')?.toString() ?? '';

        // Validación básica servidor
        if (!nombreNegocio || !slug || !nombre || !email || !password) {
            return fail(400, {
                error: 'Todos los campos son obligatorios',
                nombreNegocio, slug, nombre, email,
            });
        }

        if (password.length < 8) {
            return fail(400, {
                error: 'La contraseña debe tener al menos 8 caracteres',
                nombreNegocio, slug, nombre, email,
            });
        }

        let respuesta: Response;
        try {
            respuesta = await fetch(`${API_URL}/api/v1/auth/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreNegocio, slug, nombre, email, password }),
            });
        } catch {
            return fail(503, {
                error: 'No se pudo conectar con el servidor',
                nombreNegocio, slug, nombre, email,
            });
        }

        if (!respuesta.ok) {
            const json = await respuesta.json().catch(() => ({}));
            const mensaje = json?.data?.message ?? json?.message ?? 'Error al registrar';
            return fail(respuesta.status, {
                error: Array.isArray(mensaje) ? mensaje[0] : mensaje,
                nombreNegocio, slug, nombre, email,
            });
        }

        const { data: sesion } = await respuesta.json();

        cookies.set('sesion', JSON.stringify({
            usuario: sesion.usuario,
            accessToken: sesion.accessToken,
        }), {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24,
        });

        cookies.set('refreshToken', sesion.refreshToken, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30,
        });

        throw redirect(303, '/');
    },
};
