import { api } from './fetch';
import type { Categoria, Paginado } from '$types/index';

export const categoriasApi = {
	listar: (filtros: Record<string, string> = {}, token?: string): Promise<Paginado<Categoria>> => {
		const params = new URLSearchParams(filtros);
		return api.get<Paginado<Categoria>>(`/categorias?${params}`, { token });
	},
	arbol: (token?: string) => api.get<Categoria[]>('/categorias/arbol', { token }),
	obtener: (id: string, token?: string) => api.get<Categoria>(`/categorias/${id}`, { token }),
	crear: (data: Partial<Categoria>, token?: string) => api.post<Categoria>('/categorias', data, { token }),
	actualizar: (id: string, data: Partial<Categoria>, token?: string) => api.patch<Categoria>(`/categorias/${id}`, data, { token }),
	eliminar: (id: string, token?: string) => api.delete(`/categorias/${id}`, { token }),
};