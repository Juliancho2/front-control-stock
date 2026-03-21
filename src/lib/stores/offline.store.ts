import { writable, derived } from 'svelte/store';
import type { CreateVentaPayload } from '$api/ventas';

export interface VentaOffline {
	id: string;           // UUID local temporal
	payload: CreateVentaPayload;
	creadaEn: string;
	intentos: number;
	error?: string;
}

interface OfflineState {
	online: boolean;
	sincronizando: boolean;
	cola: VentaOffline[];
}

const { subscribe, set, update } = writable<OfflineState>({
	online: true,
	sincronizando: false,
	cola: [],
});

export const offlineStore = {
	subscribe,

	setOnline: (online: boolean) =>
		update(s => ({ ...s, online })),

	agregarVenta: (payload: CreateVentaPayload): string => {
		const id = crypto.randomUUID();
		update(s => ({
			...s,
			cola: [...s.cola, { id, payload, creadaEn: new Date().toISOString(), intentos: 0 }],
		}));
		return id;
	},

	marcarSincronizando: (valor: boolean) =>
		update(s => ({ ...s, sincronizando: valor })),

	removerVenta: (id: string) =>
		update(s => ({ ...s, cola: s.cola.filter(v => v.id !== id) })),

	marcarError: (id: string, error: string) =>
		update(s => ({
			...s,
			cola: s.cola.map(v =>
				v.id === id ? { ...v, error, intentos: v.intentos + 1 } : v
			),
		})),
};

export const estaOnline = derived({ subscribe }, $s => $s.online);
export const ventasPendientes = derived({ subscribe }, $s => $s.cola.length);
export const colaPendiente = derived({ subscribe }, $s => $s.cola);