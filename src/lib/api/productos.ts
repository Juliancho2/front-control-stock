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
	conStock?: boolean;
}

export const productosApi = {
	listar: (filtros: FiltroProductos = {}, token?: string): Promise<Paginado<Producto>> => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v !== undefined && v !== '') params.append(k, String(v));
		});
		return api.get<Paginado<Producto>>(`/productos?${params}`, { token });
	},

	buscarPorSku: (sku: string, token?: string): Promise<Producto> =>
		api.get<Producto>(`/productos/sku/${sku}?conStock=true`, { token }),

	obtener: (id: string, conStock = false, token?: string): Promise<Producto> =>
		api.get<Producto>(`/productos/${id}?conStock=${conStock}`, { token }),

	stockBajo: (token?: string): Promise<Producto[]> =>
		api.get<Producto[]>('/productos/stock-bajo', { token }),

	crear: (data: Partial<Producto>, token?: string): Promise<Producto> =>
		api.post<Producto>('/productos', data, { token }),

	actualizar: (id: string, data: Partial<Producto>, token?: string): Promise<Producto> =>
		api.patch<Producto>(`/productos/${id}`, data, { token }),

	eliminar: (id: string, token?: string): Promise<void> =>
		api.delete(`/productos/${id}`, { token }),

	eliminarMultiple: (ids: string[], token?: string): Promise<void> =>
		api.delete('/productos', { token, body: { ids } }),

	importar: (
		productos: any[],
		token?: string
	): Promise<{
		total: number;
		exitosas: number;
		duplicados: number;
		errores: { fila: number; mensaje: string }[];
	}> => api.post('/productos/importar', { productos }, { token })
};