import { api } from './fetch';
import type { Paginado, Venta } from '$types/index';
import type { FormaPago, TipoComprobante, MetodoPago } from '$types/index';

export interface CreateVentaPayload {
	clienteId?: string;
	turnoId: string;
	tipoComprobante: TipoComprobante;
	formaPago: FormaPago;
	items: {
		productoId: string;
		cantidad: number;
		precioUnitario: number;
		descuento?: number;
		iva?: number;
	}[];
	pagos: {
		metodo: MetodoPago;
		monto: number;
		referencia?: string;
	}[];
	descuentoGlobal?: number;
	observaciones?: string;
	bodegaId?: string;
}

export interface FiltroVentas {
	q?: string;
	clienteId?: string;
	usuarioId?: string;
	turnoId?: string;
	estado?: string;
	formaPago?: string;
	desde?: string;
	hasta?: string;
	page?: number;
	limit?: number;
}

export const ventasApi = {
	listar: (filtros: FiltroVentas = {}, token?: string): Promise<Paginado<Venta>> => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v !== undefined && v !== '') params.append(k, String(v));
		});
		return api.get<Paginado<Venta>>(`/ventas?${params}`, { token });
	},

	obtener: (id: string, token?: string): Promise<Venta> =>
		api.get<Venta>(`/ventas/${id}`, { token }),

	crear: (data: CreateVentaPayload, token?: string): Promise<Venta> =>
		api.post<Venta>('/ventas', data, { token }),

	anular: (id: string, motivo: string, devolverStock = true, token?: string): Promise<Venta> =>
		api.patch<Venta>(`/ventas/${id}/anular`, { motivo, devolverStock }, { token }),
};