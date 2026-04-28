<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Button from "$components/ui/Button.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import { suscripcionesApi } from "$api/suscripciones";
    import { toastStore } from "$stores/toast.store";
    import { formatFechaHora } from "$utils/index";
    import type { Suscripcion } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    $: esBienvenida = $page.url.searchParams.get("bienvenido") === "1";

    let cargando = true;
    let procesando = false;
    let suscripcion: Suscripcion | null = null;
    let badgeEstado: "green" | "yellow" | "red" | "blue" | "gray" = "gray";

    async function cargar() {
        cargando = true;
        try {
            suscripcion = await suscripcionesApi.miSuscripcion(accessToken);
            console.log("Suscripción:", suscripcion);
        } catch (e: any) {
            toastStore.error(
                e?.mensajes?.[0] ?? "No se pudo cargar la suscripción",
            );
        } finally {
            cargando = false;
        }
    }

    async function cancelar() {
        if (!suscripcion) return;
        procesando = true;
        try {
            await suscripcionesApi.cancelar(suscripcion.id, accessToken);
            toastStore.exito("Suscripción cancelada");
            await cargar();
        } catch (e: any) {
            toastStore.error(
                e?.mensajes?.[0] ?? "No se pudo cancelar la suscripción",
            );
        } finally {
            procesando = false;
        }
    }

    onMount(cargar);

    $: badgeEstado =
        suscripcion?.estado === "activa"
            ? "green"
            : suscripcion?.estado === "trial"
              ? "blue"
              : suscripcion?.estado === "vencida"
                ? "red"
                : suscripcion?.estado === "suspendida"
                  ? "yellow"
                  : "gray";
</script>

<svelte:head><title>Mi suscripción — FerreControl</title></svelte:head>

<PageHeader titulo="Mi suscripción" />

{#if esBienvenida}
    <div
        class="bg-primary-50 border border-primary-200 rounded-xl p-5 mb-5 flex items-start gap-4 max-w-2xl"
    >
        <div
            class="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"
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
                    d="M5 13l4 4L19 7"
                />
            </svg>
        </div>
        <div>
            <p class="font-semibold text-primary-900">
                ¡Bienvenido a FerreControl!
            </p>
            <p class="text-sm text-primary-700 mt-0.5">
                Tu negocio fue registrado exitosamente. Tienes un periodo de
                prueba activo — revisa los detalles a continuación.
            </p>
            <a
                href="/admin/dashboard"
                class="inline-block mt-3 text-sm font-medium text-primary-700 underline underline-offset-2 hover:text-primary-900"
            >
                Ir al panel de administración →
            </a>
        </div>
    </div>
{/if}

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if !suscripcion}
    <EmptyState
        titulo="Sin suscripción"
        descripcion="No se encontró una suscripción activa para este negocio"
        icono="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
{:else}
    <div
        class="bg-white border border-gray-200 rounded-xl p-5 space-y-5 max-w-2xl"
    >
        <div class="flex items-center justify-between gap-3">
            <div>
                <p class="text-sm text-gray-500">Plan</p>
                <h2 class="text-xl font-semibold text-gray-900">
                    {suscripcion.planNombre}
                </h2>
            </div>
            <Badge variant={badgeEstado} dot>{suscripcion.estado}</Badge>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div class="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p class="text-gray-500">Días restantes</p>
                <p class="text-lg font-semibold text-gray-900">
                    {suscripcion.diasRestantes}
                </p>
            </div>
            <div class="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p class="text-gray-500">Fin de periodo</p>
                <p class="text-sm font-medium text-gray-900">
                    {formatFechaHora(suscripcion.fechaFinPeriodo)}
                </p>
            </div>
            <div class="rounded-lg bg-gray-50 border border-gray-200 p-3">
                <p class="text-gray-500">Inicio</p>
                <p class="text-sm font-medium text-gray-900">
                    {formatFechaHora(suscripcion.fechaInicio)}
                </p>
            </div>
        </div>

        <div class="flex justify-end">
            <Button
                variant="danger"
                onclick={cancelar}
                loading={procesando}
                disabled={suscripcion.estado === "cancelada"}
            >
                Cancelar suscripción
            </Button>
        </div>
    </div>
{/if}
