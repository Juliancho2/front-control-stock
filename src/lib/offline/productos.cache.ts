import { getDB, type FerreteriaDB } from './db';

type ProductoCache = FerreteriaDB['productos']['value'];

export const productosCache = {
	getAll: async (): Promise<ProductoCache[]> => {
		const db = await getDB();
		return db.getAll('productos');
	},

	get: async (id: string): Promise<ProductoCache | undefined> => {
		const db = await getDB();
		return db.get('productos', id);
	},

	set: async (productos: ProductoCache[]): Promise<void> => {
		const db = await getDB();
		const tx = db.transaction('productos', 'readwrite');
		await tx.store.clear();
		for (const p of productos) {
			await tx.store.put({ ...p, syncedAt: new Date().toISOString() });
		}
		await tx.done;
	},

	buscar: async (termino: string): Promise<ProductoCache[]> => {
		const todos = await productosCache.getAll();
		const q = termino.toLowerCase();
		return todos.filter(p =>
			p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
		);
	},

	count: async (): Promise<number> => {
		const db = await getDB();
		return db.count('productos');
	},
};
