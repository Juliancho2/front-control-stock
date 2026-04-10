<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Select from "$components/ui/Select.svelte";
    import Button from "$components/ui/Button.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import { inventarioApi } from "$api/inventario";
    import { bodegasApi } from "$api/bodegas";
    import { toastStore } from "$stores/toast.store";
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type {
        StockItem,
        MovimientoInventario,
        Bodega,
        ResumenStock,
    } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let tab: "stock" | "movimientos" = "stock";

    // Stock
    let stock: StockItem[] = [];
    let totalStock = 0;
    let cargandoStock = true;
    let busqueda = "";
    let bodegaFiltro = "";
    let soloStockBajo = false;
    let pagina = 1;
    let resumen: ResumenStock | null = null;

    // Movimientos
    let movimientos: MovimientoInventario[] = [];
    let totalMov = 0;
    let cargandoMov = false;
    let paginaMov = 1;

    // Bodegas
    let bodegas: Bodega[] = [];

    // Ajuste
    let modalAjuste = false;
    let ajusteItem: StockItem | null = null;
    let cantidadNueva = 0;
    let motivoAjuste = "";
    let ajustando = false;

    async function cargarStock() {
        cargandoStock = true;
        try {
            const filtros: Record<string, string> = {
                page: String(pagina),
                limit: "20",
            };
            if (busqueda) filtros.q = busqueda;
            if (bodegaFiltro) filtros.bodegaId = bodegaFiltro;
            if (soloStockBajo) filtros.stockBajo = "true";
            const [res, r] = await Promise.all([
                inventarioApi.stock(filtros, accessToken),
                inventarioApi.resumen(accessToken),
            ]);
            stock = res.data;
            totalStock = res.total;
            resumen = r;
        } catch {
            toastStore.error("Error al cargar inventario");
        } finally {
            cargandoStock = false;
        }
    }

    async function cargarMovimientos() {
        cargandoMov = true;
        try {
            const filtros: Record<string, string> = {
                page: String(paginaMov),
                limit: "20",
            };
            const res = await inventarioApi.movimientos(filtros, accessToken);
            movimientos = res.data;
            totalMov = res.total;
        } catch {
            toastStore.error("Error al cargar movimientos");
        } finally {
            cargandoMov = false;
        }
    }

    onMount(async () => {
        try {
            const res = await bodegasApi.listar({ limit: "100" }, accessToken);
            bodegas = res.data;
        } catch {
            /* ignore */
        }
        cargarStock();
    });

    function abrirAjuste(item: StockItem) {
        ajusteItem = item;
        cantidadNueva = item.cantidad;
        motivoAjuste = "";
        modalAjuste = true;
    }

    async function realizarAjuste() {
        if (!ajusteItem || !motivoAjuste.trim()) return;
        ajustando = true;
        try {
            await inventarioApi.ajustar(
                {
                    productoId: ajusteItem.productoId,
                    bodegaId: ajusteItem.bodegaId,
                    cantidadNueva,
                    motivo: motivoAjuste.trim(),
                },
                accessToken,
            );
            toastStore.exito("Ajuste realizado");
            modalAjuste = false;
            cargarStock();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al ajustar");
        } finally {
            ajustando = false;
        }
    }

    $: opcionesBodega = [
        { value: "", label: "Todas las bodegas" },
        ...bodegas.map((b) => ({ value: b.id, label: b.nombre })),
    ];

    const tipoMovColor: Record<
        string,
        "green" | "red" | "yellow" | "blue" | "gray"
    > = {
        entrada: "green",
        salida: "red",
        ajuste_positivo: "green",
        ajuste_negativo: "red",
        traslado_entrada: "blue",
        traslado_salida: "blue",
        devolucion_compra: "yellow",
        devolucion_venta: "yellow",
    };
</script>

<svelte:head><title>Inventario — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Inventario" />

