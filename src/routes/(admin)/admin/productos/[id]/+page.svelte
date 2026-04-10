<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import ProductoForm from "$components/admin/ProductoForm.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import { productosApi } from "$api/productos";
    import { categoriasApi } from "$api/categorias";
    import { toastStore } from "$stores/toast.store";
    import type { Producto, Categoria } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let producto: Producto | null = null;
    let categorias: Categoria[] = [];
    let cargando = true;
    let guardando = false;

    $: id = $page.params.id;

    onMount(async () => {
        try {
            const [p, cats] = await Promise.all([
                productosApi.obtener(id, true, accessToken),
                categoriasApi.arbol(accessToken),
            ]);
            producto = p;
            categorias = cats;
        } catch (e: any) {
            toastStore.error("Producto no encontrado");
            goto("/admin/productos");
        } finally {
            cargando = false;
        }
    });

    async function guardar(e: CustomEvent<Partial<Producto>>) {
        guardando = true;
        try {
            await productosApi.actualizar(id, e.detail, accessToken);
            toastStore.exito("Producto actualizado");
            goto("/admin/productos");
        } catch (err: any) {
            toastStore.error(err?.mensajes?.[0] ?? "Error al actualizar");
        } finally {
            guardando = false;
        }
    }
</script>

<svelte:head><title>Editar producto — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Editar producto" />

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if producto}
    <div class="card max-w-3xl">
        <div class="card-body">
            <ProductoForm
                {producto}
                {categorias}
                {guardando}
                modo="editar"
                on:guardar={guardar}
                on:cancelar={() => goto("/admin/productos")}
            />
        </div>
    </div>

    <!-- Stock por bodega -->
    {#if producto.stock && producto.stock.length > 0}
        <div class="card max-w-3xl mt-6">
            <div class="card-header">Stock por bodega</div>
            <div class="card-body p-0">
                <table class="table w-full text-sm">
                    <thead>
                        <tr>
                            <th>Bodega</th>
                            <th class="text-right">Cantidad</th>
                            <th class="text-right">Reservada</th>
                            <th class="text-right">Disponible</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each producto.stock as s}
                            <tr>
                                <td>{s.bodegaNombre}</td>
                                <td class="text-right">{s.cantidad}</td>
                                <td class="text-right">{s.cantidadReservada}</td
                                >
                                <td class="text-right font-semibold"
                                    >{s.cantidadDisponible}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
{/if}
