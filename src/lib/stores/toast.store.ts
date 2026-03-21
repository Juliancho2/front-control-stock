import { writable } from 'svelte/store';

export type ToastTipo = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	tipo: ToastTipo;
	mensaje: string;
	duracion: number;
}

const { subscribe, update } = writable<Toast[]>([]);

function agregar(tipo: ToastTipo, mensaje: string, duracion = 4000): string {
	const id = crypto.randomUUID();
	update(ts => [...ts, { id, tipo, mensaje, duracion }]);

	if (duracion > 0) {
		setTimeout(() => quitar(id), duracion);
	}

	return id;
}

function quitar(id: string): void {
	update(ts => ts.filter(t => t.id !== id));
}

export const toastStore = {
	subscribe,
	quitar,
	exito: (msg: string, dur?: number) => agregar('success', msg, dur),
	error: (msg: string, dur?: number) => agregar('error', msg, dur ?? 6000),
	advertencia: (msg: string, dur?: number) => agregar('warning', msg, dur),
	info: (msg: string, dur?: number) => agregar('info', msg, dur),
};