<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Button from "$components/ui/Button.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import Input from "$components/ui/Input.svelte";
    import { pagosSuscripcionApi } from "$api/suscripciones";
    import { planesApi } from "$api/planes";
    import { toastStore } from "$stores/toast.store";
    import { formatCurrency } from "$utils/index";
    import { suscripcionActual } from "$stores/auth.store";
    import type { Plan, PagoSuscripcion } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let cargando = true;
    let planes: Plan[] = [];
    let planSeleccionado = "";
    let meses = 1;
    let metodoPago: "nequi" | "transferencia" = "nequi";
    let pagoActual: PagoSuscripcion | null = null;
    let procesando = false;
    let comprobanteUrl = "";

    async function cargar() {
        cargando = true;
        try {
            planes = await planesApi.listar(accessToken);
            if (planes.length > 0) {
                // Seleccionar un plan por defecto diferente al actual si es posible
                const actualId = $suscripcionActual?.planId;
                const pro = planes.find((p) => p.codigo === "pro");
                planSeleccionado = pro?.id || planes[0].id;
            }
        } catch {
            toastStore.error("Error al cargar planes");
        } finally {
            cargando = false;
        }
    }

    async function crearPago() {
        if (!planSeleccionado) return;
        procesando = true;
        try {
            pagoActual = await pagosSuscripcionApi.crear(
                { planId: planSeleccionado, metodoPago, meses },
                accessToken,
            );
            toastStore.exito(
                "Orden de pago generada. Sigue las instrucciones para activar tu plan.",
            );
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al crear pago");
        } finally {
            procesando = false;
        }
    }

    async function copiar(
        texto: string,
        mensaje: string = "Copiado al portapapeles",
    ) {
        try {
            await navigator.clipboard.writeText(texto);
            toastStore.exito(mensaje);
        } catch (e) {
            toastStore.error("No se pudo copiar");
        }
    }

    async function confirmarPago() {
        if (!pagoActual) return;
        procesando = true;
        try {
            if (comprobanteUrl.trim()) {
                await pagosSuscripcionApi.subirComprobante(
                    pagoActual.id,
                    comprobanteUrl,
                    accessToken,
                );
            }

            await pagosSuscripcionApi.marcarPagado(pagoActual.id, accessToken);
            toastStore.exito(
                "Pago reportado correctamente. Validaremos la transacción en breve.",
            );
            goto("/admin/suscripcion");
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al confirmar");
        } finally {
            procesando = false;
        }
    }

    async function cancelarOrden() {
        if (pagoActual) {
            try {
                procesando = true;
                await pagosSuscripcionApi.cancelar(pagoActual.id, accessToken);
            } catch {
                /* ignore */
            }
        }
        pagoActual = null;
    }

    onMount(cargar);

    $: planActual = planes.find((p) => p.id === planSeleccionado);
    $: precioBaseMes = planActual ? Number(planActual.precioMensual) : 0;

    const opcionesMeses = [
        { valor: 1, label: "Mensual", descuento: 0 },
        { valor: 3, label: "Trimestral", descuento: 0 },
        { valor: 6, label: "Semestral", descuento: 5 },
        { valor: 12, label: "Anual", descuento: 15 },
    ];

    $: descuentoAplicado =
        opcionesMeses.find((o) => o.valor === meses)?.descuento || 0;
    $: subtotal = precioBaseMes * meses;
    $: valorDescuento = subtotal * (descuentoAplicado / 100);
    $: montoTotal = subtotal - valorDescuento;
</script>

<svelte:head><title>Checkout — FerreControl</title></svelte:head>

