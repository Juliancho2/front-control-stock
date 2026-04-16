<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import Button from "$components/ui/Button.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import Select from "$components/ui/Select.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import { comprasApi } from "$api/compras";
    import { productosApi } from "$api/productos";
    import { toastStore } from "$stores/toast.store";
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type { OrdenCompra, Proveedor, Producto } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let ordenes: OrdenCompra[] = [];
    let total = 0;
    let cargando = true;
    let pagina = 1;
    let busqueda = "";
    let filtroEstado = "";

    // Crear OC
    let modalCrear = false;
    let proveedores: Proveedor[] = [];
    let proveedorId = "";
    let fechaEntrega = "";
    let observaciones = "";
    let items: {
        productoId: string;
        nombre: string;
        cantidad: number;
        precioUnitario: number;
    }[] = [];
    let creando = false;
    let erroresOC: Record<string, string> = {};

    // Buscar producto para agregar
    let busquedaProducto = "";
    let productosEncontrados: Producto[] = [];
    let buscandoProducto = false;

    // Anular
    let ordenAnular: OrdenCompra | null = null;
    let motivoAnulacion = "";
    let anulando = false;

    const estadoColor: Record<
        string,
        "green" | "yellow" | "red" | "blue" | "gray"
    > = {
        borrador: "gray",
        enviada: "blue",
        parcial: "yellow",
        recibida: "green",
        anulada: "red",
    };

    async function cargar() {
        cargando = true;
        try {
            const filtros: Record<string, string> = {
                page: String(pagina),
                limit: "20",
            };
            if (busqueda) filtros.q = busqueda;
            if (filtroEstado) filtros.estado = filtroEstado;
            const res = await comprasApi.ordenes.listar(filtros, accessToken);
            ordenes = res.data;
            total = res.total;
        } catch {
            toastStore.error("Error al cargar órdenes");
        } finally {
            cargando = false;
        }
    }

    onMount(async () => {
        try {
            const res = await comprasApi.proveedores.listar(
                { limit: "100" },
                accessToken,
            );
            proveedores = res.data;
        } catch {
            /* ignore */
        }
        cargar();
    });

    function abrirCrear() {
        proveedorId = "";
        fechaEntrega = "";
        observaciones = "";
        items = [];
        modalCrear = true;
    }

    async function buscarProducto() {
        if (!busquedaProducto.trim()) return;
        buscandoProducto = true;
        try {
            const res = await productosApi.listar(
                { q: busquedaProducto, limit: 5 },
                accessToken,
            );
            productosEncontrados = res.data;
        } catch {
            /* ignore */
        } finally {
            buscandoProducto = false;
        }
    }

    function agregarItem(p: Producto) {
        if (items.find((i) => i.productoId === p.id)) {
            toastStore.advertencia("Producto ya agregado");
            return;
        }
        items = [
            ...items,
            {
                productoId: p.id,
                nombre: p.nombre,
                cantidad: 1,
                precioUnitario: p.precioCompra,
            },
        ];
        productosEncontrados = [];
        busquedaProducto = "";
    }

    function quitarItem(idx: number) {
        items = items.filter((_, i) => i !== idx);
    }

    async function crearOrden() {
        erroresOC = {};
        if (!proveedorId) erroresOC.proveedor = "Selecciona un proveedor";
        if (items.length === 0) erroresOC.items = "Agrega al menos un producto";
        const itemInvalido = items.find(
            (i) => i.cantidad < 1 || i.precioUnitario <= 0,
        );
        if (itemInvalido)
            erroresOC.items = "Cada ítem debe tener cantidad ≥ 1 y precio > 0";
        if (Object.keys(erroresOC).length > 0) return;
        creando = true;
        try {
            await comprasApi.ordenes.crear(
                {
                    proveedorId,
                    items: items.map((i) => ({
                        productoId: i.productoId,
                        cantidad: i.cantidad,
                        precioUnitario: i.precioUnitario,
                    })),
                    fechaEntrega: fechaEntrega || undefined,
                    observaciones: observaciones || undefined,
                },
                accessToken,
            );
            toastStore.exito("Orden de compra creada");
            modalCrear = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al crear orden");
        } finally {
            creando = false;
        }
    }

    async function anularOrden() {
        if (!ordenAnular || !motivoAnulacion.trim()) return;
        anulando = true;
        try {
            await comprasApi.ordenes.anular(
                ordenAnular.id,
                motivoAnulacion,
                accessToken,
            );
            toastStore.exito("Orden anulada");
            ordenAnular = null;
            motivoAnulacion = "";
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al anular");
        } finally {
            anulando = false;
        }
    }

    $: totalOC = items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
    $: opcionesProv = proveedores.map((p) => ({
        value: p.id,
        label: p.nombre,
    }));
