<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Button from "$components/ui/Button.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Select from "$components/ui/Select.svelte";
    import ConfirmDialog from "$components/ui/ConfirmDialog.svelte";
    import { productosApi, type FiltroProductos } from "$api/productos";
    import { categoriasApi } from "$api/categorias";
    import { toastStore } from "$stores/toast.store";
    import { permiteExcel } from "$stores/auth.store";
    import { formatCurrency } from "$utils/index";
    import type { Producto, Categoria } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let productos: Producto[] = [];
    let total = 0;
    let cargando = true;
    let categorias: Categoria[] = [];

    let busqueda = $page.url.searchParams.get("q") ?? "";
    let categoriaId = $page.url.searchParams.get("categoriaId") ?? "";
    let soloStockBajo = $page.url.searchParams.get("stockBajo") === "true";
    let pagina = Number($page.url.searchParams.get("page") ?? 1);

    let productoEliminar: Producto | null = null;
    let eliminando = false;
    let exportando = false;

    let seleccionados = new Set<string>();
    let confirmandoMasivo = false;

    async function exportar() {
        exportando = true;
        try {
            await productosApi.exportar(accessToken);
            toastStore.exito("Archivo generado correctamente");
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al exportar productos");
        } finally {
            exportando = false;
        }
    }

    async function cargar() {
        cargando = true;
        try {
            const filtros: FiltroProductos = { page: pagina, limit: 10 };
            if (busqueda) filtros.q = busqueda;
            if (categoriaId) filtros.categoriaId = categoriaId;
            if (soloStockBajo) filtros.stockBajo = true;
            const res = await productosApi.listar(filtros, accessToken);

            productos = res.data;
            total = res.total;
            seleccionados.clear();
            seleccionados = seleccionados;
        } catch {
            toastStore.error("Error al cargar productos");
        } finally {
            cargando = false;
        }
    }

    onMount(async () => {
        try {
            const arbol = await categoriasApi.arbol(accessToken);
            categorias = arbol;
        } catch {
            /* ignore */
        }
        cargar();
    });

    function buscar(e: CustomEvent<string>) {
        busqueda = e.detail;
        pagina = 1;
        cargar();
    }

    function filtrarCategoria() {
        pagina = 1;
        cargar();
    }

    function toggleStockBajo() {
        soloStockBajo = !soloStockBajo;
        pagina = 1;
        cargar();
    }

    function toggleSeleccion(id: string) {
        if (seleccionados.has(id)) {
            seleccionados.delete(id);
        } else {
            seleccionados.add(id);
        }
        seleccionados = seleccionados;
    }

    function toggleTodos() {
        if (seleccionados.size === productos.length) {
            seleccionados.clear();
        } else {
            productos.forEach((p) => seleccionados.add(p.id));
        }
        seleccionados = seleccionados;
    }

    async function eliminar() {
        if (!productoEliminar) return;
        eliminando = true;
        try {
            await productosApi.eliminar(productoEliminar.id, accessToken);
            toastStore.exito("Producto eliminado");
            productoEliminar = null;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al eliminar");
        } finally {
            eliminando = false;
        }
    }

    async function eliminarMasivo() {
        if (seleccionados.size === 0) return;
        eliminando = true;
        try {
            await productosApi.eliminarMultiple(
                Array.from(seleccionados),
                accessToken,
            );
            toastStore.exito(`${seleccionados.size} productos eliminados`);
            seleccionados.clear();
            seleccionados = seleccionados;
            confirmandoMasivo = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al eliminar");
        } finally {
            eliminando = false;
        }
    }

    $: opcionesCat = categorias.map((c) => ({ value: c.id, label: c.nombre }));

    $: if (pagina) {
        cargar();
    }
</script>

<svelte:head><title>Productos — FerreControl</title></svelte:head>

