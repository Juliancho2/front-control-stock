<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Input from "$components/ui/Input.svelte";
    import Button from "$components/ui/Button.svelte";
    import { planesApi } from "$api/planes";
    import { toastStore } from "$stores/toast.store";
    import type { Plan } from "$types/index";
    import { api } from "$api/fetch";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let planes: Plan[] = [];
    let cargando = true;

    // Modal
    let mostrarModal = false;
    let editando: Plan | null = null;
    let guardando = false;
    let nombre = "";
    let codigo = "";
    let precioMensual = "";
    let moneda = "COP";
    let errores: Record<string, string> = {};

    async function cargar() {
        cargando = true;
        try {
            planes = await planesApi.listar(accessToken);
        } catch {
            toastStore.error("Error al cargar planes");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function abrirCrear() {
        editando = null;
        nombre = "";
        codigo = "";
        precioMensual = "";
        moneda = "COP";
        errores = {};
        mostrarModal = true;
    }

    function abrirEditar(p: Plan) {
        editando = p;
        nombre = p.nombre;
        codigo = p.codigo;
        precioMensual = String(p.precioMensual);
        moneda = p.moneda;
        errores = {};
        mostrarModal = true;
    }

    function validar(): boolean {
        errores = {};
        if (!nombre.trim()) errores.nombre = "El nombre es requerido";
        if (!editando) {
            if (!codigo.trim()) errores.codigo = "El código es requerido";
            else if (!/^[a-z0-9_-]+$/.test(codigo))
                errores.codigo =
                    "Solo minúsculas, números, guiones y underscores";
        }
        if (
            !precioMensual ||
            isNaN(Number(precioMensual)) ||
            Number(precioMensual) < 0
        )
            errores.precioMensual = "Precio inválido";
        return Object.keys(errores).filter((k) => errores[k]).length === 0;
    }

    async function guardar() {
        if (!validar()) return;
        guardando = true;
        try {
            if (editando) {
                await api.patch(
                    `/planes/${editando.id}`,
                    {
                        nombre: nombre.trim(),
                        precioMensual: Number(precioMensual),
                    },
                    { token: accessToken },
                );
                toastStore.exito("Plan actualizado");
            } else {
                await api.post(
                    "/planes",
                    {
                        nombre: nombre.trim(),
                        codigo: codigo.trim(),
                        precioMensual: Number(precioMensual),
                        moneda: moneda.trim(),
                    },
                    { token: accessToken },
                );
                toastStore.exito("Plan creado");
            }
            mostrarModal = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al guardar plan");
        } finally {
            guardando = false;
        }
    }

    async function toggleActivo(plan: Plan) {
        try {
            await api.patch(
                `/planes/${plan.id}`,
                { activo: !plan.activo },
                { token: accessToken },
            );
            toastStore.exito(
                plan.activo ? "Plan desactivado" : "Plan activado",
            );
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error");
        }
    }

    function formatPrecio(precio: number, mon: string): string {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: mon,
            minimumFractionDigits: 0,
        }).format(precio);
    }
</script>

<svelte:head><title>Planes — FerreControl</title></svelte:head>

<PageHeader titulo="Planes" descripcion="Gestión de planes de suscripción" />

<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1"></div>
    <Button variant="primary" onclick={abrirCrear}>
        <svg
            class="w-4 h-4 mr-1.5 -ml-0.5"
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
        Nuevo plan
    </Button>
</div>

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if planes.length === 0}
    <EmptyState
        titulo="Sin planes"
        descripcion="No se encontraron planes de suscripción"
        icono="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
{:else}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each planes as plan}
            <div
                class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col"
            >
                <div class="flex items-start justify-between mb-3">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">
                            {plan.nombre}
                        </h3>
                        <p class="text-xs text-gray-500 font-mono">
                            {plan.codigo}
                        </p>
                    </div>
                    <Badge variant={plan.activo ? "green" : "red"} dot>
                        {plan.activo ? "Activo" : "Inactivo"}
                    </Badge>
                </div>
                <div class="mb-4">
                    <span class="text-2xl font-bold text-primary-600"
                        >{formatPrecio(plan.precioMensual, plan.moneda)}</span
                    >
                    <span class="text-sm text-gray-500">/mes</span>
                </div>
                <div class="mt-auto flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        onclick={() => abrirEditar(plan)}
                    >
                        Editar
                    </Button>
                    <Button
                        variant={plan.activo ? "danger" : "primary"}
                        size="sm"
                        fullWidth
                        onclick={() => toggleActivo(plan)}
                    >
                        {plan.activo ? "Desactivar" : "Activar"}
                    </Button>
                </div>
            </div>
        {/each}
    </div>
{/if}

<!-- Modal crear/editar plan -->
{#if mostrarModal}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onclick={() => (mostrarModal = false)}
    >
        <div
            class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in"
            onclick={(e) => e.stopPropagation()}
        >
            <div class="bg-primary-50 px-5 py-4 flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"
                >
                    <svg
                        class="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-semibold text-gray-900">
                        {editando ? "Editar plan" : "Nuevo plan"}
                    </h2>
                    <p class="text-xs text-gray-500">
                        {editando
                            ? "Modifica los datos del plan"
                            : "Crea un nuevo plan de suscripción"}
                    </p>
                </div>
            </div>

            <div class="px-5 py-4 space-y-4">
                <Input
                    label="Nombre"
                    bind:value={nombre}
                    placeholder="Ej: Premium"
                    error={errores.nombre}
                    required
                />

                {#if !editando}
                    <Input
                        label="Código"
                        bind:value={codigo}
                        placeholder="ej: premium"
                        error={errores.codigo}
                        required
                        hint="Identificador único. Solo minúsculas"
                    />
                {:else}
                    <div>
                        <span
                            class="block text-sm font-medium text-gray-700 mb-1"
                            >Código</span
                        >
                        <p
                            class="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg"
                        >
                            {editando.codigo}
                        </p>
                    </div>
                {/if}

                <Input
                    label="Precio mensual"
                    type="number"
                    bind:value={precioMensual}
                    placeholder="35000"
                    error={errores.precioMensual}
                    required
                />

                {#if !editando}
                    <Input
                        label="Moneda"
                        bind:value={moneda}
                        placeholder="COP"
                        hint="Código ISO de moneda"
                    />
                {/if}
            </div>

            <div class="px-5 pb-5 flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (mostrarModal = false)}
                    disabled={guardando}
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    fullWidth
                    loading={guardando}
                    onclick={guardar}
                >
                    {editando ? "Guardar cambios" : "Crear plan"}
                </Button>
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes modal-in {
        from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
    .animate-modal-in {
        animation: modal-in 0.2s ease-out;
    }
</style>
