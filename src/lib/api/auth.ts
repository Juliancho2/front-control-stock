import { api, limpiarTokens } from './fetch';
import type { SesionActiva, Usuario } from '$types/index';

export const authApi = {
	login: async (email: string, password: string): Promise<SesionActiva> => {
		return api.post<SesionActiva>('/auth/login', { email, password });
	},

	logout: async (): Promise<void> => {
		try { await api.post('/auth/logout', {}); } catch { /* ignorar */ }
		limpiarTokens();
	},

	perfil: (token?: string): Promise<Usuario> =>
		api.get<Usuario>('/auth/perfil', { token }),

	olvidePassword: (email: string): Promise<void> =>
		api.post<void>('/auth/forgot-password', { email }),

	resetPassword: (token: string, newPassword: string): Promise<void> =>
		api.post<void>('/auth/reset-password', { token, newPassword }),
};