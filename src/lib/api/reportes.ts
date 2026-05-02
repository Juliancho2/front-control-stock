import { api } from './fetch';
import type { Dashboard } from '$types/index';

export const reportesApi = {
	dashboard: (token?: string) => api.get<Dashboard>('/reportes/dashboard', { token }),

	ventas: (filtros: {
		desde: string;
		hasta: string;
		agrupacion?: 'dia' | 'semana' | 'mes';
		usuarioId?: string;
	}, token?: string) => {
		const params = new URLSearchParams(filtros as Record<string, string>);
		return api.get(`/reportes/ventas?${params}`, { token });
	},

	topProductos: (filtros: {
		desde: string;
		hasta: string;
		top?: number;
		categoriaId?: string;
	}, token?: string) => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v !== undefined) params.append(k, String(v));
		});
		return api.get(`/reportes/productos/top?${params}`, { token });
	},

	rotacion: (filtros: { desde: string; hasta: string; categoriaId?: string; bodegaId?: string }, token?: string) => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v) params.append(k, String(v));
		});
		return api.get(`/reportes/inventario/rotacion?${params}`, { token });
	},

	cuentasPorCobrar: (token?: string) => api.get('/reportes/credito', { token }),

	compras: (filtros: { desde: string; hasta: string }, token?: string) =>
		api.get(`/reportes/compras?desde=${filtros.desde}&hasta=${filtros.hasta}`, { token }),

	exportarVentas: (filtros: { desde: string; hasta: string }, token?: string) =>
		api.download(`/reportes/exportar/ventas?desde=${filtros.desde}&hasta=${filtros.hasta}`, `ventas_${filtros.desde}_${filtros.hasta}.xlsx`, { token }),
};