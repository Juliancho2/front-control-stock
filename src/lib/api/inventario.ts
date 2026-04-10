import { api } from './fetch';
import type { Paginado, StockItem, MovimientoInventario, ResumenStock } from '$types/index';

export const inventarioApi = {
	stock: (filtros: Record<string, string> = {}, token?: string): Promise<Paginado<StockItem>> => {
		const params = new URLSearchParams(filtros);
		return api.get<Paginado<StockItem>>(`/inventario/stock?${params}`, { token });
	},

	resumen: (token?: string) => api.get<ResumenStock>('/inventario/stock/resumen', { token }),
	stockProducto: (productoId: string, token?: string) => api.get(`/inventario/stock/producto/${productoId}`, { token }),

	movimientos: (filtros: Record<string, string> = {}, token?: string): Promise<Paginado<MovimientoInventario>> => {
		const params = new URLSearchParams(filtros);
		return api.get<Paginado<MovimientoInventario>>(`/inventario/movimientos?${params}`, { token });
	},

	ajustar: (data: { productoId: string; bodegaId: string; cantidadNueva: number; motivo: string }, token?: string) =>
		api.post('/inventario/ajuste', data, { token }),

	trasladar: (data: { productoId: string; bodegaOrigenId: string; bodegaDestinoId: string; cantidad: number; motivo?: string }, token?: string) =>
		api.post('/inventario/traslado', data, { token }),
};