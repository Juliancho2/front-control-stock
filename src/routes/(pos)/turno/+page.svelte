<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import Button from "$components/ui/Button.svelte";
    import Input from "$components/ui/Input.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import {
        turnoStore,
        hayTurnoAbierto,
        turnoActivo,
        toastStore,
        usuarioActual,
    } from "../../../lib/index";
    import { cajaApi } from "$api/caja";
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type { TurnoCaja } from "$types/index";

    export let data;
    const { accessToken } = data;

    let cargando = true;
    let procesando = false;
    let montoApertura = 50000;
    let montoCierre = 0;
    let observaciones = "";
    let cuadre: any = null;
    let errores: Record<string, string> = {};

    function formatMiles(value: number): string {
        return new Intl.NumberFormat("es-CO").format(value);
    }

    function onInputApertura(e: Event) {
        const value = (e.target as HTMLInputElement).value.replace(/\D/g, "");
        montoApertura = Number(value) || 0;
    }

    function onInputCierre(e: Event) {
        const value = (e.target as HTMLInputElement).value.replace(/\D/g, "");
        montoCierre = Number(value) || 0;
    }

    onMount(async () => {
        // El turno ya se inicializa en el layout (+layout.svelte)
        cargando = false;
    });

    async function abrir() {
        errores = {};
        if (montoApertura < 0) {
            errores.montoApertura = "El monto no puede ser negativo";
            return;
        }
        procesando = true;
        try {
            const t = await cajaApi.abrir(
                montoApertura,
                observaciones || undefined,
                accessToken,
            );
            turnoStore.inicializar(t);
            toastStore.exito("Turno abierto correctamente");
            goto("/pos");
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al abrir turno");
        } finally {
            procesando = false;
        }
    }

    async function cerrar() {
        if (!$turnoActivo) return;
        errores = {};
        if (montoCierre < 0) {
            errores.montoCierre = "El monto no puede ser negativo";
            return;
        }
        procesando = true;
        try {
            const res = await cajaApi.cerrar(
                $turnoActivo.id,
                montoCierre,
                observaciones || undefined,
                accessToken,
            );
            cuadre = {
                turno: res,
                diferencia: res.diferencia,
            };
            turnoStore.cerrar();
            toastStore.exito("Turno cerrado. Revisa el cuadre.");
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al cerrar turno");
        } finally {
            procesando = false;
        }
    }
</script>

<svelte:head><title>Turno de caja — FerreControl</title></svelte:head>

<div class="h-full flex items-center justify-center p-6 bg-gray-100">
    <div class="w-full max-w-md">
        {#if cargando}
            <div class="flex justify-center"><Spinner size="lg" /></div>
        {:else if cuadre}
            <!-- Resumen de cierre -->
            <div class="card">
                <div class="card-header flex items-center gap-2">
                    <svg
                        class="w-5 h-5 text-primary-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Turno cerrado — Cuadre de caja
                </div>
                <div class="card-body space-y-3">
                    {#each [{ label: "Fondo de apertura", valor: cuadre.turno.montoApertura }, { label: "Total ventas", valor: cuadre.turno.totalVentas }, { label: "Esperado en caja", valor: cuadre.turno.montoApertura + cuadre.turno.totalVentas }, { label: "Contado en caja", valor: cuadre.turno.montoCierre }] as fila}
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-500">{fila.label}</span>
                            <span class="font-medium text-gray-900"
                                >{formatCurrency(fila.valor)}</span
                            >
                        </div>
                    {/each}

                    <div
                        class="border-t border-gray-100 pt-3 flex justify-between font-semibold"
                    >
                        <span
                            class={cuadre.diferencia >= 0
                                ? "text-primary-700"
                                : "text-danger-600"}
                        >
                            {cuadre.diferencia >= 0 ? "Sobrante" : "Faltante"}
                        </span>
                        <span
                            class={cuadre.diferencia >= 0
                                ? "text-primary-700"
                                : "text-danger-600"}
                        >
                            {formatCurrency(Math.abs(cuadre.diferencia))}
                        </span>
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        onclick={() => {
                            cuadre = null;
                            goto("/pos");
                        }}
                    >
                        Abrir nuevo turno
                    </Button>
                </div>
            </div>
        {:else if $hayTurnoAbierto && $turnoActivo}
            <!-- Cerrar turno -->
            <div class="card">
                <div class="card-header">Cerrar turno de caja</div>
                <div class="card-body space-y-4">
                    <div class="bg-primary-50 rounded-xl p-4 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-primary-700">Cajero</span>
                            <span class="font-medium text-primary-900"
                                >{$turnoActivo?.usuario?.nombre}</span
                            >
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-primary-700">Apertura</span>
                            <span class="font-medium text-primary-900"
                                >{formatFechaHora(
                                    $turnoActivo?.abiertoEn,
                                )}</span
                            >
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-primary-700">Total ventas</span>
                            <span class="font-semibold text-primary-900"
                                >{formatCurrency(
                                    $turnoActivo?.totalVentas,
                                )}</span
                            >
                        </div>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="monto-cierre" class="text-sm font-medium text-gray-700">
                            Monto contado en caja
                        </label>
                        <input
                            id="monto-cierre"
                            type="text"
                            value={formatMiles(montoCierre)}
                            oninput={onInputCierre}
                            class="input text-lg font-semibold"
                            placeholder="0"
                        />
                        <p class="text-xs text-gray-400">Cuenta el efectivo físico en la caja</p>
                    </div>
                    <Input
                        label="Observaciones"
                        bind:value={observaciones}
                        placeholder="Opcional"
                    />

                    <div class="flex gap-3">
                        <Button
                            variant="secondary"
                            fullWidth
                            onclick={() => goto("/pos")}>Cancelar</Button
                        >
                        <Button
                            variant="danger"
                            fullWidth
                            loading={procesando}
                            onclick={cerrar}
                        >
                            Cerrar turno
                        </Button>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Abrir turno -->
            <div class="card">
                <div class="card-header">Abrir turno de caja</div>
                <div class="card-body space-y-4">
                    <p class="text-sm text-gray-500">
                        Ingresa el monto con el que inicia la caja (fondo de
                        cambio).
                    </p>
                    <div class="flex flex-col gap-1">
                        <label for="monto-apertura" class="text-sm font-medium text-gray-700">
                            Fondo de apertura (COP)
                        </label>
                        <input
                            id="monto-apertura"
                            type="text"
                            value={formatMiles(montoApertura)}
                            oninput={onInputApertura}
                            class="input text-lg font-semibold"
                            placeholder="0"
                        />
                        <p class="text-xs text-gray-400">Dinero en efectivo disponible para dar cambio</p>
                    </div>
                    <Input
                        label="Observaciones"
                        bind:value={observaciones}
                        placeholder="Opcional"
                    />

                    <Button
                        variant="primary"
                        fullWidth
                        loading={procesando}
                        onclick={abrir}
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                            />
                        </svg>
                        Abrir turno
                    </Button>
                </div>
            </div>
        {/if}
    </div>
</div>
