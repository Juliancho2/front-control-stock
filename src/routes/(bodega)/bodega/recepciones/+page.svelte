<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Button from "$components/ui/Button.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import { comprasApi } from "$api/compras";
    import { toastStore } from "$stores/toast.store";
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type { OrdenCompra, OrdenCompraItem } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let ordenesPendientes: OrdenCompra[] = [];
    let cargando = true;
    let ordenSeleccionada: OrdenCompra | null = null;
    let modalRecepcion = false;
    let recibiendo = false;
    let observaciones = "";
    let errorRecepcion = "";

    // Items a recibir
    let itemsRecepcion: {
        ordenItemId: string;
        cantidadRecibida: number;
        cantidadPendiente: number;
        productoNombre: string;
        productoSku: string;
    }[] = [];

    async function cargar() {
        cargando = true;
        try {
            const res = await comprasApi.ordenes.listar(
                { estado: "enviada", limit: "50" },
                accessToken,
            );
            const res2 = await comprasApi.ordenes.listar(
                { estado: "parcial", limit: "50" },
                accessToken,
            );
            ordenesPendientes = [...res.data, ...res2.data];

            // Si viene un ordenId en query params, abrirla directamente
            const ordenId = $page.url.searchParams.get("ordenId");
            if (ordenId) {
                const orden = ordenesPendientes.find((o) => o.id === ordenId);
                if (orden) abrirRecepcion(orden);
                else {
                    try {
                        const o = await comprasApi.ordenes.obtener(
                            ordenId,
                            accessToken,
                        );
                        if (
                            o &&
                            (o.estado === "enviada" || o.estado === "parcial")
                        )
                            abrirRecepcion(o);
                    } catch {
                        /* ignore */
                    }
                }
            }
        } catch {
            toastStore.error("Error al cargar órdenes pendientes");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function abrirRecepcion(orden: OrdenCompra) {
        ordenSeleccionada = orden;
        observaciones = "";
        itemsRecepcion = (orden.items ?? [])
            .filter((i: OrdenCompraItem) => i.cantidadPendiente > 0)
            .map((i: OrdenCompraItem) => ({
                ordenItemId: i.id,
                cantidadRecibida: i.cantidadPendiente,
                cantidadPendiente: i.cantidadPendiente,
                productoNombre: i.productoNombre,
                productoSku: i.productoSku,
            }));
        modalRecepcion = true;
    }

    async function confirmarRecepcion() {
        if (!ordenSeleccionada) return;
        errorRecepcion = "";
        const excedido = itemsRecepcion.find(
            (i) => i.cantidadRecibida > i.cantidadPendiente,
        );
        if (excedido) {
            errorRecepcion = `"${excedido.productoNombre}" excede la cantidad pendiente (${excedido.cantidadPendiente})`;
            return;
        }
        const itemsValidos = itemsRecepcion.filter(
            (i) => i.cantidadRecibida > 0,
        );
        if (itemsValidos.length === 0) {
            errorRecepcion = "Ingresa al menos una cantidad";
            return;
        }
        recibiendo = true;
        try {
            await comprasApi.ordenes.recibir(
                ordenSeleccionada.id,
                {
                    items: itemsValidos.map((i) => ({
                        ordenItemId: i.ordenItemId,
                        cantidadRecibida: i.cantidadRecibida,
                    })),
                    observaciones: observaciones || undefined,
                },
                accessToken,
            );
            toastStore.exito("Recepción registrada correctamente");
            modalRecepcion = false;
            ordenSeleccionada = null;
            cargar();
        } catch (e: any) {
            toastStore.error(
                e?.mensajes?.[0] ?? "Error al registrar recepción",
            );
        } finally {
            recibiendo = false;
        }
    }

    const estadoColor: Record<string, "blue" | "yellow"> = {
        enviada: "blue",
        parcial: "yellow",
    };
</script>

<svelte:head><title>Recepciones — FerreControl</title></svelte:head>

<PageHeader titulo="Recepciones de mercadería" />

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if ordenesPendientes.length === 0}
    <EmptyState
        titulo="Sin pendientes"
        descripcion="No hay órdenes de compra pendientes de recepción"
        icono="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    />
{:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each ordenesPendientes as o}
            <div
                class="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:shadow-md transition"
            >
                <div class="flex items-center justify-between">
                    <span class="font-mono text-sm font-semibold"
                        >{o.numero}</span
                    >
                    <Badge variant={estadoColor[o.estado] ?? "blue"} dot
                        >{o.estado}</Badge
                    >
                </div>
                <div class="text-sm text-gray-600">
                    <p class="font-medium">{o.proveedorNombre}</p>
                    {#if o.fechaEntrega}
                        <p class="text-xs text-gray-400 mt-1">
                            Entrega: {formatFechaHora(o.fechaEntrega)}
                        </p>
                    {/if}
                </div>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500"
                        >{o.items?.length ?? 0} items</span
                    >
                    <span class="font-semibold">{formatCurrency(o.total)}</span>
                </div>
                <Button
                    variant="primary"
                    fullWidth
                    onclick={() => abrirRecepcion(o)}>Recibir mercadería</Button
                >
            </div>
        {/each}
    </div>
{/if}

<!-- Modal de recepción -->
<Modal
    bind:open={modalRecepcion}
    title="Recibir orden {ordenSeleccionada?.numero ?? ''}"
    size="xl"
>
    {#if ordenSeleccionada}
        <div class="space-y-4">
            <div class="flex items-center gap-3 text-sm text-gray-600">
                <span
                    >Proveedor: <strong
                        >{ordenSeleccionada.proveedorNombre}</strong
                    ></span
                >
                <span>•</span>
                <span
                    >Total: <strong
                        >{formatCurrency(ordenSeleccionada.total)}</strong
                    ></span
                >
            </div>

            <div class="border rounded-lg overflow-hidden">
                <table class="table w-full text-sm">
                    <thead>
                        <tr
                            ><th>Producto</th><th class="text-center"
                                >Pendiente</th
                            ><th class="text-center w-28">Recibido</th></tr
                        >
                    </thead>
                    <tbody>
                        {#each itemsRecepcion as item}
                            <tr>
                                <td>
                                    <p class="font-medium">
                                        {item.productoNombre}
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        {item.productoSku}
                                    </p>
                                </td>
                                <td class="text-center">
                                    <Badge variant="yellow"
                                        >{item.cantidadPendiente}</Badge
                                    >
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        min="0"
                                        max={item.cantidadPendiente}
                                        bind:value={item.cantidadRecibida}
                                        class="input py-1 px-2 text-center w-20 mx-auto block"
                                    />
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <Input
                label="Observaciones"
                bind:value={observaciones}
                placeholder="Notas de la recepción (opcional)"
            />
        </div>
    {/if}
    {#if errorRecepcion}<p class="text-xs text-danger-600 text-center mt-2">
            {errorRecepcion}
        </p>{/if}
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalRecepcion = false)}
            >Cancelar</Button
        >
        <Button
            variant="primary"
            loading={recibiendo}
            onclick={confirmarRecepcion}>Confirmar recepción</Button
        >
    </svelte:fragment>
</Modal>
