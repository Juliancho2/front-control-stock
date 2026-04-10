import { api } from './fetch';
import type { Bodega, Paginado } from '$types/index';

export const bodegasApi = {
    listar: (filtros: Record<string, string> = {}, token?: string): Promise<Paginado<Bodega>> => {
        const params = new URLSearchParams(filtros);
        return api.get<Paginado<Bodega>>(`/bodegas?${params}`, { token });
    },

    obtener: (id: string, token?: string) => api.get<Bodega>(`/bodegas/${id}`, { token }),

    crear: (data: Partial<Bodega>, token?: string) => api.post<Bodega>('/bodegas', data, { token }),

    actualizar: (id: string, data: Partial<Bodega>, token?: string) =>
        api.patch<Bodega>(`/bodegas/${id}`, data, { token }),

    eliminar: (id: string, token?: string) => api.delete(`/bodegas/${id}`, { token }),
};
