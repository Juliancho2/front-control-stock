<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Button from "$components/ui/Button.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import Select from "$components/ui/Select.svelte";
    import ConfirmDialog from "$components/ui/Confirmdialog.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import { categoriasApi } from "$api/categorias";
    import { toastStore } from "$stores/toast.store";
    import type { Categoria } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let categorias: Categoria[] = [];
    let cargando = true;

    // Modal
    let modalAbierto = false;
    let editando: Categoria | null = null;
    let guardando = false;
    let form = resetForm();
    let errores: Record<string, string> = {};

    // Eliminar
    let categoriaEliminar: Categoria | null = null;
    let eliminando = false;

    // Expandidos
    let expandidos: Set<string> = new Set();

    function resetForm() {
        return { nombre: "", parentId: "" as string };
    }

    async function cargar() {
        cargando = true;
        try {
            categorias = await categoriasApi.arbol(accessToken);
        } catch {
            toastStore.error("Error al cargar categorías");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function abrirCrear(parentId?: string) {
        editando = null;
        form = resetForm();
        if (parentId) form.parentId = parentId;
        modalAbierto = true;
    }

    function abrirEditar(c: Categoria) {
        editando = c;
        form = { nombre: c.nombre, parentId: c.parentId ?? "" };
        modalAbierto = true;
    }

    async function guardar() {
        errores = {};
        if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio";
        else if (form.nombre.trim().length < 2)
            errores.nombre = "Mínimo 2 caracteres";
        if (Object.keys(errores).length > 0) return;
        guardando = true;
        try {
            const payload = {
                nombre: form.nombre.trim(),
                parentId: form.parentId || null,
            };
            if (editando) {
                await categoriasApi.actualizar(
                    editando.id,
                    payload,
                    accessToken,
                );
                toastStore.exito("Categoría actualizada");
            } else {
                await categoriasApi.crear(payload, accessToken);
                toastStore.exito("Categoría creada");
            }
            modalAbierto = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al guardar");
        } finally {
            guardando = false;
        }
    }

    async function eliminar() {
        if (!categoriaEliminar) return;
        eliminando = true;
        try {
            await categoriasApi.eliminar(categoriaEliminar.id, accessToken);
            toastStore.exito("Categoría eliminada");
            categoriaEliminar = null;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al eliminar");
        } finally {
            eliminando = false;
        }
    }

    function toggleExpand(id: string) {
        if (expandidos.has(id)) expandidos.delete(id);
        else expandidos.add(id);
        expandidos = new Set(expandidos);
    }

    // Flatten for parent select (exclude current)
    function flatCategorias(
        cats: Categoria[],
        excluir?: string,
    ): { value: string; label: string }[] {
        const result: { value: string; label: string }[] = [];
        function walk(items: Categoria[], prefix = "") {
            for (const c of items) {
                if (c.id !== excluir) {
                    result.push({ value: c.id, label: prefix + c.nombre });
                    if (c.subcategorias) walk(c.subcategorias, prefix + "— ");
                }
            }
        }
        walk(cats);
        return result;
    }

    $: opcionesPadre = [
        { value: "", label: "Sin categoría padre" },
        ...flatCategorias(categorias, editando?.id),
    ];
</script>

<svelte:head><title>Categorías — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Categorías">
    <Button variant="primary" onclick={() => abrirCrear()}>
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
        Nueva categoría
    </Button>
</PageHeader>

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if categorias.length === 0}
    <EmptyState
        titulo="Sin categorías"
        descripcion="Crea tu primera categoría de productos"
        icono="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    >
        <Button variant="primary" onclick={() => abrirCrear()}
            >Crear categoría</Button
        >
    </EmptyState>
{:else}
    <div class="card">
        <div class="card-body p-0">
            {#each categorias as cat}
                {@const tieneHijos =
                    cat.subcategorias && cat.subcategorias.length > 0}
                {@const estaExpandido = expandidos.has(cat.id)}
                <div class="border-b border-gray-100 last:border-b-0">
                    <!-- Nivel 1 -->
                    <div
                        class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                    >
                        <button
                            class="w-5 h-5 flex items-center justify-center text-gray-400 {tieneHijos
                                ? ''
                                : 'invisible'}"
                            onclick={() => toggleExpand(cat.id)}
                        >
                            <svg
                                class="w-4 h-4 transition-transform {estaExpandido
                                    ? 'rotate-90'
                                    : ''}"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </button>
                        <div class="flex-1 min-w-0">
                            <span class="text-sm font-medium text-gray-900"
                                >{cat.nombre}</span
                            >
                            {#if !cat.activo}<Badge variant="red" dot
                                    >Inactivo</Badge
                                >{/if}
                        </div>
                        <div class="flex items-center gap-2">
                            <button
                                onclick={() => abrirCrear(cat.id)}
                                class="text-xs text-gray-400 hover:text-primary-500"
                                title="Agregar subcategoría"
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
                                        d="M12 4v16m8-8H4"
                                    /></svg
                                >
                            </button>
                            <button
                                onclick={() => abrirEditar(cat)}
                                class="text-xs text-primary-500 hover:underline"
                                >Editar</button
                            >
                            <button
                                onclick={() => (categoriaEliminar = cat)}
                                class="text-xs text-danger-500 hover:underline"
                                >Eliminar</button
                            >
                        </div>
                    </div>

                    <!-- Nivel 2 (subcategorías) -->
                    {#if tieneHijos && estaExpandido}
                        {#each cat.subcategorias ?? [] as sub}
                            <div
                                class="flex items-center gap-3 px-4 py-2.5 pl-12 hover:bg-gray-50 bg-gray-50/50"
                            >
                                <svg
                                    class="w-4 h-4 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <span class="text-sm text-gray-700"
                                        >{sub.nombre}</span
                                    >
                                    {#if !sub.activo}<Badge variant="red" dot
                                            >Inactivo</Badge
                                        >{/if}
                                </div>
                                <div class="flex items-center gap-2">
                                    <button
                                        onclick={() => abrirEditar(sub)}
                                        class="text-xs text-primary-500 hover:underline"
                                        >Editar</button
                                    >
                                    <button
                                        onclick={() =>
                                            (categoriaEliminar = sub)}
                                        class="text-xs text-danger-500 hover:underline"
                                        >Eliminar</button
                                    >
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            {/each}
        </div>
    </div>
{/if}

<!-- Modal crear/editar -->
<Modal
    bind:open={modalAbierto}
    title={editando ? "Editar categoría" : "Nueva categoría"}
    size="sm"
>
    <div class="space-y-4">
        <Input
            label="Nombre"
            bind:value={form.nombre}
            error={errores.nombre}
            required
            placeholder="Herramientas manuales"
        />
        <Select
            label="Categoría padre"
            options={opcionesPadre}
            bind:value={form.parentId}
        />
    </div>
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalAbierto = false)}
            >Cancelar</Button
        >
        <Button variant="primary" loading={guardando} onclick={guardar}>
            {editando ? "Guardar" : "Crear"}
        </Button>
    </svelte:fragment>
</Modal>

<ConfirmDialog
    open={!!categoriaEliminar}
    titulo="Eliminar categoría"
    mensaje="¿Deseas eliminar la categoría '{categoriaEliminar?.nombre ?? ''}'?"
    labelConfirmar="Eliminar"
    cargando={eliminando}
    on:confirmar={eliminar}
    on:cancelar={() => (categoriaEliminar = null)}
/>
