<script lang="ts">
    import { onMount } from "svelte";
    import BuscadorProducto from "$components/pos/BuscadorProducto.svelte";
    import ItemCarrito from "$components/pos/ItemCarrito.svelte";
    import ModalCobro from "$components/pos/ModalCobro.svelte";
    import Button from "$components/ui/Button.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import {
        carritoStore,
        subtotalCarrito,
        impuestoCarrito,
        totalCarrito,
        cantidadItemsCarrito,
        turnoStore,
        hayTurnoAbierto,
        toastStore,
        offlineStore,
        estaOnline,
    } from "../../../lib/index";
    import { ventasApi } from "$api/ventas";
    import { formatCurrency } from "$utils/index";
    import type { Producto } from "$types/index";
    import { goto } from "$app/navigation";

    let modalCobroAbierto = false;
    let procesandoVenta = false;

    export let data;

    const { accessToken } = data;

    onMount(() => {
        // Si no hay turno abierto, redirigir a apertura
        if (!$hayTurnoAbierto) goto("/turno");
    });

    function agregarProducto(e: CustomEvent<Producto>) {
        carritoStore.agregar(e.detail);
        toastStore.exito(`${e.detail.nombre} agregado`, 1500);
    }

    async function procesarVenta(
        e: CustomEvent<{
            tipoComprobante: any;
            formaPago: any;
            pagos: any[];
        }>,
    ) {
        if (!turnoStore.turnoId) {
            toastStore.error("No hay turno abierto");
            return;
        }

        procesandoVenta = true;

        const payload = {
            turnoId: turnoStore.turnoId,
            tipoComprobante: e.detail.tipoComprobante,
            formaPago: e.detail.formaPago,
            pagos: e.detail.pagos,
            items: $carritoStore.map((i) => ({
                productoId: i.productoId,
                cantidad: i.cantidad,
                precioUnitario: i.precioUnitario,
                descuento: i.descuento,
            })),
        };

        try {
            if ($estaOnline) {
                // Online: registrar directamente
                const venta = await ventasApi.crear(payload, accessToken);
                carritoStore.limpiar();
                modalCobroAbierto = false;
                toastStore.exito(`Venta ${venta.numeroFactura} registrada`);
                turnoStore.sumarVenta($totalCarrito);
            } else {
                // Offline: encolar para sincronizar después
                offlineStore.agregarVenta(payload);
                carritoStore.limpiar();
                modalCobroAbierto = false;
                toastStore.advertencia(
                    "Venta guardada localmente. Se sincronizará al recuperar conexión.",
                );
            }
        } catch (err: any) {
            const msg =
                err?.mensajes?.[0] ??
                err?.message ??
                "Error al registrar la venta";
            toastStore.error(msg);
        } finally {
            procesandoVenta = false;
        }
    }
</script>

<div class="pos-screen">
    <!-- ─── Panel izquierdo: buscador ─────────────────────────── -->
    <div class="pos-panel-left">
        <!-- Buscador fijo arriba -->
        <div class="p-4 border-b border-gray-100 bg-white">
            <BuscadorProducto
                on:seleccionar={agregarProducto}
                token={accessToken}
            />
        </div>

        <!-- Área de categorías / acceso rápido (expandible en el futuro) -->
        <div class="flex-1 overflow-y-auto p-4">
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
                        Busca un producto arriba<br />o escanea el código de
                        barras
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- ─── Panel derecho: carrito ────────────────────────────── -->
    <div class="pos-panel-right flex flex-col">
        <!-- Cabecera carrito -->
        <div
            class="flex items-center justify-between px-4 py-3 border-b border-gray-200"
        >
            <div class="flex items-center gap-2">
                <svg
                    class="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.75"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                <span class="text-sm font-medium text-gray-700">Carrito</span>
                {#if $cantidadItemsCarrito > 0}
                    <span
                        class="w-5 h-5 bg-primary-400 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    >
                        {$cantidadItemsCarrito}
                    </span>
                {/if}
            </div>
            {#if $carritoStore.length > 0}
                <button
                    onclick={() => carritoStore.limpiar()}
                    class="text-xs text-gray-400 hover:text-danger-500 transition-colors"
                >
                    Limpiar
                </button>
            {/if}
        </div>

        <!-- Items del carrito -->
        <div class="flex-1 overflow-y-auto px-4">
            {#if $carritoStore.length === 0}
                <EmptyState
                    titulo="Carrito vacío"
                    descripcion="Agrega productos usando el buscador"
                    icono="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
            {:else}
                {#each $carritoStore as item (item.productoId)}
                    <ItemCarrito
                        {item}
                        on:quitar={(e) => carritoStore.quitar(e.detail)}
                    />
                {/each}
            {/if}
        </div>

        <!-- Totales -->
        {#if $carritoStore.length > 0}
            <div class="border-t border-gray-200 px-4 py-3 bg-white space-y-1">
                <div class="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency($subtotalCarrito)}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-500">
                    <span>IVA 12%</span>
                    <span>{formatCurrency($impuestoCarrito)}</span>
                </div>
                <div
                    class="flex justify-between text-lg font-bold text-gray-900 pt-1 border-t border-gray-100"
                >
                    <span>Total</span>
                    <span>{formatCurrency($totalCarrito)}</span>
                </div>
            </div>
        {/if}

        <!-- Botón cobrar -->
        <div class="p-4">
            <Button
                variant="primary"
                fullWidth
                disabled={$carritoStore.length === 0 || !$hayTurnoAbierto}
                onclick={() => (modalCobroAbierto = true)}
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                Cobrar · {formatCurrency($totalCarrito)}
            </Button>

            {#if !$hayTurnoAbierto}
                <p class="text-xs text-center text-danger-500 mt-2">
                    Debes <a href="/turno" class="underline">abrir un turno</a> para
                    vender
                </p>
            {/if}
        </div>
    </div>
</div>

<!-- Modal de cobro -->
<ModalCobro
    bind:open={modalCobroAbierto}
    total={$totalCarrito}
    procesando={procesandoVenta}
    on:confirmar={procesarVenta}
/>
