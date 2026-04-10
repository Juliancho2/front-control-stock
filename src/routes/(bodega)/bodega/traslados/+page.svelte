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
    import { inventarioApi } from "$api/inventario";
    import { bodegasApi } from "$api/bodegas";
    import { productosApi } from "$api/productos";
    import { toastStore } from "$stores/toast.store";
    import { formatFechaHora } from "$utils/index";
    import type { MovimientoInventario, Bodega, Producto } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let movimientos: MovimientoInventario[] = [];
    let total = 0;
    let cargando = true;
    let pagina = 1;
    let busqueda = "";

    // Crear traslado
    let modalCrear = false;
    let bodegas: Bodega[] = [];
    let bodegaOrigenId = "";
    let bodegaDestinoId = "";
    let productoId = "";
    let productoNombre = "";
    let cantidad = 1;
    let motivo = "";
    let creando = false;

    // Buscar producto
    let busquedaProducto = "";
    let productosEncontrados: Producto[] = [];
    let buscandoProducto = false;

    async function cargar() {
        cargando = true;
        try {
            const filtros: Record<string, string> = {
                page: String(pagina),
                limit: "20",
                tipo: "traslado_entrada",
            };
            if (busqueda) filtros.q = busqueda;
            const res = await inventarioApi.movimientos(filtros, accessToken);
            movimientos = res.data;
            total = res.total;
        } catch {
            toastStore.error("Error al cargar traslados");
        } finally {
            cargando = false;
        }
    }

    onMount(async () => {
        try {
            const res = await bodegasApi.listar({ limit: "100" }, accessToken);
            bodegas = res.data;
        } catch {
            /* ignore */
        }
        cargar();
    });

    function abrirCrear() {
        bodegaOrigenId = "";
        bodegaDestinoId = "";
        productoId = "";
        productoNombre = "";
        cantidad = 1;
        motivo = "";
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

    function seleccionarProducto(p: Producto) {
        productoId = p.id;
        productoNombre = `${p.nombre} (${p.sku})`;
        productosEncontrados = [];
        busquedaProducto = "";
    }

    async function crearTraslado() {
        if (!productoId || !bodegaOrigenId || !bodegaDestinoId) {
            toastStore.error("Completa todos los campos requeridos");
            return;
        }
        if (bodegaOrigenId === bodegaDestinoId) {
            toastStore.error(
                "Las bodegas origen y destino deben ser diferentes",
            );
            return;
        }
        if (cantidad < 1) {
            toastStore.error("Cantidad mínima: 1");
            return;
        }
        creando = true;
        try {
            await inventarioApi.trasladar(
                {
                    productoId,
                    bodegaOrigenId,
                    bodegaDestinoId,
                    cantidad,
                    motivo: motivo || undefined,
                },
                accessToken,
            );
            toastStore.exito("Traslado realizado correctamente");
            modalCrear = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al realizar traslado");
        } finally {
            creando = false;
        }
    }

    $: opcionesBodegas = bodegas.map((b) => ({ value: b.id, label: b.nombre }));

    const tipoBadge: Record<string, "green" | "blue"> = {
        traslado_entrada: "green",
        traslado_salida: "blue",
    };
</script>

<svelte:head><title>Traslados — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Traslados entre bodegas">
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
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            />
        </svg>
        Nuevo traslado
    </Button>
</PageHeader>

<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchInput
            value={busqueda}
            placeholder="Buscar por producto..."
            on:search={(e) => {
                busqueda = e.detail;
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
{:else if movimientos.length === 0}
    <EmptyState
        titulo="Sin traslados"
        descripcion="No se han registrado traslados"
        icono="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
    >
        <Button variant="primary" onclick={abrirCrear}>Crear traslado</Button>
    </EmptyState>
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Bodega</th>
                    <th class="text-center">Cantidad</th>
                    <th class="text-center">Stock result.</th>
                    <th>Motivo</th>
                    <th>Fecha</th>
                    <th>Usuario</th>
                </tr>
            </thead>
            <tbody>
                {#each movimientos as m}
                    <tr class="hover:bg-gray-50">
                        <td class="font-medium">{m.productoNombre}</td>
                        <td
                            ><Badge variant={tipoBadge[m.tipo] ?? "gray"}
                                >{m.tipo.replace("traslado_", "")}</Badge
                            ></td
                        >
                        <td>{m.bodegaNombre}</td>
                        <td class="text-center font-semibold">
                            <span
                                class={m.tipo === "traslado_entrada"
                                    ? "text-success-600"
                                    : "text-blue-600"}
                            >
                                {m.tipo === "traslado_entrada"
                                    ? "+"
                                    : "-"}{m.cantidad}
                            </span>
                        </td>
                        <td class="text-center">{m.stockResultante}</td>
                        <td class="text-xs text-gray-500 max-w-[200px] truncate"
                            >{m.motivo ?? "—"}</td
                        >
                        <td class="text-xs text-gray-400"
                            >{formatFechaHora(m.createdAt)}</td
                        >
                        <td class="text-xs">{m.usuarioNombre}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <Pagination {total} bind:currentPage={pagina} />
{/if}

<!-- Modal nuevo traslado -->
<Modal bind:open={modalCrear} title="Nuevo traslado" size="lg">
    <div class="space-y-4">
        <!-- Producto -->
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
                >Producto <span class="text-danger-400">*</span></label
            >
            {#if productoId}
                <div
                    class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                    <span class="flex-1 text-sm font-medium"
                        >{productoNombre}</span
                    >
                    <button
                        onclick={() => {
                            productoId = "";
                            productoNombre = "";
                        }}
                        class="text-gray-400 hover:text-gray-600"
                    >
                        <svg
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
                        >
                    </button>
                </div>
            {:else}
                <div class="flex gap-2">
                    <input
                        type="text"
                        class="input flex-1"
                        placeholder="Buscar producto..."
                        bind:value={busquedaProducto}
                        onkeydown={(e) => e.key === "Enter" && buscarProducto()}
                    />
                    <Button
                        variant="secondary"
                        onclick={buscarProducto}
                        loading={buscandoProducto}>Buscar</Button
                    >
                </div>
                {#if productosEncontrados.length > 0}
                    <div
                        class="mt-1 border border-gray-200 rounded-lg divide-y"
                    >
                        {#each productosEncontrados as p}
                            <button
                                onclick={() => seleccionarProducto(p)}
                                class="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm"
                            >
                                {p.nombre}
                                <span class="text-gray-400">({p.sku})</span>
                            </button>
                        {/each}
                    </div>
                {/if}
            {/if}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
                label="Bodega origen"
                options={opcionesBodegas}
                bind:value={bodegaOrigenId}
                required
                placeholder="Seleccionar origen"
            />
            <Select
                label="Bodega destino"
                options={opcionesBodegas}
                bind:value={bodegaDestinoId}
                required
                placeholder="Seleccionar destino"
            />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="Cantidad"
                type="number"
                bind:value={cantidad}
                min={1}
                required
            />
            <Input label="Motivo" bind:value={motivo} placeholder="Opcional" />
        </div>
    </div>
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalCrear = false)}
            >Cancelar</Button
        >
        <Button variant="primary" loading={creando} onclick={crearTraslado}
            >Realizar traslado</Button
        >
    </svelte:fragment>
</Modal>
