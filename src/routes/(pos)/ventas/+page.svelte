<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import Button from "$components/ui/Button.svelte";
    import { ventasApi } from "./../../../lib/api/ventas";
    import { turnoActivo, toastStore } from "../../../lib/index";
    import TicketVenta from "$components/pos/TicketVenta.svelte";
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type { Venta } from "$types/index";

    let ventas: Venta[] = [];
    let total = 0;
    let page = 1;
    let cargando = true;
    let ventaAnular: Venta | null = null;
    let motivoAnulacion = "";
    let anulando = false;
    let ventaImprimir: Venta | null = null;
    let imprimiendo = false;

    const estadoColor: Record<string, "green" | "yellow" | "red" | "gray"> = {
        pagada: "green",
        pendiente: "yellow",
        credito: "yellow",
        anulada: "red",
    };

    export let data;
    const { accessToken } = data;

    async function cargar() {
        if (!$turnoActivo?.id) {
            ventas = [];
            total = 0;
            cargando = false;
            return;
        }
        cargando = true;
        try {
            const filtros: any = { page, limit: 10, turnoId: $turnoActivo.id };
            const res = await ventasApi.listar(filtros, accessToken);
            ventas = res.data;
            total = res.total;
        } catch {
            toastStore.error("Error al cargar ventas");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);
    $: if (page) cargar();

    async function anular() {
        if (!ventaAnular || !motivoAnulacion.trim()) return;
        anulando = true;
        try {
            await ventasApi.anular(
                ventaAnular.id,
                motivoAnulacion,
                true,
                accessToken,
            );
            toastStore.exito("Venta anulada correctamente");
            ventaAnular = null;
            motivoAnulacion = "";
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al anular");
        } finally {
            anulando = false;
        }
    }

    async function imprimirTicket(id: string) {
        imprimiendo = true;
        try {
            const venta = await ventasApi.obtener(id, accessToken);
            ventaImprimir = venta;
            setTimeout(() => {
                window.print();
                ventaImprimir = null;
            }, 500);
        } catch {
            toastStore.error("Error al obtener datos de la venta");
        } finally {
            imprimiendo = false;
        }
    }
</script>

<svelte:head><title>Ventas del turno — FerreControl</title></svelte:head>

<div class="p-4 h-full flex flex-col overflow-hidden">
    <PageHeader titulo="Ventas del turno">
        <Button variant="primary" href="/pos">
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
                    d="M12 4v16m8-8H4"
                />
            </svg>
            Nueva venta
        </Button>
    </PageHeader>

    {#if !$turnoActivo}
        <div class="flex-1 flex items-center justify-center">
            <div class="text-center space-y-3">
                <svg
                    class="w-12 h-12 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                </svg>
                <p class="text-gray-500 text-sm">
                    No hay un turno abierto. Abre un turno para ver las ventas.
                </p>
                <Button variant="primary" href="/turno">Abrir turno</Button>
            </div>
        </div>
    {:else if cargando}
        <div class="flex-1 flex items-center justify-center">
            <Spinner size="lg" />
        </div>
    {:else if ventas.length === 0}
        <EmptyState
            titulo="Sin ventas"
            descripcion="No hay ventas registradas en este turno"
            icono="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
    {:else}
        <div class="flex-1 overflow-y-auto">
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Factura</th>
                            <th>Cliente</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Pago</th>
                            <th>Estado</th>
                            <th>Hora</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each ventas as venta}
                            <tr>
                                <td class="font-mono text-xs"
                                    >{venta.numeroFactura}</td
                                >
                                <td class="text-xs"
                                    >{venta.clienteNombre ??
                                        "Consumidor final"}</td
                                >
                                <td class="text-center"
                                    >{venta.items?.length ?? 0}</td
                                >
                                <td class="font-semibold"
                                    >{formatCurrency(venta.total)}</td
                                >
                                <td class="capitalize text-xs"
                                    >{venta.formaPago.replace("_", " ")}</td
                                >
                                <td>
                                    <Badge
                                        variant={estadoColor[venta.estado] ??
                                            "gray"}
                                        dot
                                    >
                                        {venta.estado}
                                    </Badge>
                                </td>
                                <td class="text-xs text-gray-400"
                                    >{formatFechaHora(venta.createdAt)}</td
                                >
                                <td>
                                    <div class="flex items-center gap-3">
                                        <button
                                            onclick={() => imprimirTicket(venta.id)}
                                            class="text-xs text-primary-600 hover:underline font-medium"
                                            disabled={imprimiendo}
                                        >
                                            Ticket
                                        </button>
                                        {#if venta.estado !== "anulada"}
                                            <button
                                                onclick={() =>
                                                    (ventaAnular = venta)}
                                                class="text-xs text-danger-500 hover:underline"
                                                >Anular</button
                                            >
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            <Pagination {total} bind:currentPage={page} limit={10} />
        </div>
    {/if}
</div>

<!-- Modal anulación -->
{#if ventaAnular}
    <div
        class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4"
        >
            <h2 class="text-base font-semibold text-gray-900">
                Anular venta {ventaAnular.numeroFactura}
            </h2>
            <p class="text-sm text-gray-500">
                Esta acción devuelve el stock al inventario.
            </p>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                    Motivo de anulación <span class="text-danger-400">*</span>
                </label>
                <textarea
                    bind:value={motivoAnulacion}
                    rows="3"
                    class="input resize-none"
                    placeholder="Describe el motivo..."
                />
            </div>
            <div class="flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (ventaAnular = null)}
                    disabled={anulando}
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    fullWidth
                    loading={anulando}
                    disabled={!motivoAnulacion.trim()}
                    onclick={anular}
                >
                    Anular venta
                </Button>
            </div>
        </div>
    </div>
{/if}

{#if ventaImprimir}
    <TicketVenta venta={ventaImprimir} />
{/if}
