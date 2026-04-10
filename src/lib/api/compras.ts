import { api } from './fetch';
import type { OrdenCompra, Paginado, Proveedor } from '$types/index';

export const comprasApi = {
	ordenes: {
		listar: (filtros: Record<string, string> = {}, token?: string): Promise<Paginado<OrdenCompra>> => {
			const params = new URLSearchParams(filtros);
			return api.get<Paginado<OrdenCompra>>(`/compras?${params}`, { token });
		},
		obtener: (id: string, token?: string) => api.get<OrdenCompra>(`/compras/${id}`, { token }),
		crear: (data: {
			proveedorId: string;
			items: { productoId: string; cantidad: number; precioUnitario: number }[];
			fechaEntrega?: string;
			bodegaId?: string;
			observaciones?: string;
		}, token?: string) => api.post<OrdenCompra>('/compras', data, { token }),
		recibir: (id: string, data: {
			items: { ordenItemId: string; cantidadRecibida: number }[];
			observaciones?: string;
		}, token?: string) => api.patch<OrdenCompra>(`/compras/${id}/recibir`, data, { token }),
		anular: (id: string, motivo: string, token?: string) =>
			api.patch<OrdenCompra>(`/compras/${id}/anular`, { motivo }, { token }),
	},

	proveedores: {
		listar: (filtros: Record<string, string> = {}, token?: string): Promise<Paginado<Proveedor>> => {
			const params = new URLSearchParams(filtros);
			return api.get<Paginado<Proveedor>>(`/proveedores?${params}`, { token });
		},
		obtener: (id: string, token?: string) => api.get<Proveedor>(`/proveedores/${id}`, { token }),
		crear: (data: Partial<Proveedor>, token?: string) => api.post<Proveedor>('/proveedores', data, { token }),
		actualizar: (id: string, data: Partial<Proveedor>, token?: string) => api.patch<Proveedor>(`/proveedores/${id}`, data, { token }),
		eliminar: (id: string, token?: string) => api.delete(`/proveedores/${id}`, { token }),
	},
};