<PageHeader titulo="Productos">
    <div class="flex gap-2">
        {#if $permiteExcel}
            <Button
                variant="secondary"
                onclick={exportar}
                loading={exportando}
                title="Exportar Excel"
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                Exportar
            </Button>
        {/if}
        <Button
            variant="secondary"
            href="/admin/productos/importar"
            title="Importar CSV"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
            </svg>
            Importar
        </Button>
        <Button variant="primary" href="/admin/productos/nuevo">
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
            Nuevo producto
        </Button>
    </div>
</PageHeader>

<!-- Filtros -->
<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchInput
            value={busqueda}
            placeholder="Buscar por nombre o SKU..."
            on:search={buscar}
        />
    </div>
    <div class="w-48">
        <Select
            placeholder="Todas las categorías"
            options={[
                { value: "", label: "Todas las categorías" },
                ...opcionesCat,
            ]}
            bind:value={categoriaId}
            on:change={filtrarCategoria}
        />
    </div>
    <button
        class="px-3 py-2 text-sm rounded-lg border transition-colors {soloStockBajo
            ? 'bg-warning-50 border-warning-300 text-warning-700'
            : 'border-gray-300 text-gray-600 hover:bg-gray-50'}"
        onclick={toggleStockBajo}
    >
        Stock bajo
    </button>

    {#if seleccionados.size > 0}
        <div
            class="ml-auto flex items-center gap-2 animate-in fade-in slide-in-from-right-2"
        >
            <span class="text-sm font-medium text-gray-500">
                {seleccionados.size} seleccionados
            </span>
            <Button
                variant="danger"
                size="sm"
                onclick={() => (confirmandoMasivo = true)}
            >
                Eliminar seleccionados
            </Button>
        </div>
    {/if}
</div>

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if productos.length === 0}
    <EmptyState
        titulo="Sin productos"
        descripcion="No se encontraron productos con los filtros aplicados"
        icono="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    >
        <Button variant="primary" href="/admin/productos/nuevo"
            >Crear producto</Button
        >
    </EmptyState>
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th class="w-10">
                        <input
                            type="checkbox"
                            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={seleccionados.size === productos.length &&
                                productos.length > 0}
                            onchange={toggleTodos}
                        />
                    </th>
                    <th>SKU</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th class="text-right">P. Compra</th>
                    <th class="text-right">P. Venta</th>
                    <th class="text-center">Stock Mín.</th>
                    <th>Estado</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each productos as p}
                    <tr
                        class="hover:bg-gray-50 {seleccionados.has(p.id)
                            ? 'bg-primary-50/30'
                            : ''}"
                    >
                        <td class="w-10">
                            <input
                                type="checkbox"
                                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                checked={seleccionados.has(p.id)}
                                onchange={() => toggleSeleccion(p.id)}
                            />
                        </td>
                        <td class="font-mono text-xs">{p.sku}</td>
                        <td>
                            <p class="font-medium text-gray-900">{p.nombre}</p>
                            {#if p.descripcion}
                                <p
                                    class="text-xs text-gray-400 truncate max-w-xs"
                                >
                                    {p.descripcion}
                                </p>
                            {/if}
                        </td>
                        <td class="text-gray-500"
                            >{p.categoria?.nombre ?? "—"}</td
                        >
                        <td class="text-right"
                            >{formatCurrency(p.precioCompra)}</td
                        >
                        <td class="text-right font-semibold"
                            >{formatCurrency(p.precioVenta)}</td
                        >
                        <td class="text-center">{p.stockMinimo}</td>
                        <td>
                            <Badge variant={p.activo ? "green" : "red"} dot>
                                {p.activo ? "Activo" : "Inactivo"}
                            </Badge>
                        </td>
                        <td class="text-right">
                            <div class="flex items-center justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    href={`/admin/productos/${p.id}`}
                                    >Editar</Button
                                >
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onclick={() => (productoEliminar = p)}
                                    >Eliminar</Button
                                >
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <Pagination {total} bind:currentPage={pagina} limit={10} />
{/if}

<ConfirmDialog
    open={!!productoEliminar}
    titulo="Eliminar producto"
    mensaje="¿Deseas eliminar {productoEliminar?.nombre ??
        'este producto'}? Esta acción desactiva el producto."
    labelConfirmar="Eliminar"
    cargando={eliminando}
    on:confirmar={eliminar}
    on:cancelar={() => (productoEliminar = null)}
/>

<ConfirmDialog
    open={confirmandoMasivo}
    titulo="Eliminar productos seleccionados"
    mensaje="¿Estás seguro de que deseas eliminar los {seleccionados.size} productos seleccionados? Esta acción los desactivará del sistema."
    labelConfirmar="Eliminar todos"
    variant="danger"
    cargando={eliminando}
    on:confirmar={eliminarMasivo}
    on:cancelar={() => (confirmandoMasivo = false)}
/>
