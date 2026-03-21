import { api } from './fetch';
import type { Categoria, Paginado } from '$types/index';

export const categoriasApi = {
	listar: (filtros: Record<string, string> = {}): Promise<Paginado<Categoria>> => {
		const params = new URLSearchParams(filtros);
		return api.get<Paginado<Categoria>>(`/categorias?${params}`);
	},
	arbol: () => api.get<Categoria[]>('/categorias/arbol'),
	obtener: (id: string) => api.get<Categoria>(`/categorias/${id}`),
	crear: (data: Partial<Categoria>) => api.post<Categoria>('/categorias', data),
	actualizar: (id: string, data: Partial<Categoria>) => api.patch<Categoria>(`/categorias/${id}`, data),
	eliminar: (id: string) => api.delete(`/categorias/${id}`),
};