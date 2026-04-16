<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Button from "$components/ui/Button.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import ConfirmDialog from "$components/ui/ConfirmDialog.svelte";
    import { bodegasApi } from "$api/bodegas";
    import { toastStore } from "$stores/toast.store";
    import { formatFechaHora } from "$utils/index";
    import type { Bodega } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let bodegas: Bodega[] = [];
    let cargando = true;

    // Form
    let modalForm = false;
    let modo: "crear" | "editar" = "crear";
    let bodegaEditId = "";
    let nombre = "";
    let ubicacion = "";
    let principal = false;
    let guardando = false;
    let errores: Record<string, string> = {};

    // Eliminar
    let bodegaEliminar: Bodega | null = null;
    let eliminando = false;

    async function cargar() {
        cargando = true;
        try {
            bodegas = await bodegasApi.listar({}, accessToken);
        } catch {
            toastStore.error("Error al cargar bodegas");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function abrirCrear() {
        modo = "crear";
        bodegaEditId = "";
        nombre = "";
        ubicacion = "";
        principal = false;
        modalForm = true;
    }

    function abrirEditar(b: Bodega) {
        modo = "editar";
        bodegaEditId = b.id;
        nombre = b.nombre;
        ubicacion = b.ubicacion ?? "";
        principal = b.principal;
        modalForm = true;
    }

    async function guardar() {
        errores = {};
        if (!nombre.trim()) errores.nombre = "El nombre es obligatorio";
        else if (nombre.trim().length < 2)
            errores.nombre = "Mínimo 2 caracteres";
        if (Object.keys(errores).length > 0) return;
        guardando = true;
        try {
            const payload: Partial<Bodega> = {
                nombre,
                ubicacion: ubicacion || null,
                principal,
            };
            if (modo === "crear") {
                await bodegasApi.crear(payload, accessToken);
                toastStore.exito("Bodega creada");
            } else {
                await bodegasApi.actualizar(bodegaEditId, payload, accessToken);
                toastStore.exito("Bodega actualizada");
            }
            modalForm = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al guardar");
        } finally {
            guardando = false;
        }
    }

    async function eliminar() {
        if (!bodegaEliminar) return;
        eliminando = true;
        try {
            await bodegasApi.eliminar(bodegaEliminar.id, accessToken);
            toastStore.exito("Bodega eliminada");
            bodegaEliminar = null;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al eliminar");
        } finally {
            eliminando = false;
        }
    }
</script>

<svelte:head><title>Bodegas — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Bodegas">
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
        Nueva bodega
    </Button>
</PageHeader>

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if bodegas.length === 0}
    <EmptyState
        titulo="Sin bodegas"
        descripcion="No hay bodegas registradas"
        icono="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    >
        <Button variant="primary" onclick={abrirCrear}>Crear bodega</Button>
    </EmptyState>
{:else}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each bodegas as b}
            <div
                class="bg-white border border-gray-200 rounded-xl p-5 space-y-3 hover:shadow-md transition"
            >
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="font-semibold text-gray-900">{b.nombre}</h3>
                        {#if b.ubicacion}
                            <p class="text-sm text-gray-500 mt-0.5">
                                {b.ubicacion}
                            </p>
                        {/if}
                    </div>
                    <div class="flex items-center gap-1">
                        {#if b.principal}
                            <Badge variant="blue">Principal</Badge>
                        {/if}
                        <Badge variant={b.activo ? "green" : "gray"}
                            >{b.activo ? "Activa" : "Inactiva"}</Badge
                        >
                    </div>
                </div>
                <p class="text-xs text-gray-400">
                    Creada: {formatFechaHora(b.createdAt)}
                </p>
                <div class="flex items-center gap-2 pt-1">
                    <Button
                        variant="secondary"
                        size="sm"
                        onclick={() => abrirEditar(b)}>Editar</Button
                    >
                    {#if !b.principal}
                        <Button
                            variant="danger"
                            size="sm"
                            onclick={() => (bodegaEliminar = b)}
                            >Eliminar</Button
                        >
                    {/if}
                </div>
            </div>
        {/each}
    </div>
{/if}

<!-- Modal crear/editar -->
<Modal
    bind:open={modalForm}
    title={modo === "crear" ? "Nueva bodega" : "Editar bodega"}
>
    <div class="space-y-4">
        <Input
            label="Nombre"
            bind:value={nombre}
            error={errores.nombre}
            required
            placeholder="Ej: Bodega central"
        />
        <Input
            label="Ubicación"
            bind:value={ubicacion}
            placeholder="Dirección o referencia (opcional)"
        />
        <label class="flex items-center gap-2 text-sm">
            <input
                type="checkbox"
                bind:checked={principal}
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Bodega principal
        </label>
    </div>
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalForm = false)}
            >Cancelar</Button
        >
        <Button variant="primary" loading={guardando} onclick={guardar}
            >{modo === "crear" ? "Crear" : "Guardar"}</Button
        >
    </svelte:fragment>
</Modal>

<!-- Confirmar eliminar -->
<ConfirmDialog
    open={!!bodegaEliminar}
    titulo="Eliminar bodega"
    mensaje="¿Estás seguro de eliminar la bodega «{bodegaEliminar?.nombre}»? Esta acción no se puede deshacer."
    variant="danger"
    loading={eliminando}
    on:confirm={eliminar}
    on:cancel={() => (bodegaEliminar = null)}
/>
