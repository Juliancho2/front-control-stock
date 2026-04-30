<script lang="ts">
    import { onMount } from "svelte";
    import BuscadorProducto from "$components/pos/BuscadorProducto.svelte";
    import ItemCarrito from "$components/pos/ItemCarrito.svelte";
    import ModalCobro from "$components/pos/ModalCobro.svelte";
    import TicketVenta from "$components/pos/TicketVenta.svelte";
    import ConfirmDialog from "$components/ui/ConfirmDialog.svelte";
    import Button from "$components/ui/Button.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import ProductosMasVendidos from "$components/pos/ProductosMasVendidos.svelte";
    import {
        carritoStore,
        subtotalCarrito,
        impuestoCarrito,
        totalCarrito,
        cantidadItemsCarrito,
        turnoStore,
        hayTurnoAbierto,
        turnoActivo,
        toastStore,
        offlineStore,
        estaOnline,
    } from "../../../lib/index";
    import { ventasApi } from "$api/ventas";
    import { cajaApi } from "$api/caja";
    import { clientesApi } from "$api/clientes";
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type { Producto, Cliente, Venta } from "$types/index";
    import { goto } from "$app/navigation";

    let modalCobroAbierto = false;
    let modalLimpiarAbierto = false;
    let procesandoVenta = false;
    let cargandoTurno = true;
    let vistaMovil: "productos" | "carrito" = "productos";
    let clientes: Cliente[] = [];
    let ventaImprimir: Venta | null = null;

    export let data;

    const { accessToken } = data;

    onMount(async () => {
        // El turno ya se inicializa en el layout (+layout.svelte)
        
        try {
            const res = await clientesApi.listar({ limit: 1000 }, accessToken);
            clientes = res.data.filter(c => c.activo);
        } catch (e) {
            console.error("No se pudieron cargar los clientes");
        } finally {
            cargandoTurno = false;
        }

        // Si no hay turno abierto después de cargar (damos un pequeño margen si es necesario), redirigir
        // Nota: hayTurnoAbierto es derivado de turnoStore que se inicializa en el layout
        if (!$hayTurnoAbierto && !cargandoTurno) {
             // Si después de cargar clientes aún no hay turno, redirigimos
             // Aunque el layout podría seguir cargando, usualmente termina antes o al mismo tiempo
             goto("/turno");
        }
    });

    function agregarProducto(e: CustomEvent<Producto>) {
        carritoStore.agregar(e.detail);
        toastStore.exito(`${e.detail.nombre} agregado`, 1500);
        if (window.innerWidth < 768) vistaMovil = "carrito";
    }

    async function procesarVenta(
        e: CustomEvent<{
            tipoComprobante: any;
            formaPago: any;
            pagos: any[];
            clienteId: string | null;
        }>,
    ) {
        if (!turnoStore.turnoId) {
            toastStore.error("No hay turno abierto");
            return;
        }

        procesandoVenta = true;

        const payload = {
            turnoId: turnoStore.turnoId,
            clienteId: e.detail.clienteId || undefined,
            tipoComprobante: e.detail.tipoComprobante,
            formaPago: e.detail.formaPago,
            pagos: e.detail.pagos,
            items: $carritoStore.map((i) => ({
                productoId: i.productoId,
                cantidad: i.cantidad,
                precioUnitario: i.precioUnitario,
                descuento: i.descuento,
                iva: i.iva,
            })),
        };

        try {
            if ($estaOnline) {
                // Online: registrar directamente
                const venta = await ventasApi.crear(payload, accessToken);
                ventaImprimir = venta;
                carritoStore.limpiar();
                modalCobroAbierto = false;
                toastStore.exito(`Venta ${venta.numeroFactura} registrada`);
                turnoStore.sumarVenta($totalCarrito);

                setTimeout(() => {
                    window.print();
                    setTimeout(() => ventaImprimir = null, 1000);
                }, 300);
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

{#if cargandoTurno}
    <div class="flex items-center justify-center h-screen">
        <Spinner size="lg" />
    </div>
{:else}
    <div class="pos-screen">
        <!-- ─── Panel izquierdo: buscador ─────────────────────────── -->
        <div
            class="pos-panel-left flex-col pb-14 md:pb-0 {vistaMovil ===
            'productos'
                ? 'flex'
                : 'hidden md:flex'}"
        >
            <!-- Barra superior POS -->
            <div
                class="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white"
            >
                <div class="flex items-center gap-2 text-sm text-gray-500">
                    {#if $turnoActivo}
                        <svg
                            class="w-4 h-4 text-primary-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span
                            >Turno desde <strong
                                >{formatFechaHora(
                                    $turnoActivo.abiertoEn,
                                )}</strong
                            ></span
                        >
                        <span class="text-gray-300">|</span>
                        <span
                            >Ventas: <strong
                                >{formatCurrency(
                                    $turnoActivo.totalVentas,
                                )}</strong
                            ></span
                        >
                    {/if}
                </div>
                <button
                    onclick={() => goto("/turno")}
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-danger-600 bg-danger-50 hover:bg-danger-100 rounded-lg transition-colors"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    Cerrar turno
                </button>
            </div>

            <!-- Buscador fijo arriba -->
            <div class="p-4 border-b border-gray-100 bg-white">
                <BuscadorProducto
                    on:seleccionar={agregarProducto}
                    token={accessToken}
                />
            </div>

            <!-- Área de productos más vendidos -->
            <ProductosMasVendidos
                token={accessToken}
                onAgregar={(producto) => {
                    carritoStore.agregar(producto);
                    toastStore.exito(`${producto.nombre} agregado`, 1500);
                    if (window.innerWidth < 768) vistaMovil = "carrito";
                }}
            />
        </div>

        <!-- ─── Panel derecho: carrito ────────────────────────────── -->
        <div
            class="pos-panel-right flex-col pt-4 pb-14 sm:pb-0 {vistaMovil ===
            'carrito'
                ? 'flex'
                : 'hidden md:flex'}"
        >
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
                    <span class="text-sm font-medium text-gray-700"
                        >Carrito</span
                    >
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
                        onclick={() => (modalLimpiarAbierto = true)}
                        class="text-xs text-red-600 font-semibold hover:text-danger-500 transition-colors"
                    >
                        Limpiar
                    </button>
                {/if}
            </div>

            <!-- Items del carrito -->
            <div class="flex-1 py-3 overflow-y-auto px-4">
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
                <div
                    class="border-t border-gray-200 px-4 py-3 bg-white space-y-1"
                >
                    <div class="flex justify-between text-xs text-gray-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency($subtotalCarrito)}</span>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                        <span>IVA total</span>
                        <span>{formatCurrency($impuestoCarrito)}</span>
                    </div>
                    <div
                        class="flex justify-between text-2xl font-bold text-gray-900 pt-3 border-t border-gray-100"
                    >
                        <span>Total</span>
                        <span>{formatCurrency($totalCarrito)}</span>
                    </div>
                </div>
            {/if}

            <!-- Botón cobrar -->
            <div class="p-4">
                <Button
                    size="lg"
                    variant="primary"
                    fullWidth
                    disabled={$carritoStore.length === 0 || !$hayTurnoAbierto}
                    onclick={() => (modalCobroAbierto = true)}
                >
                    <svg
                        class="w-9 h-9"
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
                        Debes <a href="/turno" class="underline"
                            >abrir un turno</a
                        > para vender
                    </p>
                {/if}
            </div>
        </div>

        <!-- Tab bar móvil -->
        <div
            class="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-gray-200 bg-white"
        >
            <button
                onclick={() => (vistaMovil = "productos")}
                class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
                class:text-primary-600={vistaMovil === "productos"}
                class:bg-primary-50={vistaMovil === "productos"}
                class:text-gray-500={vistaMovil !== "productos"}
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                Productos
            </button>
            <button
                onclick={() => (vistaMovil = "carrito")}
                class="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative"
                class:text-primary-600={vistaMovil === "carrito"}
                class:bg-primary-50={vistaMovil === "carrito"}
                class:text-gray-500={vistaMovil !== "carrito"}
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
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                Carrito
                {#if $cantidadItemsCarrito > 0}
                    <span
                        class="absolute top-2 right-1/4 w-5 h-5 bg-primary-400 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    >
                        {$cantidadItemsCarrito}
                    </span>
                {/if}
            </button>
        </div>
    </div>

    <!-- Modal de cobro -->
    <ModalCobro
        bind:open={modalCobroAbierto}
        total={$totalCarrito}
        procesando={procesandoVenta}
        {clientes}
        on:confirmar={procesarVenta}
    />

    <ConfirmDialog
        bind:open={modalLimpiarAbierto}
        titulo="¿Vaciar carrito?"
        mensaje="Se eliminarán todos los productos agregados."
        labelConfirmar="Vaciar"
        on:confirmar={() => {
            carritoStore.limpiar();
            modalLimpiarAbierto = false;
        }}
    />

    {#if ventaImprimir}
        <TicketVenta venta={ventaImprimir} />
    {/if}
{/if}
