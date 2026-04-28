import { api } from './fetch';
import type { Suscripcion } from '$types/index';

export const suscripcionesApi = {
	miSuscripcion: (token?: string) =>
		api.get<Suscripcion | null>('/suscripciones/mi-suscripcion', { token }),

	listar: (token?: string) =>
		api.get<Suscripcion[]>('/suscripciones', { token }),

	porTenant: (tenantId: string, token?: string) =>
		api.get<Suscripcion[]>(`/suscripciones/tenant/${tenantId}`, { token }),

	activar: (id: string, meses = 1, token?: string) =>
		api.post<Suscripcion>(`/suscripciones/activar/${id}`, { meses }, { token }),

	suspender: (id: string, token?: string) =>
		api.post<Suscripcion>(`/suscripciones/suspender/${id}`, {}, { token }),

	cancelar: (id: string, token?: string) =>
		api.post<Suscripcion>(`/suscripciones/cancelar/${id}`, {}, { token }),

	cambiarPlan: (id: string, planId: string, token?: string) =>
		api.patch<Suscripcion>(`/suscripciones/${id}/plan`, { planId }, { token }),
};
