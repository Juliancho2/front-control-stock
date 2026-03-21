import { api } from './fetch';
import type { Paginado, Producto } from '$types/index';

export interface FiltroProductos {
	q?: string;
	categoriaId?: string;
	proveedorId?: string;
	activo?: boolean;
	stockBajo?: boolean;
	precioMin?: number;
	precioMax?: number;
	orden?: string;
	page?: number;
	limit?: number;
}

export const productosApi = {
	listar: (filtros: FiltroProductos = {}): Promise<Paginado<Producto>> => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v !== undefined && v !== '') params.append(k, String(v));
		});
		return api.get<Paginado<Producto>>(`/productos?${params}`);
	},

	buscarPorSku: (sku: string, token?: string): Promise<Producto> =>
		api.get<Producto>(`/productos/sku/${sku}`, { token }),

	obtener: (id: string, conStock = false): Promise<Producto> =>
		api.get<Producto>(`/productos/${id}?conStock=${conStock}`),

	stockBajo: (): Promise<Producto[]> =>
		api.get<Producto[]>('/productos/stock-bajo'),

	crear: (data: Partial<Producto>): Promise<Producto> =>
		api.post<Producto>('/productos', data),

	actualizar: (id: string, data: Partial<Producto>): Promise<Producto> =>
		api.patch<Producto>(`/productos/${id}`, data),

	eliminar: (id: string): Promise<void> =>
		api.delete(`/productos/${id}`),
};