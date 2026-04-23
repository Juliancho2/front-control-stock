import { api } from './fetch';
import type { Notificacion } from '$types/index';

export const notificacionesApi = {
	list: () => api.get<Notificacion[]>('/notificaciones'),
	
	marcarLeida: (id: string) => 
		api.patch<void>(`/notificaciones/${id}/leida`, {}),
	
	marcarTodasLeidas: () => 
		api.post<void>('/notificaciones/marcar-todas', {})
};
