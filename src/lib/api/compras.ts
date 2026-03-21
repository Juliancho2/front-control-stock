import { api } from './fetch';
import type { OrdenCompra, Paginado, Proveedor } from '$types/index';

export const comprasApi = {
	ordenes: {
		listar: (filtros: Record<string, string> = {}): Promise<Paginado<OrdenCompra>> => {
			const params = new URLSearchParams(filtros);
			return api.get<Paginado<OrdenCompra>>(`/compras?${params}`);
		},
		obtener: (id: string) => api.get<OrdenCompra>(`/compras/${id}`),
		crear: (data: {
			proveedorId: string;
			items: { productoId: string; cantidad: number; precioUnitario: number }[];
			fechaEntrega?: string;
			bodegaId?: string;
			observaciones?: string;
		}) => api.post<OrdenCompra>('/compras', data),
		recibir: (id: string, data: {
			items: { ordenItemId: string; cantidadRecibida: number }[];
			observaciones?: string;
		}) => api.patch<OrdenCompra>(`/compras/${id}/recibir`, data),
		anular: (id: string, motivo: string) =>
			api.patch<OrdenCompra>(`/compras/${id}/anular`, { motivo }),
	},

	proveedores: {
		listar: (filtros: Record<string, string> = {}): Promise<Paginado<Proveedor>> => {
			const params = new URLSearchParams(filtros);
			return api.get<Paginado<Proveedor>>(`/proveedores?${params}`);
		},
		obtener: (id: string) => api.get<Proveedor>(`/proveedores/${id}`),
		crear: (data: Partial<Proveedor>) => api.post<Proveedor>('/proveedores', data),
		actualizar: (id: string, data: Partial<Proveedor>) => api.patch<Proveedor>(`/proveedores/${id}`, data),
		eliminar: (id: string) => api.delete(`/proveedores/${id}`),
	},
};