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
            if (planes.length > 0)
                planSeleccionado =
                    data.suscripcion?.planId === "trial"
                        ? planes[1].id
                        : planes[2].id;
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
                "Pago creado con éxito. Por favor sigue las instrucciones.",
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
            toastStore.error("No se pudo copiar al portapapeles");
        }
    }

    async function confirmarPago() {
        if (!pagoActual) return;
        procesando = true;
        try {
            // Optional: si subió comprobante, lo enviamos primero
            if (comprobanteUrl.trim()) {
                await pagosSuscripcionApi.subirComprobante(
                    pagoActual.id,
                    comprobanteUrl,
                    accessToken,
                );
            }

            await pagosSuscripcionApi.marcarPagado(pagoActual.id, accessToken);
            toastStore.exito(
                "Pago reportado. En breve lo validaremos y activaremos tu plan.",
            );
            goto("/admin/suscripcion");
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al confirmar");
        } finally {
            procesando = false;
        }
    }

    async function cambiarPlan() {
        if (pagoActual) {
            try {
                procesando = true;
                await pagosSuscripcionApi.cancelar(pagoActual.id, accessToken);
            } catch {
                // ignore
            } finally {
                procesando = false;
            }
        }
        pagoActual = null;
    }

    onMount(cargar);

    $: planActual = planes.find((p) => p.id === planSeleccionado);
    $: precioBaseMes = planActual ? Number(planActual.precioMensual) : 0;

    // Opciones de meses con descuentos sugeridos (visual)
    const opcionesMeses = [
        { valor: 1, label: "1 mes", descuento: 0 },
        { valor: 3, label: "3 meses", descuento: 0 },
        { valor: 6, label: "6 meses", descuento: 5 },
        { valor: 12, label: "12 meses", descuento: 10 },
    ];

    $: descuentoAplicado =
        opcionesMeses.find((o) => o.valor === meses)?.descuento || 0;
    $: subtotal = precioBaseMes * meses;
    $: valorDescuento = subtotal * (descuentoAplicado / 100);
    $: montoTotal = subtotal - valorDescuento;
</script>

<svelte:head><title>Renovar plan — FerreControl</title></svelte:head>

