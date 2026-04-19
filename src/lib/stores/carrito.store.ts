import { writable, derived } from 'svelte/store';
import type { ItemCarrito, Producto } from '$types/index';

const IVA_DEFAULT = 0.12;

function crearCarritoStore() {
	const { subscribe, set, update } = writable<ItemCarrito[]>([]);

	return {
		subscribe,

		agregar: (producto: Producto, cantidad = 1) => {
			update(items => {
				const existente = items.find(i => i.productoId === producto.id);

				if (existente) {
					return items.map(i =>
						i.productoId === producto.id
							? { ...i, cantidad: i.cantidad + cantidad, subtotal: (i.cantidad + cantidad) * i.precioUnitario - i.descuento }
							: i
					);
				}

				const nuevo: ItemCarrito = {
					productoId: producto.id,
					sku: producto.sku,
					nombre: producto.nombre,
					cantidad,
					precioUnitario: producto.precioVenta,
					descuento: 0,
					subtotal: cantidad * producto.precioVenta,
					iva: producto.iva ?? IVA_DEFAULT * 100,
					unidadMedida: producto.unidadMedida
				};

				return [...items, nuevo];
			});
		},

		actualizarCantidad: (productoId: string, cantidad: number) => {
			update(items => {
				if (cantidad <= 0) return items.filter(i => i.productoId !== productoId);
				return items.map(i =>
					i.productoId === productoId
						? { ...i, cantidad, subtotal: cantidad * i.precioUnitario - i.descuento }
						: i
				);
			});
		},

		aplicarDescuento: (productoId: string, descuento: number) => {
			update(items =>
				items.map(i =>
					i.productoId === productoId
						? { ...i, descuento, subtotal: i.cantidad * i.precioUnitario - descuento }
						: i
				)
			);
		},

		quitar: (productoId: string) => {
			update(items => items.filter(i => i.productoId !== productoId));
		},

		limpiar: () => set([]),
	};
}

export const carritoStore = crearCarritoStore();

// ─── Derivados ────────────────────────────────────────────────

export const subtotalCarrito = derived(
	carritoStore,
	$items => $items.reduce((sum, i) => sum + i.subtotal, 0),
);

export const descuentoCarrito = derived(
	carritoStore,
	$items => $items.reduce((sum, i) => sum + i.descuento, 0),
);

export const impuestoCarrito = derived(
	carritoStore,
	$items => $items.reduce((sum, i) => {
		const tasa = (i.iva ?? IVA_DEFAULT * 100) / 100;
		return sum + Math.round(i.subtotal * tasa * 100) / 100;
	}, 0),
);

export const totalCarrito = derived(
	[subtotalCarrito, impuestoCarrito],
	([$sub, $iva]) => Math.round(($sub + $iva) * 100) / 100,
);

export const cantidadItemsCarrito = derived(
	carritoStore,
	$items => $items.reduce((sum, i) => sum + i.cantidad, 0),
);