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
    $: estaTrial = suscripcion?.estado === "trial";
    $: diasRestantes = suscripcion ? Math.max(0, suscripcion.diasRestantes) : 0;
    $: diasVencidos = suscripcion && suscripcion.diasRestantes < 0 ? Math.abs(suscripcion.diasRestantes) : 0;
    
    // Asumimos un trial estándar de 15 días para la barra de progreso
    $: porcentajeTrial = estaTrial ? Math.min(100, Math.max(0, (diasRestantes / 15) * 100)) : 0;

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

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if !suscripcion}
    <div class="text-center py-12">
        <p class="text-gray-500">No se encontró una suscripción activa</p>
    </div>
{:else}

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Columna Izquierda: Información Principal -->
        <div class="lg:col-span-7 space-y-6">
            
            {#if estaVencida}
                <div class="bg-danger-50 border-2 border-danger-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-10">
                        <svg class="w-24 h-24 text-danger-900" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
                    </div>
                    <div class="relative z-10 flex items-start gap-4">
                        <div class="flex-shrink-0 w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-lg font-bold text-danger-900">Tu suscripción ha vencido</h2>
                            <p class="text-sm text-danger-800 mt-1">El acceso a las funciones completas está bloqueado. Por favor, renueva tu plan para continuar utilizando el sistema sin interrupciones.</p>
                            
                            <div class="mt-4">
                                <button onclick={irARenovar} class="px-5 py-2.5 bg-danger-600 hover:bg-danger-700 text-white font-medium rounded-lg shadow-sm transition-colors shadow-danger-200 animate-[pulse_2s_ease-in-out_infinite]">
                                    Renovar plan ahora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}

            <div class="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div class="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Plan Actual</p>
                        <div class="flex items-center gap-3">
                            <h3 class="text-2xl font-bold text-gray-900">{suscripcion.planNombre}</h3>
                            <Badge variant={badgeVariant} dot>{suscripcion.estado.toUpperCase()}</Badge>
                        </div>
                    </div>
                    {#if !estaVencida}
                        <Button variant="secondary" onclick={irARenovar}>Cambiar o Renovar</Button>
                    {/if}
                </div>

                {#if estaTrial && !estaVencida}
                    <div class="p-5 bg-primary-50 border-b border-primary-100">
                        <div class="flex justify-between items-end mb-2">
                            <div>
                                <h4 class="font-semibold text-primary-900">Periodo de prueba</h4>
                                <p class="text-xs text-primary-700 mt-0.5">Te quedan {diasRestantes} días de prueba gratuita.</p>
                            </div>
                            {#if esBienvenida}
                                <span class="text-xs font-bold text-primary-600 uppercase">¡Bienvenido!</span>
                            {/if}
                        </div>
                        <div class="w-full bg-primary-200 rounded-full h-2.5 overflow-hidden mt-3">
                            <div class="bg-primary-600 h-2.5 rounded-full" style="width: {porcentajeTrial}%"></div>
                        </div>
                    </div>
                {/if}

                <div class="grid grid-cols-2 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div class="p-5 text-center">
                        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Estado de Tiempo</p>
                        {#if estaVencida}
                            <p class="text-lg font-bold text-danger-600">Vencida hace {diasVencidos} días</p>
                        {:else}
                            <p class="text-2xl font-bold text-gray-900">{diasRestantes} <span class="text-sm font-medium text-gray-500">días restantes</span></p>
                        {/if}
                    </div>
                    <div class="p-5 text-center">
                        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Vence el</p>
                        <p class="text-sm font-semibold text-gray-900">{new Date(suscripcion.fechaFinPeriodo).toLocaleDateString()}</p>
                    </div>
                    <div class="p-5 text-center md:col-span-1 col-span-2">
                        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Inició el</p>
                        <p class="text-sm font-semibold text-gray-900">{new Date(suscripcion.fechaInicio).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Columna Derecha: Historial -->
        <div class="lg:col-span-5">
            <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 class="text-sm font-semibold text-gray-800">Historial de pagos</h3>
                </div>
                
                {#if pagos.length > 0}
                    <div class="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                        {#each pagos as pago}
                            <div class="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div>
                                    <p class="text-sm font-bold text-gray-900">{formatCurrency(Number(pago.monto))}</p>
                                    <p class="text-xs text-gray-500">{new Date(pago.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div class="text-right flex flex-col items-end gap-1">
                                    <Badge variant={pago.estado === "aprobado" ? "green" : pago.estado === "rechazado" ? "red" : "yellow"}>
                                        {pago.estado}
                                    </Badge>
                                    <span class="text-[10px] text-gray-400 font-mono uppercase">{pago.metodoPago}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="p-8 text-center">
                        <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                        </div>
                        <p class="text-sm font-medium text-gray-900">No hay pagos registrados</p>
                        <p class="text-xs text-gray-500 mt-1">Tu historial de facturación aparecerá aquí.</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}
