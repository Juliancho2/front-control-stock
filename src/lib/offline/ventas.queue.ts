import { getDB } from './db';
import { ventasApi } from '$api/ventas';
import type { CreateVentaPayload } from '$api/ventas';
import { offlineStore } from '$stores/offline.store';

export interface VentaPendienteDB {
	id: string;
	payload: CreateVentaPayload;
	creadaEn: string;
	intentos: number;
	error?: string;
}

export const ventasQueue = {
	add: async (payload: CreateVentaPayload): Promise<string> => {
		const db = await getDB();
		const id = crypto.randomUUID();
		const venta: VentaPendienteDB = { id, payload, creadaEn: new Date().toISOString(), intentos: 0 };
		await db.put('ventasPendientes', venta);
		offlineStore.agregarVenta(payload);
		return id;
	},

	getAll: async (): Promise<VentaPendienteDB[]> => {
		const db = await getDB();
		return db.getAll('ventasPendientes');
	},

	remove: async (id: string): Promise<void> => {
		const db = await getDB();
		await db.delete('ventasPendientes', id);
		offlineStore.removerVenta(id);
	},

	markError: async (id: string, error: string): Promise<void> => {
		const db = await getDB();
		const venta = await db.get('ventasPendientes', id);
		if (venta) {
			venta.intentos += 1;
			venta.error = error;
			await db.put('ventasPendientes', venta);
			offlineStore.marcarError(id, error);
		}
	},

	process: async (token?: string): Promise<{ ok: number; failed: number }> => {
		const db = await getDB();
		const pendientes = await db.getAll('ventasPendientes');
		let ok = 0;
		let failed = 0;

		offlineStore.marcarSincronizando(true);

		for (const venta of pendientes) {
			try {
				await ventasApi.crear(venta.payload, token);
				await db.delete('ventasPendientes', venta.id);
				offlineStore.removerVenta(venta.id);
				ok++;
			} catch (e: any) {
				const msg = typeof e?.message === 'string' ? e.message : 'Error desconocido';
				venta.intentos += 1;
				venta.error = msg;
				await db.put('ventasPendientes', venta);
				offlineStore.marcarError(venta.id, msg);
				failed++;
			}
		}

		offlineStore.marcarSincronizando(false);
		return { ok, failed };
	},

	count: async (): Promise<number> => {
		const db = await getDB();
		return db.count('ventasPendientes');
	},
};
