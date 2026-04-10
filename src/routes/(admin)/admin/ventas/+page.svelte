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

    // Anulación
    let ventaAnular: Venta | null = null;
    let motivoAnulacion = "";
    let anulando = false;

    const estadoColor: Record<string, "green" | "yellow" | "red" | "gray"> = {
        pagada: "green",
        pendiente: "yellow",
        credito: "yellow",
        anulada: "red",
    };

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

    $: opcionesUsuario = [
        { value: "", label: "Todos los cajeros" },
        ...usuarios.map((u) => ({ value: u.id, label: u.nombre })),
    ];
</script>

<svelte:head><title>Ventas — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Ventas">
    <button
        class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
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
    </button>
</PageHeader>

<!-- Filtros -->
<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1 min-w-[200px] max-w-sm">
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
</div>

{#if mostrarFiltros}
    <div class="card mb-4">
        <div class="card-body">
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
                    }}>Aplicar filtros</Button
                >
                <Button variant="ghost" size="sm" onclick={limpiarFiltros}
                    >Limpiar</Button
                >
            </div>
        </div>
    </div>
{/if}

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
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>Factura</th>
                    <th>Cliente</th>
                    <th>Cajero</th>
                    <th>Items</th>
                    <th class="text-right">Total</th>
                    <th>Pago</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each ventas as v}
                    <tr class="hover:bg-gray-50">
                        <td class="font-mono text-xs">{v.numeroFactura}</td>
                        <td class="text-xs"
                            >{v.clienteNombre ?? "Consumidor final"}</td
                        >
                        <td class="text-xs">{v.usuarioNombre}</td>
                        <td class="text-center">{v.items?.length ?? 0}</td>
                        <td class="text-right font-semibold"
                            >{formatCurrency(v.total)}</td
                        >
                        <td class="capitalize text-xs"
                            >{v.formaPago.replace("_", " ")}</td
                        >
                        <td
                            ><Badge
                                variant={estadoColor[v.estado] ?? "gray"}
                                dot>{v.estado}</Badge
                            ></td
                        >
                        <td class="text-xs text-gray-400"
                            >{formatFechaHora(v.createdAt)}</td
                        >
                        <td class="text-right">
                            {#if v.estado !== "anulada"}
                                <button
                                    onclick={() => {
                                        ventaAnular = v;
                                        motivoAnulacion = "";
                                    }}
                                    class="text-xs text-danger-500 hover:underline"
                                    >Anular</button
                                >
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <Pagination {total} bind:currentPage={pagina} />
{/if}

<!-- Modal anulación -->
{#if ventaAnular}
    <div
        class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4"
        >
            <h2 class="text-base font-semibold text-gray-900">
                Anular venta {ventaAnular.numeroFactura}
            </h2>
            <p class="text-sm text-gray-500">
                Esta acción devuelve el stock al inventario.
            </p>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Motivo <span class="text-danger-400">*</span></label
                >
                <textarea
                    bind:value={motivoAnulacion}
                    rows="3"
                    class="input resize-none"
                    placeholder="Describe el motivo..."
                />
            </div>
            <div class="flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (ventaAnular = null)}
                    disabled={anulando}>Cancelar</Button
                >
                <Button
                    variant="danger"
                    fullWidth
                    loading={anulando}
                    disabled={!motivoAnulacion.trim()}
                    onclick={anular}>Anular venta</Button
                >
            </div>
        </div>
    </div>
{/if}