</script>

<svelte:head><title>Órdenes de compra — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Órdenes de compra">
    <Button variant="primary" onclick={abrirCrear}>
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
        Nueva orden
    </Button>
</PageHeader>

<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchInput
            value={busqueda}
            placeholder="Buscar por N° orden..."
            on:search={(e) => {
                busqueda = e.detail;
                pagina = 1;
                cargar();
            }}
        />
    </div>
    <div class="w-44">
        <Select
            options={[
                { value: "", label: "Todos los estados" },
                { value: "borrador", label: "Borrador" },
                { value: "enviada", label: "Enviada" },
                { value: "parcial", label: "Parcial" },
                { value: "recibida", label: "Recibida" },
                { value: "anulada", label: "Anulada" },
            ]}
            bind:value={filtroEstado}
            on:change={() => {
                pagina = 1;
                cargar();
            }}
        />
    </div>
</div>

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if ordenes.length === 0}
    <EmptyState
        titulo="Sin órdenes"
        descripcion="No hay órdenes de compra"
        icono="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
    >
        <Button variant="primary" onclick={abrirCrear}>Crear orden</Button>
    </EmptyState>
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>N° Orden</th>
                    <th>Proveedor</th>
                    <th>Items</th>
                    <th class="text-right">Total</th>
                    <th>Estado</th>
                    <th>Fecha entrega</th>
                    <th>Creada</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each ordenes as o}
                    <tr class="hover:bg-gray-50">
                        <td class="font-mono text-xs font-semibold"
                            >{o.numero}</td
                        >
                        <td>{o.proveedorNombre}</td>
                        <td class="text-center">{o.items?.length ?? 0}</td>
                        <td class="text-right font-semibold"
                            >{formatCurrency(o.total)}</td
                        >
                        <td
                            ><Badge
                                variant={estadoColor[o.estado] ?? "gray"}
                                dot>{o.estado}</Badge
                            ></td
                        >
                        <td class="text-xs text-gray-400"
                            >{o.fechaEntrega
                                ? formatFechaHora(o.fechaEntrega)
                                : "—"}</td
                        >
                        <td class="text-xs text-gray-400"
                            >{formatFechaHora(o.createdAt)}</td
                        >
                        <td class="text-right">
                            <div class="flex items-center justify-end gap-2">
                                {#if o.estado === "enviada" || o.estado === "parcial"}
                                    <a
                                        href="/bodega/recepciones?ordenId={o.id}"
                                        class="text-xs text-primary-500 hover:underline"
                                        >Recibir</a
                                    >
                                {/if}
                                {#if o.estado !== "anulada" && o.estado !== "recibida"}
                                    <button
                                        onclick={() => {
                                            ordenAnular = o;
                                            motivoAnulacion = "";
                                        }}
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
    <Pagination {total} bind:currentPage={pagina} />
{/if}

<!-- Modal crear OC -->
<Modal bind:open={modalCrear} title="Nueva orden de compra" size="xl">
    <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Select
                    label="Proveedor"
                    options={opcionesProv}
                    bind:value={proveedorId}
                    required
                    placeholder="Seleccionar proveedor"
                />
                {#if erroresOC.proveedor}<p
                        class="text-xs text-danger-600 mt-1"
                    >
                        {erroresOC.proveedor}
                    </p>{/if}
            </div>
            <Input
                label="Fecha de entrega"
                type="date"
                bind:value={fechaEntrega}
            />
        </div>

        <!-- Buscar producto -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
                >Agregar productos</label
            >
            <div class="flex gap-2">
                <div class="flex-1">
                    <input
                        type="text"
                        class="input"
                        placeholder="Buscar producto por nombre o SKU..."
                        bind:value={busquedaProducto}
                        onkeydown={(e) => e.key === "Enter" && buscarProducto()}
                    />
                </div>
                <Button
                    variant="secondary"
                    onclick={buscarProducto}
                    loading={buscandoProducto}>Buscar</Button
                >
            </div>
            {#if productosEncontrados.length > 0}
                <div class="mt-2 border border-gray-200 rounded-lg divide-y">
                    {#each productosEncontrados as p}
                        <button
                            onclick={() => agregarItem(p)}
                            class="w-full px-3 py-2 text-left hover:bg-gray-50 flex justify-between items-center text-sm"
                        >
                            <span
                                >{p.nombre}
                                <span class="text-gray-400">({p.sku})</span
                                ></span
                            >
                            <span class="text-gray-500"
                                >{formatCurrency(p.precioCompra)}</span
                            >
                        </button>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Items -->
        {#if erroresOC.items}<p class="text-xs text-danger-600">
                {erroresOC.items}
            </p>{/if}
        {#if items.length > 0}
            <div class="border rounded-lg overflow-hidden">
                <table class="table w-full text-sm">
                    <thead
                        ><tr
                            ><th>Producto</th><th class="w-24">Cantidad</th><th
                                class="w-32">Precio</th
                            ><th class="text-right">Subtotal</th><th></th></tr
                        ></thead
                    >
                    <tbody>
                        {#each items as item, i}
                            <tr>
                                <td>{item.nombre}</td>
                                <td
                                    ><input
                                        type="number"
                                        min="1"
                                        bind:value={item.cantidad}
                                        class="input py-1 px-2 w-20"
                                    /></td
                                >
                                <td
                                    ><input
                                        type="number"
                                        step="0.01"
                                        bind:value={item.precioUnitario}
                                        class="input py-1 px-2 w-28"
                                    /></td
                                >
                                <td class="text-right font-semibold"
                                    >{formatCurrency(
                                        item.cantidad * item.precioUnitario,
                                    )}</td
                                >
                                <td
                                    ><button
                                        onclick={() => quitarItem(i)}
                                        class="text-danger-500 hover:text-danger-700"
                                        ><svg
                                            class="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            ><path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            /></svg
                                        ></button
                                    ></td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="px-4 py-2 bg-gray-50 text-right font-semibold">
                    Total: {formatCurrency(totalOC)}
                </div>
            </div>
        {/if}

        <Input
            label="Observaciones"
            bind:value={observaciones}
            placeholder="Notas adicionales (opcional)"
        />
    </div>
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalCrear = false)}
            >Cancelar</Button
        >
        <Button variant="primary" loading={creando} onclick={crearOrden}
            >Crear orden</Button
        >
    </svelte:fragment>
</Modal>

<!-- Modal anulación -->
{#if ordenAnular}
    <div
        class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4"
        >
            <h2 class="text-base font-semibold">
                Anular orden {ordenAnular.numero}
            </h2>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Motivo <span class="text-danger-400">*</span></label
                >
                <textarea
                    bind:value={motivoAnulacion}
                    rows="2"
                    class="input resize-none"
                />
            </div>
            <div class="flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (ordenAnular = null)}>Cancelar</Button
                >
                <Button
                    variant="danger"
                    fullWidth
                    loading={anulando}
                    disabled={!motivoAnulacion.trim()}
                    onclick={anularOrden}>Anular</Button
                >
            </div>
        </div>
    </div>
{/if}
