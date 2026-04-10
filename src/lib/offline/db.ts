import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'ferreteria-erp';
const DB_VERSION = 1;

export interface FerreteriaDB {
	productos: {
		key: string;
		value: { id: string; sku: string; nombre: string; precioVenta: number; precioMayorista: number | null; categoriaId: string | null; categoriaNombre: string | null; unidadMedida: string; activo: boolean; syncedAt: string };
	};
	ventasPendientes: {
		key: string;
		value: { id: string; payload: any; creadaEn: string; intentos: number; error?: string };
	};
}

let dbInstance: IDBPDatabase<FerreteriaDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<FerreteriaDB>> {
	if (dbInstance) return dbInstance;
	dbInstance = await openDB<FerreteriaDB>(DB_NAME, DB_VERSION, {
		upgrade(db) {
			if (!db.objectStoreNames.contains('productos')) {
				db.createObjectStore('productos', { keyPath: 'id' });
			}
			if (!db.objectStoreNames.contains('ventasPendientes')) {
				db.createObjectStore('ventasPendientes', { keyPath: 'id' });
			}
		},
	});
	return dbInstance;
}

export const initDB = async () => {
	await getDB();
};
