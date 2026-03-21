import { api, guardarTokens, limpiarTokens } from './fetch';
import type { SesionActiva, Usuario } from '$types/index';

export const authApi = {
	login: async (email: string, password: string): Promise<SesionActiva> => {
		const sesion = await api.post<SesionActiva>('/auth/login', { email, password });
		guardarTokens(sesion.accessToken, sesion.refreshToken);
		return sesion;
	},

	logout: async (): Promise<void> => {
		try { await api.post('/auth/logout', {}); } catch { /* ignorar */ }
		limpiarTokens();
	},

	perfil: (token?: string): Promise<Usuario> =>
		api.get<Usuario>('/auth/perfil', { token }),
};