<!-- Resumen KPIs -->
{#if resumen}
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="card">
            <div class="card-body py-3 text-center">
                <p class="text-xs text-gray-500">Total productos</p>
                <p class="text-xl font-bold">{resumen.totalProductos}</p>
            </div>
        </div>
        <div class="card">
            <div class="card-body py-3 text-center">
                <p class="text-xs text-gray-500">Stock bajo</p>
                <p class="text-xl font-bold text-warning-600">
                    {resumen.productosConStockBajo}
                </p>
            </div>
        </div>
        <div class="card">
            <div class="card-body py-3 text-center">
                <p class="text-xs text-gray-500">Sin stock</p>
                <p class="text-xl font-bold text-danger-600">
                    {resumen.productosSinStock}
                </p>
            </div>
        </div>
        <div class="card">
            <div class="card-body py-3 text-center">
                <p class="text-xs text-gray-500">Valor inventario</p>
                <p class="text-xl font-bold">
                    {formatCurrency(resumen.valorTotalInventario)}
                </p>
            </div>
        </div>
    </div>
{/if}

<!-- Tabs -->
<div class="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-4">
    <button
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors {tab ===
        'stock'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'}"
        onclick={() => {
            tab = "stock";
            cargarStock();
        }}
    >
        Stock actual
    </button>
    <button
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors {tab ===
        'movimientos'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'}"
        onclick={() => {
            tab = "movimientos";
            cargarMovimientos();
        }}
    >
        Movimientos
    </button>
</div>

{#if tab === "stock"}
    <!-- Filtros -->
    <div class="flex flex-wrap items-end gap-3 mb-4">
        <div class="flex-1 min-w-[200px] max-w-sm">
            <SearchInput
                value={busqueda}
                placeholder="Buscar producto..."
                on:search={(e) => {
                    busqueda = e.detail;
                    pagina = 1;
                    cargarStock();
                }}
            />
        </div>
        <div class="w-48">
            <Select
                options={opcionesBodega}
                bind:value={bodegaFiltro}
                on:change={() => {
                    pagina = 1;
                    cargarStock();
                }}
            />
        </div>
        <button
            class="px-3 py-2 text-sm rounded-lg border transition-colors {soloStockBajo
                ? 'bg-warning-50 border-warning-300 text-warning-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'}"
            onclick={() => {
                soloStockBajo = !soloStockBajo;
                pagina = 1;
                cargarStock();
            }}
        >
            Stock bajo
        </button>
    </div>

    {#if cargandoStock}
        <div class="flex items-center justify-center py-20">
            <Spinner size="lg" />
        </div>
    {:else if stock.length === 0}
        <EmptyState
            titulo="Sin resultados"
            descripcion="No se encontró stock con los filtros aplicados"
            icono="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
    {:else}
        <div class="table-container">
            <table class="table w-full text-sm">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Producto</th>
                        <th>Bodega</th>
                        <th class="text-right">Cantidad</th>
                        <th class="text-right">Reservada</th>
                        <th class="text-right">Disponible</th>
                        <th class="text-center">Stock Mín.</th>
                        <th>Estado</th>
                        <th class="text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {#each stock as s}
                        <tr class="hover:bg-gray-50">
                            <td class="font-mono text-xs">{s.productoSku}</td>
                            <td class="font-medium text-gray-900"
                                >{s.productoNombre}</td
                            >
                            <td class="text-gray-500">{s.bodegaNombre}</td>
                            <td class="text-right">{s.cantidad}</td>
                            <td class="text-right text-gray-400"
                                >{s.cantidadReservada}</td
                            >
                            <td class="text-right font-semibold"
                                >{s.cantidadDisponible}</td
                            >
                            <td class="text-center">{s.stockMinimo}</td>
                            <td>
                                {#if s.cantidadDisponible <= 0}
                                    <Badge variant="red" dot>Sin stock</Badge>
                                {:else if s.enStockBajo}
                                    <Badge variant="yellow" dot>Bajo</Badge>
                                {:else}
                                    <Badge variant="green" dot>OK</Badge>
                                {/if}
                            </td>
                            <td class="text-right">
                                <button
                                    onclick={() => abrirAjuste(s)}
                                    class="text-xs text-primary-500 hover:underline"
                                    >Ajustar</button
                                >
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <Pagination total={totalStock} bind:currentPage={pagina} />
    {/if}
{:else}
    <!-- Movimientos -->
    {#if cargandoMov}
        <div class="flex items-center justify-center py-20">
            <Spinner size="lg" />
        </div>
    {:else if movimientos.length === 0}
        <EmptyState
            titulo="Sin movimientos"
            descripcion="No hay movimientos de inventario registrados"
            icono="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
    {:else}
        <div class="table-container">
            <table class="table w-full text-sm">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Producto</th>
                        <th>Bodega</th>
                        <th class="text-right">Cantidad</th>
                        <th class="text-right">Stock result.</th>
                        <th>Motivo</th>
                        <th>Usuario</th>
                    </tr>
                </thead>
                <tbody>
                    {#each movimientos as m}
                        <tr class="hover:bg-gray-50">
                            <td class="text-xs text-gray-400"
                                >{formatFechaHora(m.createdAt)}</td
                            >
                            <td
                                ><Badge variant={tipoMovColor[m.tipo] ?? "gray"}
                                    >{m.tipo.replace(/_/g, " ")}</Badge
                                ></td
                            >
                            <td class="font-medium">{m.productoNombre}</td>
                            <td class="text-gray-500">{m.bodegaNombre}</td>
                            <td
                                class="text-right font-semibold {m.tipo.includes(
                                    'salida',
                                ) || m.tipo.includes('negativo')
                                    ? 'text-danger-600'
                                    : 'text-primary-600'}"
                            >
                                {m.tipo.includes("salida") ||
                                m.tipo.includes("negativo")
                                    ? "-"
                                    : "+"}{m.cantidad}
                            </td>
                            <td class="text-right">{m.stockResultante}</td>
                            <td class="text-xs text-gray-400 max-w-xs truncate"
                                >{m.motivo ?? "—"}</td
                            >
                            <td class="text-xs">{m.usuarioNombre}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <Pagination total={totalMov} bind:currentPage={paginaMov} />
    {/if}
{/if}

<!-- Modal ajuste de inventario -->
<Modal bind:open={modalAjuste} title="Ajustar inventario" size="sm">
    {#if ajusteItem}
        <div class="space-y-4">
            <div class="bg-gray-50 rounded-xl p-3">
                <p class="text-sm font-medium">{ajusteItem.productoNombre}</p>
                <p class="text-xs text-gray-400">
                    {ajusteItem.productoSku} — {ajusteItem.bodegaNombre}
                </p>
                <p class="text-sm mt-1">
                    Stock actual: <strong>{ajusteItem.cantidad}</strong>
                </p>
            </div>
            <Input
                label="Nueva cantidad"
                type="number"
                bind:value={cantidadNueva}
                hint="La diferencia se registrará como ajuste"
            />
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Motivo <span class="text-danger-400">*</span></label
                >
                <textarea
                    bind:value={motivoAjuste}
                    rows="2"
                    class="input resize-none"
                    placeholder="Razón del ajuste..."
                />
            </div>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalAjuste = false)}
            >Cancelar</Button
        >
        <Button
            variant="primary"
            loading={ajustando}
            disabled={!motivoAjuste.trim()}
            onclick={realizarAjuste}>Confirmar ajuste</Button
        >
    </svelte:fragment>
</Modal>
