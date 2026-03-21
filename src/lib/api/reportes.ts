import { api } from './fetch';
import type { Dashboard } from '$types/index';

export const reportesApi = {
	dashboard: () => api.get<Dashboard>('/reportes/dashboard'),

	ventas: (filtros: {
		desde: string;
		hasta: string;
		agrupacion?: 'dia' | 'semana' | 'mes';
		usuarioId?: string;
	}) => {
		const params = new URLSearchParams(filtros as Record<string, string>);
		return api.get(`/reportes/ventas?${params}`);
	},

	topProductos: (filtros: {
		desde: string;
		hasta: string;
		top?: number;
		categoriaId?: string;
	}) => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v !== undefined) params.append(k, String(v));
		});
		return api.get(`/reportes/productos/top?${params}`);
	},

	rotacion: (filtros: { desde: string; hasta: string; categoriaId?: string; bodegaId?: string }) => {
		const params = new URLSearchParams();
		Object.entries(filtros).forEach(([k, v]) => {
			if (v) params.append(k, String(v));
		});
		return api.get(`/reportes/inventario/rotacion?${params}`);
	},

	cuentasPorCobrar: () => api.get('/reportes/credito'),

	compras: (filtros: { desde: string; hasta: string }) =>
		api.get(`/reportes/compras?desde=${filtros.desde}&hasta=${filtros.hasta}`),
};