import { api } from './fetch';
import type { Paginado, StockItem, MovimientoInventario, ResumenStock } from '$types/index';

export const inventarioApi = {
	stock: (filtros: Record<string, string> = {}): Promise<Paginado<StockItem>> => {
		const params = new URLSearchParams(filtros);
		return api.get<Paginado<StockItem>>(`/inventario/stock?${params}`);
	},

	resumen: () => api.get<ResumenStock>('/inventario/stock/resumen'),
	stockProducto: (productoId: string) => api.get(`/inventario/stock/producto/${productoId}`),

	movimientos: (filtros: Record<string, string> = {}): Promise<Paginado<MovimientoInventario>> => {
		const params = new URLSearchParams(filtros);
		return api.get<Paginado<MovimientoInventario>>(`/inventario/movimientos?${params}`);
	},

	ajustar: (data: { productoId: string; bodegaId: string; cantidadNueva: number; motivo: string }) =>
		api.post('/inventario/ajuste', data),

	trasladar: (data: { productoId: string; bodegaOrigenId: string; bodegaDestinoId: string; cantidad: number; motivo?: string }) =>
		api.post('/inventario/traslado', data),
};