<PageHeader titulo="Renovar plan o Cambiar de plan" />

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if !pagoActual}
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <!-- Configurador -->
        <div class="lg:col-span-8 space-y-8">
            <!-- 1. Planes -->
            <div
                class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold"
                    >
                        1
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900">
                        Selecciona tu Plan
                    </h2>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {#each planes.filter((p) => p.activo && p.codigo !== "trial") as plan}
                        <button
                            type="button"
                            class="relative p-5 rounded-xl border-2 text-left transition-all duration-200 hover:border-primary-300"
                            class:border-primary-500={planSeleccionado ===
                                plan.id}
                            class:border-gray-200={planSeleccionado !== plan.id}
                            class:bg-primary-50={planSeleccionado === plan.id}
                            class:shadow-md={planSeleccionado === plan.id}
                            onclick={() => (planSeleccionado = plan.id)}
                        >
                            {#if planSeleccionado === plan.id}
                                <div
                                    class="absolute top-4 right-4 text-primary-600"
                                >
                                    <svg
                                        class="w-6 h-6"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        ><path
                                            fill-rule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clip-rule="evenodd"
                                        /></svg
                                    >
                                </div>
                            {/if}
                            <p class="font-bold text-gray-900 text-lg mb-1">
                                {plan.nombre}
                            </p>
                            <p class="text-sm text-gray-500 mb-3">
                                {plan.descripcion}
                            </p>
                            <p class="text-xl font-extrabold text-primary-700">
                                {formatCurrency(
                                    Number(plan.precioMensual),
                                )}<span
                                    class="text-sm font-medium text-gray-500"
                                    >/mes</span
                                >
                            </p>
                        </button>
                    {/each}
                </div>
            </div>

            <!-- 2. Duración -->
            <div
                class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold"
                    >
                        2
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900">
                        Duración del Plan
                    </h2>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {#each opcionesMeses as opcion}
                        <button
                            type="button"
                            class="relative p-4 rounded-xl border-2 text-center transition-colors hover:border-primary-300"
                            class:border-primary-500={meses === opcion.valor}
                            class:border-gray-200={meses !== opcion.valor}
                            class:bg-primary-50={meses === opcion.valor}
                            onclick={() => (meses = opcion.valor)}
                        >
                            <p class="font-bold text-gray-900">
                                {opcion.label}
                            </p>
                            {#if opcion.descuento > 0}
                                <span
                                    class="absolute -top-2.5 -right-2.5 bg-warning-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
                                >
                                    -{opcion.descuento}%
                                </span>
                            {/if}
                        </button>
                    {/each}
                </div>
            </div>

            <!-- 3. Método de pago -->
            <div
                class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
                <div class="flex items-center gap-3 mb-4">
                    <div
                        class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold"
                    >
                        3
                    </div>
                    <h2 class="text-lg font-semibold text-gray-900">
                        Método de Pago
                    </h2>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        type="button"
                        class="p-4 rounded-xl border-2 transition-colors flex items-center gap-4 hover:border-primary-300"
                        class:border-primary-500={metodoPago === "nequi"}
                        class:border-gray-200={metodoPago !== "nequi"}
                        class:bg-primary-50={metodoPago === "nequi"}
                        onclick={() => (metodoPago = "nequi")}
                    >
                        <div
                            class="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center p-2 flex-shrink-0"
                        >
                            <!-- Nequi Logo simplified -->
                            <svg
                                viewBox="4.86 5.41 559.65 132.36"
                                class="w-full h-full text-primary-600"
                                ><path
                                    d="m32.44 30.19c.73-.6 1.47-1.19 2.2-1.79.58-.03 1.14-.07 1.06-.89l-.05.06c9.45-3.76 18.12-9.03 26.92-14.04l1.25-.03c12.32 5.87 24.91 11.09 37.68 15.88.56.39 1.13.77 1.69 1.16 6.99 8.99 14.48 17.54 22.09 26l.15.94c-3.9 11.81-6.79 23.9-9.78 35.97-.32.6-.63 1.19-.95 1.79-9.47 10.39-18.95 20.78-28.42 31.17-.6-.24-1.23-.44-1.8-.73-13.33-6.92-26.65-13.85-39.97-20.78-.66-.5-1.31-1-1.97-1.5-.03-.64-.31-1.04-1.01-1.03l.04.04c-.07-1.63-1.34-2.6-2.16-3.8-8.81-12.97-18.64-25.22-26.87-38.59 2.13-3.13 4.34-6.2 6.36-9.4 4.36-6.91 10.16-12.87 13.54-20.43z"
                                    fill="currentColor"
                                /></svg
                            >
                        </div>
                        <div class="text-left">
                            <p class="font-bold text-gray-900">Nequi</p>
                            <p class="text-xs text-gray-500">
                                Transferencia rápida
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>

        <!-- Resumen -->
        <div class="lg:col-span-4">
            <div
                class="bg-white border border-gray-200 rounded-2xl shadow-lg sticky top-6 overflow-hidden"
            >
                <div class="bg-gray-50/50 p-5 border-b border-gray-100">
                    <h3 class="font-bold text-gray-900">Resumen del pedido</h3>
                </div>

                <div class="p-5 space-y-4">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-600"
                            >Plan {planActual?.nombre} x {meses}
                            {meses === 1 ? "mes" : "meses"}</span
                        >
                        <span class="font-medium text-gray-900"
                            >{formatCurrency(subtotal)}</span
                        >
                    </div>

                    {#if descuentoAplicado > 0}
                        <div
                            class="flex justify-between text-sm text-primary-600"
                        >
                            <span
                                >Descuento sugerido ({descuentoAplicado}%)</span
                            >
                            <span>-{formatCurrency(valorDescuento)}</span>
                        </div>
                    {/if}

                    <hr class="border-gray-100" />

                    <div class="flex justify-between items-end">
                        <span class="font-medium text-gray-700"
                            >Total a pagar</span
                        >
                        <span class="text-2xl font-extrabold text-primary-700"
                            >{formatCurrency(montoTotal)}</span
                        >
                    </div>
                </div>

                <div class="p-5 bg-gray-50/50 border-t border-gray-100">
                    <Button
                        variant="primary"
                        onclick={crearPago}
                        loading={procesando}
                        fullWidth
                        size="lg"
                    >
                        Generar Recibo de Pago
                    </Button>
                </div>
            </div>
        </div>
    </div>
{:else}
    <!-- INSTRUCCIONES DE PAGO -->
    <div class="max-w-md mx-auto">
        <div
            class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
        >
            <!-- Encabezado de pago -->
            <div class="bg-gray-50 p-6 text-center border-b border-gray-100">
                <Badge variant="yellow" class="mb-3">Pendiente de pago</Badge>
                <p class="text-gray-600 text-sm font-medium mb-1">
                    Monto exacto a transferir
                </p>
                <p class="text-4xl font-extrabold text-gray-900">
                    {formatCurrency(Number(pagoActual.monto))}
                </p>
            </div>

            <!-- Cuerpo del pago -->
            <div class="p-6 md:p-8 bg-white">
                <div class="space-y-6">
                    {#if pagoActual.metodoPago === "nequi"}
                        <div class="text-center">
                            <div
                                class="w-16 h-16 bg-[#251d48] rounded-2xl mx-auto flex items-center justify-center p-3 mb-4 shadow-sm"
                            >
                                <svg
                                    viewBox="4.86 5.41 559.65 132.36"
                                    class="w-full h-full"
                                    ><path
                                        d="m32.44 30.19c.73-.6 1.47-1.19 2.2-1.79.58-.03 1.14-.07 1.06-.89l-.05.06c9.45-3.76 18.12-9.03 26.92-14.04l1.25-.03c12.32 5.87 24.91 11.09 37.68 15.88.56.39 1.13.77 1.69 1.16 6.99 8.99 14.48 17.54 22.09 26l.15.94c-3.9 11.81-6.79 23.9-9.78 35.97-.32.6-.63 1.19-.95 1.79-9.47 10.39-18.95 20.78-28.42 31.17-.6-.24-1.23-.44-1.8-.73-13.33-6.92-26.65-13.85-39.97-20.78-.66-.5-1.31-1-1.97-1.5-.03-.64-.31-1.04-1.01-1.03l.04.04c-.07-1.63-1.34-2.6-2.16-3.8-8.81-12.97-18.64-25.22-26.87-38.59 2.13-3.13 4.34-6.2 6.36-9.4 4.36-6.91 10.16-12.87 13.54-20.43z"
                                        fill="#40bacd"
                                    /></svg
                                >
                            </div>
                            <h3 class="font-bold text-gray-900 text-lg mb-1">
                                Envía por Nequi
                            </h3>
                            <p class="text-sm text-gray-500 mb-4">
                                Abre la app de Nequi y envía el dinero al
                                siguiente número:
                            </p>

                            <div
                                class="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors"
                                onclick={() =>
                                    copiar("302260062", "Número copiado")}
                            >
                                <div>
                                    <p
                                        class="text-xs text-gray-500 font-medium"
                                    >
                                        Celular Nequi
                                    </p>
                                    <p
                                        class="text-xl font-mono font-bold text-gray-900 tracking-wider"
                                    >
                                        302 260 062
                                    </p>
                                </div>
                                <div
                                    class="text-primary-600 group-hover:scale-110 transition-transform"
                                >
                                    <svg
                                        class="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        ><path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        /></svg
                                    >
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>

                <hr class="border-gray-200 border-dashed my-6" />

                <div class="space-y-4">
                    <div class="bg-gray-50 rounded-lg p-3">
                        <label
                            for="comprobante"
                            class="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2"
                        >
                            Comprobante (Opcional)
                        </label>
                        <Input
                            id="comprobante"
                            bind:value={comprobanteUrl}
                            placeholder="Enlace a la imagen o captura de pantalla"
                            class="bg-white"
                        />
                        <p class="text-[11px] text-gray-500 mt-2">
                            Puedes adjuntar un enlace a la captura del pago para
                            acelerar la verificación.
                        </p>
                    </div>

                    <div class="pt-2">
                        <Button
                            variant="primary"
                            onclick={confirmarPago}
                            loading={procesando}
                            fullWidth
                            size="lg"
                        >
                            Confirmar que ya pagué
                        </Button>
                    </div>
                </div>
            </div>
            <div class="bg-gray-50 p-4 text-center border-t border-gray-100">
                <button
                    type="button"
                    class="text-sm font-medium text-gray-500 hover:text-gray-800 underline"
                    onclick={cambiarPlan}
                >
                    ← Cancelar y cambiar de plan
                </button>
            </div>
        </div>
    </div>
{/if}
