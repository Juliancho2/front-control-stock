import { api } from './fetch';
import type { Suscripcion, PagoSuscripcion, Plan } from '$types/index';

export const suscripcionesApi = {
	miSuscripcion: (token?: string) =>
		api.get<Suscripcion | null>('/suscripciones/mi-suscripcion', { token }),

	listar: (token?: string) =>
		api.get<Suscripcion[]>('/suscripciones', { token }),

	porTenant: (tenantId: string, token?: string) =>
		api.get<Suscripcion[]>(`/suscripciones/tenant/${tenantId}`, { token }),

	activar: (id: string, meses = 1, token?: string) =>
		api.post<Suscripcion>(`/suscripciones/activar/${id}`, { meses }, { token }),

	renovarPorTenant: (tenantId: string, meses = 1, token?: string) =>
		api.post<Suscripcion>(`/suscripciones/renovar/tenant/${tenantId}`, { meses }, { token }),

	suspender: (id: string, token?: string) =>
		api.post<Suscripcion>(`/suscripciones/suspender/${id}`, {}, { token }),

	cancelar: (id: string, token?: string) =>
		api.post<Suscripcion>(`/suscripciones/cancelar/${id}`, {}, { token }),

	cambiarPlan: (id: string, planId: string, token?: string) =>
		api.patch<Suscripcion>(`/suscripciones/${id}/plan`, { planId }, { token }),
};

export const pagosSuscripcionApi = {
	crear: (dto: { planId: string; metodoPago: string; meses?: number }, token?: string) =>
		api.post<PagoSuscripcion>('/pagos-suscripcion', dto, { token }),

	misPagos: (token?: string) =>
		api.get<PagoSuscripcion[]>('/pagos-suscripcion/mis-pagos', { token }),

	porId: (id: string, token?: string) =>
		api.get<PagoSuscripcion>(`/pagos-suscripcion/${id}`, { token }),

	subirComprobante: (id: string, comprobanteUrl: string, token?: string) =>
		api.post<PagoSuscripcion>(`/pagos-suscripcion/${id}/comprobante`, { comprobanteUrl }, { token }),

	marcarPagado: (id: string, token?: string) =>
		api.post<PagoSuscripcion>(`/pagos-suscripcion/${id}/marcar-pagado`, {}, { token }),

	listarPendientes: (token?: string) =>
		api.get<PagoSuscripcion[]>('/pagos-suscripcion/admin/pendientes', { token }),

	aprobar: (id: string, token?: string) =>
		api.patch<PagoSuscripcion>(`/pagos-suscripcion/${id}/aprobar`, {}, { token }),

	rechazar: (id: string, observaciones: string, token?: string) =>
		api.patch<PagoSuscripcion>(`/pagos-suscripcion/${id}/rechazar`, { observaciones }, { token }),

	cancelar: (id: string, token?: string) =>
		api.delete<void>(`/pagos-suscripcion/${id}`, { token }),
};
