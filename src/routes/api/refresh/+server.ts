import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';

/**
 * POST /api/refresh
 * Lee el refreshToken desde la cookie httpOnly, llama al backend,
 * actualiza las cookies y devuelve el nuevo accessToken al cliente (in-memory).
 */
export const POST: RequestHandler = async ({ cookies }) => {
    const refreshToken = cookies.get('refreshToken');

    if (!refreshToken) {
        cookies.delete('sesion', { path: '/' });
        cookies.delete('refreshToken', { path: '/' });
        return json({ error: 'Sin refresh token' }, { status: 401 });
    }

    let respuesta: Response;
    try {
        respuesta = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
    } catch {
        return json({ error: 'No se pudo conectar con el servidor' }, { status: 503 });
    }

    if (!respuesta.ok) {
        cookies.delete('sesion', { path: '/' });
        cookies.delete('refreshToken', { path: '/' });
        return json({ error: 'Sesión expirada' }, { status: 401 });
    }

    const { data: sesion } = await respuesta.json();

    // Actualizar cookies httpOnly
    cookies.set('sesion', JSON.stringify({
        usuario: sesion.usuario,
        accessToken: sesion.accessToken,
        suscripcion: sesion.suscripcion ?? null,
        tenantNombre: sesion.tenantNombre,
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

    return json({ accessToken: sesion.accessToken });
};
