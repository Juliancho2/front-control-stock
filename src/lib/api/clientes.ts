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
	listar: (filtros: FiltroClientes = {}, token?: string): Promise<Paginado<Cliente>> => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v !== undefined && v !== '') params.append(k, String(v));
		});
		return api.get<Paginado<Cliente>>(`/clientes?${params}`, { token });
	},

	obtener: (id: string, token?: string) => api.get<Cliente>(`/clientes/${id}`, { token }),
	buscarPorRuc: (ruc: string, token?: string) => api.get<Cliente>(`/clientes/ruc/${ruc}`, { token }),
	crear: (data: Partial<Cliente>, token?: string) => api.post<Cliente>('/clientes', data, { token }),
	actualizar: (id: string, data: Partial<Cliente>, token?: string) => api.patch<Cliente>(`/clientes/${id}`, data, { token }),
	eliminar: (id: string, token?: string) => api.delete(`/clientes/${id}`, { token }),

	ajustarCredito: (id: string, limiteCredito: number, motivo?: string, token?: string) =>
		api.patch<Cliente>(`/clientes/${id}/credito`, { limiteCredito, motivo }, { token }),

	abonarDeuda: (id: string, monto: number, referencia?: string, token?: string) =>
		api.post<Cliente>(`/clientes/${id}/abonos`, { monto, referencia }, { token }),

	historial: (id: string, filtros: Record<string, string> = {}, token?: string) => {
		const params = new URLSearchParams(filtros);
		return api.get(`/clientes/${id}/historial?${params}`, { token });
	},

	resumen: (id: string, token?: string) => api.get(`/clientes/${id}/resumen`, { token }),
};