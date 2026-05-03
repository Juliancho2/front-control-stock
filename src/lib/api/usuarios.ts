import { api } from './fetch';
import type { Paginado, Usuario } from '$types/index';

export const usuariosApi = {
    listar: (filtros: Record<string, string> = {}, token?: string): Promise<Paginado<Usuario>> => {
        const params = new URLSearchParams(filtros);
        return api.get<Paginado<Usuario>>(`/usuarios?${params}`, { token });
    },

    obtener: (id: string, token?: string) => api.get<Usuario>(`/usuarios/${id}`, { token }),

    crear: (data: { nombre: string; email: string; password: string; rol: string }, token?: string) =>
        api.post<Usuario>('/usuarios', data, { token }),

    actualizar: (id: string, data: Partial<Usuario>, token?: string) =>
        api.patch<Usuario>(`/usuarios/${id}`, data, { token }),

    cambiarRol: (id: string, rol: string, token?: string) =>
        api.patch<Usuario>(`/usuarios/${id}`, { rol }, { token }),

    toggleActivo: (id: string, activo: boolean, token?: string) =>
        activo 
            ? api.patch<Usuario>(`/usuarios/${id}/activar`, {}, { token })
            : api.patch<Usuario>(`/usuarios/${id}/desactivar`, {}, { token }),

    cambiarPasswordUsuario: (id: string, password: string, token?: string) =>
        api.patch<Usuario>(`/usuarios/${id}`, { password }, { token }),

    cambiarMiPassword: (passwordActual: string, passwordNuevo: string, token?: string) =>
        api.patch<void>('/usuarios/me/password', { passwordActual, passwordNuevo }, { token }),
};
