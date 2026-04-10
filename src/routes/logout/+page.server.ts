import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';

export const actions: Actions = {
    default: async ({ cookies }) => {
        const sesionRaw = cookies.get('sesion');
        let accessToken: string | undefined;

        if (sesionRaw) {
            try {
                const sesion = JSON.parse(sesionRaw);
                accessToken = sesion.accessToken;
            } catch { /* ignore */ }
        }

        // Intentar invalidar token en el backend
        if (accessToken) {
            try {
                await fetch(`${API_URL}/api/v1/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
            } catch { /* ignore — we clear cookies regardless */ }
        }

        // Eliminar cookies
        cookies.delete('sesion', { path: '/' });
        cookies.delete('refreshToken', { path: '/' });

        throw redirect(303, '/login');
    },
};
