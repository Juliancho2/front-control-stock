import { writable, derived, get } from 'svelte/store';
import { notificacionesApi } from '$lib/api/notificaciones';
import { estaAutenticado } from './auth.store';
import type { Notificacion } from '$types/index';

interface NotificacionesState {
	items: Notificacion[];
	cargando: boolean;
	error: string | null;
}

const inicial: NotificacionesState = {
	items: [],
	cargando: false,
	error: null,
};

function crearNotificacionesStore() {
	const { subscribe, set, update } = writable<NotificacionesState>(inicial);

	let intervalId: any;

	return {
		subscribe,

		cargar: async () => {
			if (!get(estaAutenticado)) return;

			update(s => ({ ...s, cargando: true }));
			try {
				const notificaciones = await notificacionesApi.list();
				update(s => ({ ...s, items: notificaciones, error: null }));
			} catch (e: any) {
				update(s => ({ ...s, error: e.message }));
			} finally {
				update(s => ({ ...s, cargando: false }));
			}
		},

		marcarLeida: async (id: string) => {
			try {
				await notificacionesApi.marcarLeida(id);
				update(s => ({
					...s,
					items: s.items.map(n => n.id === id ? { ...n, leida: true } : n)
				}));
			} catch (e) {
				console.error('Error al marcar notificación como leída', e);
			}
		},

		marcarTodasLeidas: async () => {
			try {
				await notificacionesApi.marcarTodasLeidas();
				update(s => ({
					...s,
					items: s.items.map(n => ({ ...n, leida: true }))
				}));
			} catch (e) {
				console.error('Error al marcar todas las notificaciones como leídas', e);
			}
		},

		eliminar: async (id: string) => {
			try {
				await notificacionesApi.eliminar(id);
				update(s => ({
					...s,
					items: s.items.filter(n => n.id !== id)
				}));
			} catch (e) {
				console.error('Error al eliminar notificación', e);
			}
		},

		eliminarTodas: async () => {
			try {
				await notificacionesApi.eliminarTodas();
				update(s => ({
					...s,
					items: []
				}));
			} catch (e) {
				console.error('Error al eliminar todas las notificaciones', e);
			}
		},

		iniciarPolling: () => {
			if (intervalId) return;
			// Cargar inmediatamente
			const store = crearNotificacionesStore();
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			notificacionesStore.cargar();
			// Cada 30 segundos
			intervalId = setInterval(() => {
				notificacionesStore.cargar();
			}, 30000);
		},

		detenerPolling: () => {
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}
		}
	};
}

export const notificacionesStore = crearNotificacionesStore();

export const misNotificaciones = derived(notificacionesStore, $s => $s.items);
export const cantidadNoLeidas = derived(notificacionesStore, $s => 
	$s.items.filter(n => !n.leida).length
);