<div class="max-w-6xl mx-auto pb-10">
    <div class="mb-8">
        <PageHeader titulo="Finalizar Contratación">
            <div slot="extra">
                <Button variant="ghost" size="sm" href="/admin/suscripcion">
                    &larr; Volver
                </Button>
            </div>
        </PageHeader>
    </div>

    {#if cargando}
        <div
            class="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
        >
            <Spinner size="lg" />
            <p class="mt-4 text-gray-500 font-medium">Cargando opciones...</p>
        </div>
    {:else if !pagoActual}
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Columna Izquierda: Configuración -->
            <div class="lg:col-span-2 space-y-6">
                <!-- 1. Elección de Plan -->
                <section
                    class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
                >
                    <div class="flex items-center gap-3 mb-6">
                        <span
                            class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-bold text-sm"
                            >1</span
                        >
                        <h2 class="font-bold text-gray-900 text-lg">
                            Selecciona tu Plan
                        </h2>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {#each planes.filter((p) => p.activo && p.codigo !== "trial") as plan}
                            <button
                                type="button"
                                class="group relative p-5 rounded-2xl border-2 text-left transition-all duration-200
                                    {planSeleccionado === plan.id
                                    ? 'border-primary-500 bg-primary-50/30 ring-4 ring-primary-500/5'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'}"
                                onclick={() => (planSeleccionado = plan.id)}
                            >
                                <div
                                    class="flex justify-between items-start mb-2"
                                >
                                    <p class="font-bold text-gray-900 text-lg">
                                        {plan.nombre}
                                    </p>
                                    {#if planSeleccionado === plan.id}
                                        <div
                                            class="text-primary-600 bg-primary-100 rounded-full p-0.5"
                                        >
                                            <svg
                                                class="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                ><path
                                                    fill-rule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clip-rule="evenodd"
                                                /></svg
                                            >
                                        </div>
                                    {/if}
                                </div>
                                <p
                                    class="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed"
                                >
                                    Ideal para negocios que buscan {plan.codigo ===
                                    "basic"
                                        ? "lo esencial"
                                        : "máximo control y reportes"}.
                                </p>
                                <div class="mt-auto">
                                    <span
                                        class="text-2xl font-black text-gray-900"
                                        >{formatCurrency(
                                            Number(plan.precioMensual),
                                        )}</span
                                    >
                                    <span
                                        class="text-xs font-medium text-gray-400 ml-1"
                                        >/ mes</span
                                    >
                                </div>
                            </button>
                        {/each}
                    </div>
                </section>

                <!-- 2. Periodo de tiempo -->
                <section
                    class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
                >
                    <div class="flex items-center gap-3 mb-6">
                        <span
                            class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-bold text-sm"
                            >2</span
                        >
                        <h2 class="font-bold text-gray-900 text-lg">
                            ¿Por cuánto tiempo?
                        </h2>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {#each opcionesMeses as opcion}
                            <button
                                type="button"
                                class="flex flex-col items-center p-4 rounded-xl border-2 transition-all
                                    {meses === opcion.valor
                                    ? 'border-primary-500 bg-primary-50/30'
                                    : 'border-gray-100 hover:border-gray-200'}"
                                onclick={() => (meses = opcion.valor)}
                            >
                                <span
                                    class="text-sm font-bold {meses ===
                                    opcion.valor
                                        ? 'text-primary-700'
                                        : 'text-gray-600'}">{opcion.label}</span
                                >
                                {#if opcion.descuento > 0}
                                    <Badge
                                        variant="green"
                                        className="mt-2 text-[10px] py-0 px-1.5"
                                        >-{opcion.descuento}% OFF</Badge
                                    >
                                {/if}
                            </button>
                        {/each}
                    </div>
                </section>

                <!-- 3. Método de Pago -->
                <section
                    class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
                >
                    <div class="flex items-center gap-3 mb-6">
                        <span
                            class="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50 text-primary-600 font-bold text-sm"
                            >3</span
                        >
                        <h2 class="font-bold text-gray-900 text-lg">
                            Método de Pago
                        </h2>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                                {metodoPago === 'nequi'
                                ? 'border-primary-500 bg-primary-50/30'
                                : 'border-gray-100 hover:border-gray-200'}"
                            onclick={() => (metodoPago = "nequi")}
                        >
                            <div
                                class="w-10 h-10 rounded-lg bg-[#7000FF] flex items-center justify-center shadow-sm"
                            >
                                <span class="text-white font-black text-xs"
                                    >N</span
                                >
                            </div>
                            <div class="text-left">
                                <p class="font-bold text-gray-900 leading-none">
                                    Nequi
                                </p>
                                <p class="text-[11px] text-gray-400 mt-1">
                                    Transferencia inmediata
                                </p>
                            </div>
                        </button>
                    </div>
                </section>
            </div>

            <!-- Columna Derecha: Resumen -->
            <div class="lg:col-span-1">
                <div
                    class="bg-gray-900 rounded-3xl p-8 text-white shadow-xl lg:sticky lg:top-8"
                >
                    <h3 class="text-lg font-bold mb-6">Resumen del pedido</h3>

                    <div class="space-y-4 mb-8">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Plan</span>
                            <span class="font-medium"
                                >{planActual?.nombre ?? "No seleccionado"}</span
                            >
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Periodo</span>
                            <span class="font-medium"
                                >{meses} {meses === 1 ? "mes" : "meses"}</span
                            >
                        </div>
                        <div class="h-px bg-white/10 my-2"></div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-400">Subtotal</span>
                            <span class="font-medium"
                                >{formatCurrency(subtotal)}</span
                            >
                        </div>
                        {#if valorDescuento > 0}
                            <div
                                class="flex justify-between text-sm text-green-400"
                            >
                                <span>Descuento ({descuentoAplicado}%)</span>
                                <span>-{formatCurrency(valorDescuento)}</span>
                            </div>
                        {/if}
                    </div>

                    <div class="flex justify-between items-end mb-8">
                        <span class="text-gray-400 text-sm">Total a pagar</span>
                        <span class="text-3xl font-black text-white"
                            >{formatCurrency(montoTotal)}</span
                        >
                    </div>

                    <Button
                        block
                        variant="primary"
                        size="lg"
                        className="rounded-2xl py-4"
                        fullWidth
                        loading={procesando}
                        disabled={!planSeleccionado}
                        onclick={crearPago}
                    >
                        Generar Orden de Pago
                    </Button>

                    <p
                        class="text-[12px] text-center text-gray-500 mt-6 leading-relaxed"
                    >
                        Al confirmar, se generará una referencia de pago. Tu
                        plan se activará una vez validemos el comprobante.
                    </p>
                </div>
            </div>
        </div>
    {:else}
        <!-- VISTA DE PAGO GENERADO -->
        <div class="max-w-2xl mx-auto">
            <div
                class="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
            >
                <!-- Cabecera -->
                <div class="bg-primary-600 p-8 text-white text-center">
                    <div
                        class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <svg
                            class="w-8 h-8 text-white"
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
                    <h2 class="text-2xl font-black mb-1">¡Orden generada!</h2>
                    <p class="text-primary-100 text-sm opacity-90">
                        Referencia: <span
                            class="font-mono font-bold tracking-wider uppercase"
                            >{pagoActual.referencia}</span
                        >
                    </p>
                </div>

                <div class="p-8 space-y-8">
                    <!-- Monto Destacado -->
                    <div
                        class="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200"
                    >
                        <p
                            class="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1"
                        >
                            Monto exacto a transferir
                        </p>
                        <p class="text-4xl font-black text-gray-900">
                            {formatCurrency(pagoActual.monto)}
                        </p>
                    </div>

                    <!-- Instrucciones según método -->
                    <div class="space-y-4">
                        <h3
                            class="font-bold text-gray-900 flex items-center gap-2"
                        >
                            <svg
                                class="w-4 h-4 text-primary-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Instrucciones de depósito
                        </h3>

                        {#if pagoActual.metodoPago === "nequi"}
                            <div
                                class="bg-primary-50/50 rounded-2xl p-6 border border-primary-100/50"
                            >
                                <p class="text-sm text-gray-600 mb-6">
                                    Realiza el envío desde tu app Nequi al
                                    siguiente número:
                                </p>
                                <div
                                    class="flex items-center justify-between p-4 bg-white rounded-xl border border-primary-200 shadow-sm"
                                >
                                    <div>
                                        <p
                                            class="text-[10px] text-gray-400 font-bold uppercase"
                                        >
                                            Celular Nequi
                                        </p>
                                        <p
                                            class="text-xl font-black text-gray-900 tracking-tight"
                                        >
                                            312 345 6789
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onclick={() => copiar("3123456789")}
                                        >Copiar</Button
                                    >
                                </div>
                            </div>
                        {:else}
                            <div
                                class="bg-gray-50 rounded-2xl p-6 border border-gray-200"
                            >
                                <div class="space-y-4">
                                    <div
                                        class="flex justify-between items-center pb-3 border-b border-gray-200"
                                    >
                                        <span
                                            class="text-xs text-gray-500 font-bold uppercase"
                                            >Banco</span
                                        >
                                        <span class="font-bold text-gray-900"
                                            >Bancolombia</span
                                        >
                                    </div>
                                    <div
                                        class="flex justify-between items-center pb-3 border-b border-gray-200"
                                    >
                                        <span
                                            class="text-xs text-gray-500 font-bold uppercase"
                                            >Tipo</span
                                        >
                                        <span class="font-bold text-gray-900"
                                            >Ahorros</span
                                        >
                                    </div>
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <div>
                                            <p
                                                class="text-xs text-gray-500 font-bold uppercase leading-none"
                                            >
                                                Cuenta
                                            </p>
                                            <p
                                                class="font-black text-lg text-gray-900 tracking-tight mt-1"
                                            >
                                                123-456789-00
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onclick={() =>
                                                copiar("12345678900")}
                                            >Copiar</Button
                                        >
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <!-- Confirmación -->
                    <div class="space-y-4 pt-4">
                        <div>
                            <label
                                for="url"
                                class="block text-xs font-bold text-gray-500 uppercase mb-2"
                                >URL del comprobante (opcional)</label
                            >
                            <Input
                                id="url"
                                placeholder="Link de captura o número de referencia"
                                bind:value={comprobanteUrl}
                                className="rounded-xl border-gray-200"
                            />
                        </div>

                        <Button
                            block
                            variant="primary"
                            size="lg"
                            className="rounded-2xl py-4 shadow-lg shadow-primary-500/20"
                            loading={procesando}
                            onclick={confirmarPago}
                            fullWidth
                        >
                            He realizado el pago
                        </Button>

                        <button
                            class="w-full text-center text-xs text-gray-400 hover:text-danger-500 transition-colors font-medium underline"
                            onclick={cancelarOrden}
                        >
                            Cancelar esta orden e intentar otro método
                        </button>
                    </div>
                </div>
            </div>

            <div class="mt-8 text-center">
                <p class="text-sm text-gray-500">
                    ¿Tienes dudas? 
                    <a 
                        href="https://api.whatsapp.com/send/?phone=573164305964" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-primary-500/30"
                    >
                        Chatea con soporte por WhatsApp
                    </a>
                </p>
            </div>
        </div>
    {/if}
</div>

<style>
    :global(body) {
        background-color: #f9fafb;
    }
</style>
