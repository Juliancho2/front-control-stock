<script lang="ts">
    import { goto } from "$app/navigation";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import ProductoForm from "$components/admin/ProductoForm.svelte";
    import { productosApi } from "$api/productos";
    import { categoriasApi } from "$api/categorias";
    import { toastStore } from "$stores/toast.store";
    import type { Producto, Categoria } from "$types/index";
    import { onMount } from "svelte";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let categorias: Categoria[] = [];
    let guardando = false;

    onMount(async () => {
        try {
            categorias = await categoriasApi.arbol(accessToken);
        } catch {
            /* ignore */
        }
    });

    async function crear(e: CustomEvent<Partial<Producto>>) {
        guardando = true;
        try {
            const p = await productosApi.crear(e.detail, accessToken);
            toastStore.exito(`Producto "${p.nombre}" creado`);
            goto("/admin/productos");
        } catch (err: any) {
            toastStore.error(err?.mensajes?.[0] ?? "Error al crear producto");
        } finally {
            guardando = false;
        }
    }
</script>

<svelte:head><title>Nuevo producto — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Nuevo producto" />

<div class="card max-w-3xl">
    <div class="card-body">
        <ProductoForm
            {categorias}
            {guardando}
            modo="crear"
            on:guardar={crear}
            on:cancelar={() => goto("/admin/productos")}
        />
    </div>
</div>
