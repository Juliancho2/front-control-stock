import { api } from './fetch';
import type { TurnoCaja } from '$types/index';

export const cajaApi = {
	turnoActivo: (token?: string): Promise<TurnoCaja> =>
		api.get<TurnoCaja>('/caja/turnos/activo', { token }),

	abrir: (montoApertura: number, observaciones?: string, token?: string): Promise<TurnoCaja> =>
		api.post<TurnoCaja>('/caja/turnos/abrir', { montoApertura, observaciones }, { token }),

	cerrar: (id: string, montoCierre: number, observaciones?: string): Promise<TurnoCaja & { diferencia: number }> =>
		api.patch(`/caja/turnos/${id}/cerrar`, { montoCierre, observaciones }),

	cuadre: (id: string) =>
		api.get(`/caja/turnos/${id}/cuadre`),

	listar: (filtros: Record<string, string> = {}) => {
		const params = new URLSearchParams(filtros);
		return api.get(`/caja/turnos?${params}`);
	},
};