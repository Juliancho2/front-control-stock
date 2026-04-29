<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Button from "$components/ui/Button.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import { suscripcionesApi, pagosSuscripcionApi } from "$api/suscripciones";
    import { toastStore } from "$stores/toast.store";
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type { Suscripcion, PagoSuscripcion } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    $: esBienvenida = $page.url.searchParams.get("bienvenido") === "1";

    let cargando = true;
    let suscripcion: Suscripcion | null = null;
    let pagos: PagoSuscripcion[] = [];

    async function cargar() {
        cargando = true;
        try {
            suscripcion = await suscripcionesApi.miSuscripcion(accessToken);
            pagos = await pagosSuscripcionApi.misPagos(accessToken);
        } catch {
            toastStore.error("No se pudo cargar la suscripción");
        } finally {
            cargando = false;
        }
    }

    async function irARenovar() {
        await goto("/admin/suscripcion/pagar");
    }

    onMount(cargar);

    $: estaVencida = suscripcion?.estado === "vencida";
    $: badgeVariant = suscripcion?.estado === "activa"
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
        class="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-5 flex items-start gap-3 max-w-xl"
    >
        <div
            class="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center"
        >
            <svg
                class="w-4 h-4 text-primary-600"
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
            <p class="text-sm font-medium text-primary-900">
                ¡Bienvenido a FerreControl!
            </p>
            <p class="text-xs text-primary-700 mt-0.5">
                Tu periodo de prueba está activo.
            </p>
            <a
                href="/admin/dashboard"
                class="text-xs font-medium text-primary-700 underline mt-2 inline-block"
                >Ir al panel →</a
            >
        </div>
    </div>
{/if}

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if !suscripcion}
    <div class="text-center py-12">
        <p class="text-gray-500">No se encontró una suscripción activa</p>
    </div>
{:else}
    {#if estaVencida}
        <div
            class="bg-danger-50 border border-danger-200 rounded-xl p-4 mb-5 max-w-xl"
        >
            <div class="flex items-start gap-3">
                <div
                    class="flex-shrink-0 w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center"
                >
                    <svg
                        class="w-4 h-4 text-danger-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-danger-900">
                        Tu suscripción ha vencido
                    </p>
                    <p class="text-xs text-danger-700 mt-0.5">
                        Para seguir usando el sistema, renueva tu plan.
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <div
        class="bg-white border border-gray-200 rounded-xl overflow-hidden max-w-xl"
    >
        <div class="p-4 border-b border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide">
                        Plan
                    </p>
                    <p class="text-lg font-semibold text-gray-900">
                        {suscripcion.planNombre}
                    </p>
                </div>
                <Badge variant={badgeVariant} dot>{suscripcion.estado}</Badge>
            </div>
        </div>

        <div class="grid grid-cols-3 divide-x divide-gray-100">
            <div class="p-4 text-center">
                <p class="text-xs text-gray-500">Días restantes</p>
                <p class="text-lg font-semibold text-gray-900">
                    {suscripcion.diasRestantes}
                </p>
            </div>
            <div class="p-4 text-center">
                <p class="text-xs text-gray-500">Vence</p>
                <p class="text-sm font-medium text-gray-900">
                    {formatFechaHora(suscripcion.fechaFinPeriodo)}
                </p>
            </div>
            <div class="p-4 text-center">
                <p class="text-xs text-gray-500">Inicio</p>
                <p class="text-sm font-medium text-gray-900">
                    {formatFechaHora(suscripcion.fechaInicio)}
                </p>
            </div>
        </div>

        {#if estaVencida}
            <div class="p-4 border-t border-gray-100">
                <Button variant="primary" onclick={irARenovar} fullWidth>
                    Renovar plan
                </Button>
            </div>
        {/if}
    </div>

    {#if pagos.length > 0}
        <div class="mt-6">
            <h3 class="text-sm font-medium text-gray-700 mb-3">
                Historial de pagos
            </h3>
            <div
                class="bg-white border border-gray-200 rounded-xl overflow-hidden max-w-xl"
            >
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th
                                class="text-left p-3 text-xs font-medium text-gray-500"
                                >Fecha</th
                            >
                            <th
                                class="text-left p-3 text-xs font-medium text-gray-500"
                                >Monto</th
                            >
                            <th
                                class="text-left p-3 text-xs font-medium text-gray-500"
                                >Estado</th
                            >
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        {#each pagos as pago}
                            <tr>
                                <td class="p-3 text-gray-900"
                                    >{new Date(
                                        pago.createdAt,
                                    ).toLocaleDateString()}</td
                                >
                                <td class="p-3 text-gray-900"
                                    >{formatCurrency(Number(pago.monto))}</td
                                >
                                <td class="p-3">
                                    <Badge
                                        variant={pago.estado === "aprobado"
                                            ? "green"
                                            : pago.estado === "rechazado"
                                              ? "red"
                                              : "yellow"}
                                    >
                                        {pago.estado}
                                    </Badge>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
{/if}
