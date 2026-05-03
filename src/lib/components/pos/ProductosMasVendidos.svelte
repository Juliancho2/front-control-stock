<script lang="ts">
    import { onMount } from "svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import { productosApi } from "$api/productos";
    import { toastStore } from "$stores/toast.store";
    import type { Producto } from "$types/index";
    import { formatCurrency } from "$utils/index";

    export let token: string | undefined = undefined;
    export let onAgregar: (producto: Producto) => void = () => {};

    let productos: Producto[] = [];
    let cargando = true;

    onMount(async () => {
        try {
            const res = await productosApi.listar(
                {
                    activo: true,
                    limit: 16,
                    orden: "creado_desc",
                    conStock: true,
                },
                token,
            );
            productos = res.data;
        } catch (e) {
            console.error("Error al cargar productos más vendidos", e);
            productos = [];
        } finally {
            cargando = false;
        }
    });

    function getStockItems(producto: Producto) {
        const stockItems = producto.stock ?? (producto as any).inventarios;
        return Array.isArray(stockItems) ? stockItems : [];
    }

    function getStockDisponible(producto: Producto) {
        const stockItems = getStockItems(producto);
        // Si no hay información de stock (no se cargó o array vacío),
        // pero el producto existe, devolvemos undefined para no bloquear preventivamente
        // a menos que estemos seguros de que es 0.
        if (stockItems.length === 0) return undefined;

        return stockItems.reduce(
            (total, item) =>
                total +
                ((item.cantidadDisponible ??
                    (item.cantidad ?? 0) -
                        (item.cantidadReservada ?? 0)) as number),
            0,
        );
    }

    function agregarProducto(producto: Producto) {
        const disponible = getStockDisponible(producto);
        // Solo bloqueamos si sabemos positivamente que el stock es 0
        if (disponible === 0) {
            toastStore.advertencia(
                `El producto ${producto.nombre} no tiene stock disponible`,
            );
            return;
        }
        onAgregar(producto);
    }
</script>

<div class="flex-1 overflow-y-auto p-4 flex flex-col">
    {#if cargando}
        <div class="flex items-center justify-center h-full">
            <Spinner size="md" />
        </div>
    {:else if productos.length === 0}
        <div class="flex items-center justify-center h-full text-gray-300">
            <div class="text-center">
                <svg
                    class="w-12 h-12 mx-auto mb-3 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
                    />
                </svg>
                <p class="text-sm text-gray-300">
                    Busca un producto arriba<br />o escanea el código de barras
                </p>
            </div>
        </div>
    {:else}
        <div class="space-y-3">
            <div class="flex items-center gap-2 px-1">
                ⭐
                <span class="text-xs font-medium text-gray-800">
                    Acceso rápido ({productos.length})
                </span>
            </div>

            <div
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3"
            >
                {#each productos as producto (producto.id)}
                    <button
                        type="button"
                        onclick={() => agregarProducto(producto)}
                        disabled={getStockDisponible(producto) === 0}
                        class="flex flex-col p-2.5 rounded-xl border border-gray-200 bg-white active:scale-[0.97] transition-all duration-150 group text-left gap-2"
                        class:cursor-not-allowed={getStockDisponible(
                            producto,
                        ) === 0}
                        class:hover:bg-primary-50={getStockDisponible(
                            producto,
                        ) > 0}
                        class:hover:border-primary-200={getStockDisponible(
                            producto,
                        ) > 0}
                        class:opacity-70={getStockDisponible(producto) === 0}
                    >
                        <!-- Header: icono + info -->
                        <div class="flex items-center relative gap-2">
                            <div
                                class="w-9 h-9 rounded-lg flex items-center bg-gray-100 justify-center shrink-0 text-base"
                            >
                                {#if producto.imagenUrl}
                                    <img
                                        src={producto.imagenUrl}
                                        alt={producto.nombre}
                                        class="w-full h-full object-cover"
                                    />
                                {:else}
                                    <svg
                                        class="w-4 h-4 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="1.5"
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                {/if}
                            </div>

                            <div class="min-w-0">
                                <p
                                    class="text-[12px] font-medium text-gray-900 leading-snug line-clamp-2"
                                >
                                    {producto.nombre}
                                </p>
                                <p class="text-[10px] text-gray-400 mt-0.5">
                                    {producto.sku}
                                </p>
                                {#if getStockDisponible(producto) !== undefined}
                                    <span
                                        class="text-[10px] top-0 right-0 absolute px-2 py-1 rounded-full font-semibold"
                                        class:bg-red-50={getStockDisponible(
                                            producto,
                                        ) === 0}
                                        class:text-red-700={getStockDisponible(
                                            producto,
                                        ) === 0}
                                        class:bg-emerald-50={getStockDisponible(
                                            producto,
                                        ) > 0}
                                        class:text-emerald-700={getStockDisponible(
                                            producto,
                                        ) > 0}
                                    >
                                        {getStockDisponible(producto) === 0
                                            ? "Sin stock"
                                            : `Stock ${getStockDisponible(producto)}`}
                                    </span>
                                {/if}
                            </div>
                        </div>

                        <!-- Footer: precio + stock/acción -->
                        <div
                            class="flex items-center justify-between border-t border-gray-100 pt-2 mt-auto"
                        >
                            <p class="text-[14px] font-bold text-primary-600">
                                {formatCurrency(producto.precioVenta)}
                            </p>

                            <div class="flex items-center gap-2">
                                <span
                                    class="text-[10px] text-primary-500 opacity-0 group-hover:opacity-100 transition"
                                >
                                    + agregar
                                </span>
                            </div>
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
