<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import Select from "$components/ui/Select.svelte";
    import Input from "$components/ui/Input.svelte";
    import Button from "$components/ui/Button.svelte";
    import { ventasApi, type FiltroVentas } from "$api/ventas";
    import { usuariosApi } from "$api/usuarios";
    import { toastStore } from "$stores/toast.store";
    import {
        formatCurrency,
        formatFechaHora,
        fechaISO,
        inicioMes,
    } from "$utils/index";
    import type { Venta, Usuario } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let ventas: Venta[] = [];
    let total = 0;
    let cargando = true;
    let pagina = 1;

    let busqueda = "";
    let estado = "";
    let formaPago = "";
    let desde = inicioMes();
    let hasta = fechaISO();
    let usuarioId = "";

    let usuarios: Usuario[] = [];
    let mostrarFiltros = false;

    // Detalle
    let ventaDetalle: Venta | null = null;

    // Anulación
    let ventaAnular: Venta | null = null;
    let motivoAnulacion = "";
    let anulando = false;

    const estadoConfig: Record<
        string,
        {
            variant: "green" | "yellow" | "red" | "gray";
            label: string;
            icon: string;
        }
    > = {
        pagada: {
            variant: "green",
            label: "Pagada",
            icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        pendiente: {
            variant: "yellow",
            label: "Pendiente",
            icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        },
        credito: {
            variant: "yellow",
            label: "Crédito",
            icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
        },
        anulada: {
            variant: "red",
            label: "Anulada",
            icon: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
        },
    };

    const pagoIcono: Record<string, string> = {
        efectivo:
            "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z",
        tarjeta:
            "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
        transferencia: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
        credito: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        mixto: "M4 6h16M4 10h16M4 14h16M4 18h16",
    };

    // KPIs derivados
    $: totalMonto = ventas.reduce(
        (s, v) => s + (v.estado !== "anulada" ? v.total : 0),
        0,
    );
    $: ventasPagadas = ventas.filter((v) => v.estado === "pagada").length;
    $: ventasPendientes = ventas.filter(
        (v) => v.estado === "pendiente" || v.estado === "credito",
    ).length;
    $: ventasAnuladas = ventas.filter((v) => v.estado === "anulada").length;
    $: ticketPromedio = ventasPagadas > 0 ? totalMonto / ventasPagadas : 0;

    async function cargar() {
        cargando = true;
        try {
            const filtros: FiltroVentas = { page: pagina, limit: 20 };
            if (busqueda) filtros.q = busqueda;
            if (estado) filtros.estado = estado;
            if (formaPago) filtros.formaPago = formaPago;
            if (desde) filtros.desde = desde;
            if (hasta) filtros.hasta = hasta;
            if (usuarioId) filtros.usuarioId = usuarioId;
            const res = await ventasApi.listar(filtros, accessToken);
            ventas = res.data;
            total = res.total;
        } catch {
            toastStore.error("Error al cargar ventas");
        } finally {
            cargando = false;
        }
    }

    onMount(async () => {
        try {
            const res = await usuariosApi.listar({ limit: "100" }, accessToken);
            usuarios = res.data;
        } catch {
            /* ignore */
        }
        cargar();
    });

    async function anular() {
        if (!ventaAnular || !motivoAnulacion.trim()) return;
        anulando = true;
        try {
            await ventasApi.anular(
                ventaAnular.id,
                motivoAnulacion,
                true,
                accessToken,
            );
            toastStore.exito("Venta anulada");
            ventaAnular = null;
            motivoAnulacion = "";
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al anular");
        } finally {
            anulando = false;
        }
    }

    function limpiarFiltros() {
        busqueda = "";
        estado = "";
        formaPago = "";
        desde = inicioMes();
        hasta = fechaISO();
        usuarioId = "";
        pagina = 1;
        cargar();
    }

    async function verDetalle(v: Venta) {
        try {
            ventaDetalle = await ventasApi.obtener(v.id, accessToken);
            console.log(ventaDetalle);
        } catch {
            ventaDetalle = v;
        }
    }

    $: opcionesUsuario = [
        { value: "", label: "Todos los cajeros" },
        ...usuarios.map((u) => ({ value: u.id, label: u.nombre })),
    ];

    $: hayFiltrosActivos =
        busqueda ||
        estado ||
        formaPago ||
        usuarioId ||
        desde !== inicioMes() ||
        hasta !== fechaISO();
</script>

<svelte:head><title>Ventas — FerreControl</title></svelte:head>

<!-- Header -->
<div class="flex items-center justify-between mb-6">
    <div>
        <h1 class="text-xl font-bold text-gray-900">Ventas</h1>
        <p class="text-sm text-gray-400 mt-0.5">
            Registro y gestión de transacciones
        </p>
    </div>
    <div class="flex items-center gap-2">
        {#if hayFiltrosActivos}
            <button
                onclick={limpiarFiltros}
                class="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
                Limpiar filtros
            </button>
        {/if}
        <button
            class="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl transition-all
                {mostrarFiltros
                ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:ring-gray-300 hover:bg-gray-50'}"
            onclick={() => (mostrarFiltros = !mostrarFiltros)}
        >
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
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
            </svg>
            Filtros
            {#if hayFiltrosActivos}
                <span class="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            {/if}
        </button>
    </div>
</div>

<!-- KPI Cards -->
{#if !cargando && ventas.length > 0}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div
            class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 p-4 text-white"
        >
            <div class="relative z-10">
                <p class="text-xs font-medium text-white/80">Monto total</p>
                <p class="text-2xl font-bold mt-1">
                    {formatCurrency(totalMonto)}
                </p>
                <p class="text-xs text-white/70 mt-1">
                    {total} transacciones
                </p>
            </div>
            <div class="absolute -right-2 -bottom-2 opacity-10">
                <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                    <path
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
        </div>
        <div class="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
            <div class="flex items-center gap-2 mb-2">
                <div
                    class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center"
                >
                    <svg
                        class="w-3.5 h-3.5 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12l2 2 4-4"
                        />
                    </svg>
                </div>
                <span class="text-xs font-medium text-gray-400">Pagadas</span>
            </div>
            <p class="text-2xl font-bold text-gray-900">{ventasPagadas}</p>
        </div>
        <div class="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
            <div class="flex items-center gap-2 mb-2">
                <div
                    class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center"
                >
                    <svg
                        class="w-3.5 h-3.5 text-amber-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <span class="text-xs font-medium text-gray-400">Pendientes</span
                >
            </div>
            <p class="text-2xl font-bold text-gray-900">{ventasPendientes}</p>
        </div>
        <div class="rounded-2xl bg-white ring-1 ring-gray-100 p-4">
            <div class="flex items-center gap-2 mb-2">
                <div
                    class="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center"
                >
                    <svg
                        class="w-3.5 h-3.5 text-violet-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
                <span class="text-xs font-medium text-gray-400"
                    >Ticket promedio</span
                >
            </div>
            <p class="text-2xl font-bold text-gray-900">
                {formatCurrency(ticketPromedio)}
            </p>
        </div>
    </div>
{/if}

<!-- Search bar -->
<div class="flex flex-wrap items-center gap-3 mb-4">
    <div class="flex-1 min-w-[240px] max-w-md">
        <SearchInput
            value={busqueda}
            placeholder="Buscar por N° factura o cliente..."
            on:search={(e) => {
                busqueda = e.detail;
                pagina = 1;
                cargar();
            }}
        />
    </div>
    <!-- Quick estado pills -->
    <div class="flex items-center gap-1.5">
        {#each [{ value: "", label: "Todas" }, { value: "pagada", label: "Pagadas" }, { value: "pendiente", label: "Pendientes" }, { value: "anulada", label: "Anuladas" }] as opt}
            <button
                class="px-3 py-1.5 text-xs font-medium rounded-full transition-all
                    {estado === opt.value
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}"
                onclick={() => {
                    estado = opt.value;
                    pagina = 1;
                    cargar();
                }}
            >
                {opt.label}
            </button>
        {/each}
    </div>
</div>

<!-- Panel de filtros expandible -->
{#if mostrarFiltros}
    <div class="rounded-2xl bg-white ring-1 ring-gray-100 p-4 mb-4 animate-in">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Input label="Desde" type="date" bind:value={desde} />
            <Input label="Hasta" type="date" bind:value={hasta} />
            <Select
                label="Estado"
                options={[
                    { value: "", label: "Todos" },
                    { value: "pagada", label: "Pagada" },
                    { value: "pendiente", label: "Pendiente" },
                    { value: "credito", label: "Crédito" },
                    { value: "anulada", label: "Anulada" },
                ]}
                bind:value={estado}
            />
            <Select
                label="Forma de pago"
                options={[
                    { value: "", label: "Todas" },
                    { value: "efectivo", label: "Efectivo" },
                    { value: "tarjeta", label: "Tarjeta" },
                    { value: "transferencia", label: "Transferencia" },
                    { value: "credito", label: "Crédito" },
                    { value: "mixto", label: "Mixto" },
                ]}
                bind:value={formaPago}
            />
            <Select
                label="Cajero"
                options={opcionesUsuario}
                bind:value={usuarioId}
            />
        </div>
        <div class="flex gap-2 mt-3">
            <Button
                variant="primary"
                size="sm"
                onclick={() => {
                    pagina = 1;
                    cargar();
                }}
            >
                Aplicar filtros
            </Button>
            <Button variant="ghost" size="sm" onclick={limpiarFiltros}
                >Limpiar</Button
            >
        </div>
    </div>
{/if}

<!-- Contenido principal -->
{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if ventas.length === 0}
    <EmptyState
        titulo="Sin ventas"
        descripcion="No se encontraron ventas con los filtros aplicados"
        icono="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
{:else}
    <!-- Tabla de ventas -->
    <div class="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden">
        <table class="w-full text-sm">
            <thead>
                <tr class="border-b border-gray-100">
                    <th
                        class="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"
                        >Factura</th
                    >
                    <th
                        class="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"
                        >Cliente</th
                    >
                    <th
                        class="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 hidden md:table-cell"
                        >Cajero</th
                    >
                    <th
                        class="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"
                        >Total</th
                    >
                    <th
                        class="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 hidden sm:table-cell"
                        >Pago</th
                    >
                    <th
                        class="text-center text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"
                        >Estado</th
                    >
                    <th
                        class="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3 hidden lg:table-cell"
                        >Fecha</th
                    >
                    <th
                        class="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"
                    ></th>
                </tr>
            </thead>
            <tbody>
                {#each ventas as v, i}
                    <tr
                        class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onclick={() => verDetalle(v)}
                    >
                        <td class="px-4 py-3.5">
                            <span
                                class="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md"
                            >
                                {v.numeroFactura}
                            </span>
                        </td>
                        <td class="px-4 py-3.5">
                            <div>
                                <p class="text-sm font-medium text-gray-800">
                                    {v.cliente?.nombre ?? "Consumidor final"}
                                </p>
                                <p class="text-xs text-gray-400">
                                    {v.items?.length ?? 0} producto{(v.items
                                        ?.length ?? 0) !== 1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>
                        </td>
                        <td class="px-4 py-3.5 hidden md:table-cell">
                            <div class="flex items-center gap-2">
                                <div
                                    class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500"
                                >
                                    {v.usuario?.nombre
                                        ?.charAt(0)
                                        ?.toUpperCase() ?? "?"}
                                </div>
                                <span class="text-xs text-gray-500"
                                    >{v.usuario?.nombre}</span
                                >
                            </div>
                        </td>
                        <td class="px-4 py-3.5 text-right">
                            <span class="text-sm font-bold text-gray-900"
                                >{formatCurrency(v.total)}</span
                            >
                        </td>
                        <td
                            class="px-4 py-3.5 text-center hidden sm:table-cell"
                        >
                            <div
                                class="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 text-gray-500"
                                title={v.formaPago}
                            >
                                <svg
                                    class="w-3.5 h-3.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d={pagoIcono[v.formaPago] ??
                                            pagoIcono.efectivo}
                                    />
                                </svg>
                                <span class="text-xs capitalize"
                                    >{v.formaPago.replace("_", " ")}</span
                                >
                            </div>
                        </td>
                        <td class="px-4 py-3.5 text-center">
                            <Badge
                                variant={(
                                    estadoConfig[v.estado] ?? {
                                        variant: "gray",
                                    }
                                ).variant}
                                dot
                            >
                                {(estadoConfig[v.estado] ?? { label: v.estado })
                                    .label}
                            </Badge>
                        </td>
                        <td class="px-4 py-3.5 hidden lg:table-cell">
                            <span class="text-xs text-gray-400"
                                >{formatFechaHora(v.createdAt)}</span
                            >
                        </td>
                        <td class="px-4 py-3.5 text-right">
                            <div class="flex items-center justify-end gap-1">
                                {#if v.estado !== "anulada"}
                                    <button
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            ventaAnular = v;
                                            motivoAnulacion = "";
                                        }}
                                        class="p-1.5 rounded-lg text-gray-300 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                                        title="Anular venta"
                                    >
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
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                {/if}
                                <button
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        verDetalle(v);
                                    }}
                                    class="p-1.5 rounded-lg text-gray-300 hover:text-primary-500 hover:bg-primary-50 transition-colors"
                                    title="Ver detalle"
                                >
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
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="mt-4">
        <Pagination {total} bind:currentPage={pagina} />
    </div>
{/if}

<!-- Panel lateral detalle de venta -->
{#if ventaDetalle}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 z-40 flex justify-end"
        onkeydown={(e) => e.key === "Escape" && (ventaDetalle = null)}
    >
        <!-- Overlay -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div
            class="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onclick={() => (ventaDetalle = null)}
        ></div>

        <!-- Panel -->
        <div
            class="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in"
        >
            <!-- Cabecera -->
            <div
                class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
            >
                <div>
                    <h2 class="text-base font-bold text-gray-900">
                        Detalle de venta
                    </h2>
                    <p class="text-xs text-gray-400 mt-0.5 font-mono">
                        {ventaDetalle.numeroFactura}
                    </p>
                </div>
                <button
                    onclick={() => (ventaDetalle = null)}
                    class="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    title="Cerrar"
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
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                <!-- Estado badge grande -->
                <div class="flex items-center justify-between">
                    <Badge
                        variant={(
                            estadoConfig[ventaDetalle.estado] ?? {
                                variant: "gray",
                            }
                        ).variant}
                        dot
                    >
                        {(
                            estadoConfig[ventaDetalle.estado] ?? {
                                label: ventaDetalle.estado,
                            }
                        ).label}
                    </Badge>
                    <span class="text-xs text-gray-400"
                        >{formatFechaHora(ventaDetalle.createdAt)}</span
                    >
                </div>

                <!-- Info general -->
                <div class="rounded-xl bg-gray-50 p-4 space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Cliente</span>
                        <span class="font-medium text-gray-700"
                            >{ventaDetalle.cliente?.nombre ??
                                "Consumidor final"}</span
                        >
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Cajero</span>
                        <span class="font-medium text-gray-700"
                            >{ventaDetalle.usuario?.nombre}</span
                        >
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-gray-400">Forma de pago</span>
                        <span class="font-medium text-gray-700 capitalize"
                            >{ventaDetalle.formaPago.replace("_", " ")}</span
                        >
                    </div>
                </div>

                <!-- Items -->
                <div>
                    <h3
                        class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3"
                    >
                        Productos
                    </h3>
                    <div class="space-y-2">
                        {#each ventaDetalle.items ?? [] as item}
                            <div
                                class="flex items-center justify-between py-2 px-3 rounded-lg bg-white ring-1 ring-gray-100"
                            >
                                <div class="flex-1 min-w-0">
                                    <p
                                        class="text-sm font-medium text-gray-800 truncate"
                                    >
                                        {item.producto?.nombre ?? "Producto"}
                                    </p>
                                    <p class="text-xs text-gray-400">
                                        {item.cantidad} × {formatCurrency(
                                            item.precioUnitario,
                                        )}
                                    </p>
                                </div>
                                <span
                                    class="text-sm font-semibold text-gray-900 ml-3"
                                    >{formatCurrency(item.subtotal)}</span
                                >
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Totales -->
                <div class="rounded-xl bg-gray-900 text-white p-4 space-y-2">
                    <div class="flex justify-between text-sm text-gray-300">
                        <span>Subtotal</span>
                        <span>{formatCurrency(ventaDetalle.subtotal)}</span>
                    </div>
                    {#if ventaDetalle.descuento > 0}
                        <div class="flex justify-between text-sm text-gray-300">
                            <span>Descuento</span>
                            <span
                                >-{formatCurrency(ventaDetalle.descuento)}</span
                            >
                        </div>
                    {/if}
                    <div class="flex justify-between text-sm text-gray-300">
                        <span>IVA</span>
                        <span>{formatCurrency(ventaDetalle.impuesto)}</span>
                    </div>
                    <div
                        class="flex justify-between text-lg font-bold pt-2 border-t border-gray-700"
                    >
                        <span>Total</span>
                        <span>{formatCurrency(ventaDetalle.total)}</span>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            {#if ventaDetalle.estado !== "anulada"}
                <div class="px-6 py-4 border-t border-gray-100">
                    <button
                        onclick={() => {
                            ventaAnular = ventaDetalle;
                            motivoAnulacion = "";
                            ventaDetalle = null;
                        }}
                        class="w-full py-2.5 text-sm font-medium text-danger-600 bg-danger-50 hover:bg-danger-100 rounded-xl transition-colors"
                    >
                        Anular esta venta
                    </button>
                </div>
            {/if}
        </div>
    </div>
{/if}

<!-- Modal anulación -->
{#if ventaAnular}
    <div
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
    >
        <div
            class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
            <!-- Header rojo -->
            <div class="bg-danger-50 px-5 py-4 flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center"
                >
                    <svg
                        class="w-5 h-5 text-danger-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-semibold text-gray-900">
                        Anular venta
                    </h2>
                    <p class="text-xs text-gray-500 font-mono">
                        {ventaAnular.numeroFactura}
                    </p>
                </div>
            </div>

            <div class="px-5 py-4 space-y-4">
                <p class="text-sm text-gray-500">
                    Esta acción devuelve el stock al inventario y no se puede
                    deshacer.
                </p>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                        Motivo <span class="text-danger-400">*</span>
                    </label>
                    <textarea
                        bind:value={motivoAnulacion}
                        rows="3"
                        class="input resize-none"
                        placeholder="Describe el motivo de la anulación..."
                    ></textarea>
                </div>
            </div>

            <div class="px-5 pb-5 flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (ventaAnular = null)}
                    disabled={anulando}
                >
                    Cancelar
                </Button>
                <Button
                    variant="danger"
                    fullWidth
                    loading={anulando}
                    disabled={!motivoAnulacion.trim()}
                    onclick={anular}
                >
                    Anular venta
                </Button>
            </div>
        </div>
    </div>
{/if}

<style>
    @keyframes slide-in {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .animate-slide-in {
        animation: slide-in 0.25s ease-out;
    }
    @keyframes fade-in-up {
        from {
            opacity: 0;
            transform: translateY(8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-in {
        animation: fade-in-up 0.2s ease-out;
    }
</style>
