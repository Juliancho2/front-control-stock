<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { carritoStore } from "$stores/carrito.store";
    import { formatCurrency } from "$utils/index";
    import type { ItemCarrito } from "$types/index";
    import Badge from "$components/ui/Badge.svelte";

    export let item: ItemCarrito;
    const dispatch = createEventDispatcher<{ quitar: string }>();

    let editandoCantidad = false;
    let cantidadInput = item.cantidad;

    function confirmarCantidad() {
        const n = parseInt(String(cantidadInput));
        if (!isNaN(n) && n > 0) {
            carritoStore.actualizarCantidad(item.productoId, n);
        } else if (n <= 0) {
            dispatch("quitar", item.productoId);
        }
        editandoCantidad = false;
    }

    function onKeydownCantidad(e: KeyboardEvent) {
        if (e.key === "Enter") confirmarCantidad();
        if (e.key === "Escape") {
            editandoCantidad = false;
            cantidadInput = item.cantidad;
        }
    }
</script>

<div
    class="flex items-start gap-3 mt-1 py-3 border bg-white p-4 rounded-lg border-gray-200 group"
>
    <!-- Info Producto -->
    <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">{item.nombre}</p>
        <p class="text-xs text-gray-500 my-0.5 font-semibold">
            ${Number(item.precioUnitario).toFixed(2)}
            {item.unidadMedida}
        </p>
        <Badge variant="gray">IVA: {item.iva ?? 12}%</Badge>
    </div>

    <!-- Controles cantidad -->
    <div class="flex items-center gap-1 flex-shrink-0">
        <button
            onclick={() =>
                carritoStore.actualizarCantidad(
                    item.productoId,
                    item.cantidad - 1,
                )}
            class="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
        >
            <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                />
            </svg>
        </button>

        {#if editandoCantidad}
            <input
                type="number"
                bind:value={cantidadInput}
                onblur={confirmarCantidad}
                onkeydown={onKeydownCantidad}
                class="w-12 h-6 text-center text-sm border border-primary-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-400"
                min="0"
                autofocus
            />
        {:else}
            <button
                onclick={() => {
                    editandoCantidad = true;
                    cantidadInput = item.cantidad;
                }}
                class="w-12 h-6 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
                {item.cantidad}
            </button>
        {/if}

        <button
            onclick={() =>
                carritoStore.actualizarCantidad(
                    item.productoId,
                    item.cantidad + 1,
                )}
            class="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
        >
            <svg
                class="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                />
            </svg>
        </button>
    </div>

    <!-- Subtotal -->
    <div class="text-right flex-shrink-0 w-16">
        <p class="text-sm font-semibold text-gray-900">
            {formatCurrency(item.subtotal)}
        </p>
        {#if item.descuento > 0}
            <p class="text-xs text-primary-600">
                -{formatCurrency(item.descuento)}
            </p>
        {/if}
    </div>

    <!-- Quitar -->
    <button
        onclick={() => dispatch("quitar", item.productoId)}
        class=" group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-md text-gray-500 hover:text-danger-500 hover:bg-danger-50 transition-all flex-shrink-0"
        aria-label="Quitar del carrito"
    >
        <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    </button>
</div>
