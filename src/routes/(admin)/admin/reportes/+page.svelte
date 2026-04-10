<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Button from "$components/ui/Button.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import Select from "$components/ui/Select.svelte";
    import Input from "$components/ui/Input.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import { reportesApi } from "$api/reportes";
    import { toastStore } from "$stores/toast.store";
    import {
        formatCurrency,
        formatFecha,
        fechaISO,
        inicioMes,
    } from "$utils/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let tab: "ventas" | "productos" | "cxc" = "ventas";
    let desde = inicioMes();
    let hasta = fechaISO();
    let agrupacion = "dia";
    let cargando = false;

    // Ventas
    let datosVentas: any[] = [];
    let totalVentas = 0;

    // Top productos
    let topProductos: any[] = [];

    // CxC
    let cxc: any[] = [];

    async function cargarVentas() {
        cargando = true;
        try {
            const res = await reportesApi.ventas(
                { desde, hasta, agrupacion: agrupacion as any },
                accessToken,
            );
            datosVentas = Array.isArray(res) ? res : [];
            totalVentas = datosVentas.reduce(
                (s: number, d: any) => s + (d.monto ?? 0),
                0,
            );
        } catch {
            toastStore.error("Error al cargar reporte de ventas");
        } finally {
            cargando = false;
        }
    }

    async function cargarTopProductos() {
        cargando = true;
        try {
            const res = await reportesApi.topProductos(
                { desde, hasta, top: 20 },
                accessToken,
            );
            topProductos = Array.isArray(res) ? res : [];
        } catch {
            toastStore.error("Error al cargar top productos");
        } finally {
            cargando = false;
        }
    }

    async function cargarCxC() {
        cargando = true;
        try {
            const res = await reportesApi.cuentasPorCobrar(accessToken);
            cxc = Array.isArray(res) ? res : [];
        } catch {
            toastStore.error("Error al cargar cuentas por cobrar");
        } finally {
            cargando = false;
        }
    }

    function cargarTab() {
        if (tab === "ventas") cargarVentas();
        else if (tab === "productos") cargarTopProductos();
        else cargarCxC();
    }

    onMount(cargarTab);

    $: maxBarra =
        topProductos.length > 0
            ? Math.max(
                  ...topProductos.map(
                      (p: any) => p.cantidadVendida ?? p.cantidad ?? 0,
                  ),
                  1,
              )
            : 1;
</script>

<svelte:head><title>Reportes — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Reportes" />

<!-- Tabs -->
<div class="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
    {#each [{ key: "ventas", label: "Ventas por período" }, { key: "productos", label: "Top productos" }, { key: "cxc", label: "Cuentas por cobrar" }] as t}
        <button
            class="px-4 py-2 text-sm font-medium rounded-md transition-colors {tab ===
            t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'}"
            onclick={() => {
                tab = t.key;
                cargarTab();
            }}
        >
            {t.label}
        </button>
    {/each}
</div>

<!-- Filtros de fecha (para ventas y productos) -->
{#if tab !== "cxc"}
    <div class="flex flex-wrap items-end gap-3 mb-4">
        <Input label="Desde" type="date" bind:value={desde} />
        <Input label="Hasta" type="date" bind:value={hasta} />
        {#if tab === "ventas"}
            <Select
                label="Agrupar por"
                options={[
                    { value: "dia", label: "Día" },
                    { value: "semana", label: "Semana" },
                    { value: "mes", label: "Mes" },
                ]}
                bind:value={agrupacion}
            />
        {/if}
        <Button variant="primary" onclick={cargarTab} loading={cargando}>
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
            </svg>
            Generar
        </Button>
    </div>
{/if}

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else}
    <!-- Tab Ventas -->
    {#if tab === "ventas"}
        {#if datosVentas.length === 0}
            <p class="text-sm text-gray-400 text-center py-12">
                Sin datos para el período seleccionado
            </p>
        {:else}
            <div class="card mb-4">
                <div class="card-body">
                    <p class="text-sm text-gray-500">Total del período</p>
                    <p class="text-3xl font-bold text-gray-900">
                        {formatCurrency(totalVentas)}
                    </p>
                </div>
            </div>
            <div class="table-container">
                <table class="table w-full text-sm">
                    <thead>
                        <tr>
                            <th>Período</th>
                            <th class="text-right">Cantidad</th>
                            <th class="text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each datosVentas as d}
                            <tr>
                                <td
                                    >{d.fecha
                                        ? formatFecha(d.fecha)
                                        : (d.periodo ?? "—")}</td
                                >
                                <td class="text-right">{d.cantidad ?? 0}</td>
                                <td class="text-right font-semibold"
                                    >{formatCurrency(d.monto ?? 0)}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}

    <!-- Tab Top Productos -->
    {#if tab === "productos"}
        {#if topProductos.length === 0}
            <p class="text-sm text-gray-400 text-center py-12">
                Sin datos para el período seleccionado
            </p>
        {:else}
            <div class="space-y-2">
                {#each topProductos as p, i}
                    <div class="card">
                        <div class="card-body py-3 flex items-center gap-4">
                            <span
                                class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500"
                            >
                                {i + 1}
                            </span>
                            <div class="flex-1 min-w-0">
                                <p
                                    class="text-sm font-medium text-gray-900 truncate"
                                >
                                    {p.productoNombre ?? p.nombre}
                                </p>
                                <p class="text-xs text-gray-400">
                                    {p.productoSku ?? p.sku ?? ""}
                                </p>
                            </div>
                            <div class="text-right">
                                <p class="text-sm font-semibold">
                                    {p.cantidadVendida ?? p.cantidad ?? 0} uds
                                </p>
                                <p class="text-xs text-gray-400">
                                    {formatCurrency(
                                        p.montoTotal ?? p.monto ?? 0,
                                    )}
                                </p>
                            </div>
                            <div
                                class="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"
                            >
                                <div
                                    class="h-full bg-primary-400 rounded-full"
                                    style="width: {((p.cantidadVendida ??
                                        p.cantidad ??
                                        0) /
                                        maxBarra) *
                                        100}%"
                                ></div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}

    <!-- Tab CxC -->
    {#if tab === "cxc"}
        {#if cxc.length === 0}
            <p class="text-sm text-gray-400 text-center py-12">
                No hay cuentas por cobrar
            </p>
        {:else}
            <div class="table-container">
                <table class="table w-full text-sm">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>RUC/Cédula</th>
                            <th class="text-right">Deuda total</th>
                            <th class="text-right">Límite</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each cxc as c}
                            <tr class="hover:bg-gray-50">
                                <td class="font-medium"
                                    >{c.clienteNombre ?? c.nombre}</td
                                >
                                <td class="font-mono text-xs"
                                    >{c.rucCedula ?? "—"}</td
                                >
                                <td
                                    class="text-right font-semibold text-danger-600"
                                    >{formatCurrency(
                                        c.saldoCredito ?? c.deuda ?? 0,
                                    )}</td
                                >
                                <td class="text-right"
                                    >{formatCurrency(c.limiteCredito ?? 0)}</td
                                >
                                <td>
                                    <Badge
                                        variant={(c.saldoCredito ??
                                            c.deuda ??
                                            0) > (c.limiteCredito ?? 0)
                                            ? "red"
                                            : "yellow"}
                                    >
                                        {(c.saldoCredito ?? c.deuda ?? 0) >
                                        (c.limiteCredito ?? 0)
                                            ? "Excedido"
                                            : "Pendiente"}
                                    </Badge>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    {/if}
{/if}
