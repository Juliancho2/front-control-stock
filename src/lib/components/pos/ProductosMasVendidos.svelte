<script lang="ts">
    import { onMount } from "svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import { productosApi } from "$api/productos";
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
                    limit: 8,
                    orden: "creado_desc", // más recientes primero
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

    function agregarProducto(producto: Producto) {
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
                <svg
                    class="w-4 h-4 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                </svg>
                <span class="text-xs font-medium text-gray-500">
                    Acceso rápido
                </span>
            </div>

            <div
                class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3"
            >
                {#each productos as producto (producto.id)}
                    <button
                        onclick={() => agregarProducto(producto)}
                        class="flex flex-col p-2 rounded-lg border border-gray-200 bg-white
           hover:border-primary-300 hover:border-primary-200 active:scale-[0.98]
           active:bg-primary-50 transition-all group text-left"
                    >
                        <!-- Header: imagen pequeña + info -->
                        <div class="flex items-center gap-2 mb-1">
                            <!-- Imagen pequeña -->
                            <div
                                class="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden shrink-0"
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

                            <!-- Nombre + SKU -->
                            <div class="min-w-0">
                                <p
                                    class="text-sm font-semibold text-gray-900 leading-tight truncate"
                                >
                                    {producto.nombre}
                                </p>
                                <p class="text-[11px] text-gray-400 truncate">
                                    {producto.sku}
                                </p>
                            </div>
                        </div>

                        <!-- Precio + acción -->
                        <div class="flex items-center justify-between mt-1">
                            <p class="text-base font-bold text-primary-600">
                                {formatCurrency(producto.precioVenta)}
                            </p>

                            <span
                                class="text-[10px] text-primary-500 opacity-0 group-hover:opacity-100 transition"
                            >
                                + Agregar
                            </span>
                        </div>
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
