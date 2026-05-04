import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { INICIO_POR_ROL } from '../../lib/config/auth';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3000';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Si ya está autenticado, redirigir
	if (locals.usuario) {
		const redirectTo = url.searchParams.get('redirectTo');

		const destino =
			redirectTo && redirectTo.trim() !== ''
				? redirectTo
				: INICIO_POR_ROL[locals.usuario.rol];

		throw redirect(303, destino);
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const email = form.get('email')?.toString().trim() ?? '';
		const password = form.get('password')?.toString() ?? '';
		// Validación básica
		if (!email || !password) {
			return fail(400, { error: 'Email y contraseña son obligatorios', email });
		}

		// Llamar al backend
		let respuesta: Response;
		try {

			respuesta = await fetch(`${API_URL}/api/v1/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password }),
			});
		} catch {
			return fail(503, { error: 'No se pudo conectar con el servidor', email });
		}

		if (!respuesta.ok) {
			const json = await respuesta.json().catch(() => ({}));
			const mensaje = json?.data?.message ?? json?.message ?? 'Credenciales incorrectas';
			return fail(respuesta.status, {
				error: Array.isArray(mensaje) ? mensaje[0] : mensaje,
				email,
			});
		}

		const { data: sesion } = await respuesta.json();

		// Guardar sesión en cookie httpOnly (no accesible desde JS)
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
			maxAge: 60 * 60 * 24, // 24 horas
		});

		// También guardar refreshToken en cookie separada
		cookies.set('refreshToken', sesion.refreshToken, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30, // 30 días
		});

		const redirectTo = url.searchParams.get('redirectTo');

		const destino = redirectTo && redirectTo.trim() !== ''
			? redirectTo
			: INICIO_POR_ROL[sesion.usuario.rol];

		throw redirect(303, destino);
	},
};