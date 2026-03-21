import { api } from './fetch';
import type { Cliente, Paginado } from '$types/index';

export interface FiltroClientes {
	q?: string;
	tipo?: string;
	activo?: boolean;
	conDeuda?: boolean;
	creditoVencido?: boolean;
	page?: number;
	limit?: number;
}

export const clientesApi = {
	listar: (filtros: FiltroClientes = {}): Promise<Paginado<Cliente>> => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v !== undefined && v !== '') params.append(k, String(v));
		});
		return api.get<Paginado<Cliente>>(`/clientes?${params}`);
	},

	obtener: (id: string) => api.get<Cliente>(`/clientes/${id}`),
	buscarPorRuc: (ruc: string) => api.get<Cliente>(`/clientes/ruc/${ruc}`),
	crear: (data: Partial<Cliente>) => api.post<Cliente>('/clientes', data),
	actualizar: (id: string, data: Partial<Cliente>) => api.patch<Cliente>(`/clientes/${id}`, data),
	eliminar: (id: string) => api.delete(`/clientes/${id}`),

	ajustarCredito: (id: string, limiteCredito: number, motivo?: string) =>
		api.patch<Cliente>(`/clientes/${id}/credito`, { limiteCredito, motivo }),

	abonarDeuda: (id: string, monto: number, referencia?: string) =>
		api.post<Cliente>(`/clientes/${id}/abonos`, { monto, referencia }),

	historial: (id: string, filtros: Record<string, string> = {}) => {
		const params = new URLSearchParams(filtros);
		return api.get(`/clientes/${id}/historial?${params}`);
	},

	resumen: (id: string) => api.get(`/clientes/${id}/resumen`),
};