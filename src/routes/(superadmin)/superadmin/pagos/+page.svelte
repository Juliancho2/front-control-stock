<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Button from "$components/ui/Button.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import { pagosSuscripcionApi } from "$api/suscripciones";
    import { toastStore } from "$stores/toast.store";
    import { formatCurrency } from "$utils/index";
    import type { PagoSuscripcion } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let pagos: PagoSuscripcion[] = [];
    let cargando = true;
    let procesando: string | null = null;

    let modalRechazarOpen = false;
    let pagoARechazar: string | null = null;
    let observacionesRechazo = "";

    async function cargar() {
        cargando = true;
        try {
            pagos = await pagosSuscripcionApi.listarPendientes(accessToken);
        } catch {
            toastStore.error("Error al cargar pagos");
        } finally {
            cargando = false;
        }
    }

    async function aprobar(id: string) {
        procesando = id;
        try {
            await pagosSuscripcionApi.aprobar(id, accessToken);
            toastStore.exito("Pago aprobado");
            await cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al aprobar");
        } finally {
            procesando = null;
        }
    }

    function abrirModalRechazar(id: string) {
        pagoARechazar = id;
        observacionesRechazo = "";
        modalRechazarOpen = true;
    }

    async function confirmarRechazo() {
        if (!pagoARechazar || !observacionesRechazo.trim()) {
            toastStore.error("Ingresa el motivo del rechazo");
            return;
        }
        procesando = pagoARechazar;
        modalRechazarOpen = false;
        try {
            await pagosSuscripcionApi.rechazar(pagoARechazar, observacionesRechazo, accessToken);
            toastStore.exito("Pago rechazado");
            await cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al rechazar");
        } finally {
            procesando = null;
            pagoARechazar = null;
        }
    }

    onMount(cargar);
</script>

<svelte:head><title>Pagos pendientes — FerreControl</title></svelte:head>

<PageHeader titulo="Pagos de suscripciones" />

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if pagos.length === 0}
    <EmptyState
        titulo="Sin pagos pendientes"
        descripcion="No se encontraron pagos pendientes"
        icono="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Plan</th>
                    <th>Metodo de pago</th>
                    <th>Monto</th>
                    <th>Referencia</th>
                    <th>Estado</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each pagos as p}
                    <tr class="hover:bg-gray-50">
                        <td class="font-medium text-gray-900">{p.tenantNombre}</td>
                        <td>{p.planNombre}</td>
                        <td class="capitalize">{p.metodoPago}</td>
                        <td>{formatCurrency(p.monto)}</td>
                        <td class="text-xs font-mono">{p.referencia}</td>
                        <td>
                            {#if p.estado === "aprobado"}
                                <Badge variant="green">Aprobado</Badge>
                            {:else}
                                <Badge variant="red">Pendiente</Badge>
                            {/if}
                        </td>
                        <td class="text-right">
                            {#if p.estado !== "aprobado"}
                                <div class="flex justify-end gap-2">
                                    <Button size="sm" onclick={() => aprobar(p.id)} loading={procesando === p.id}>
                                        Aprobar
                                    </Button>
                                    <Button size="sm" variant="danger" onclick={() => abrirModalRechazar(p.id)} loading={procesando === p.id}>
                                        Rechazar
                                    </Button>
                                </div>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<Modal bind:open={modalRechazarOpen} title="Rechazar pago" size="sm">
    <p class="text-sm text-gray-600 mb-4">
        ¿Estás seguro de rechazar este pago? El pago será marcado como rechazado.
    </p>

    <Input
        bind:value={observacionesRechazo}
        label="Motivo del rechazo"
        placeholder="Ej: Comprobante inválido, monto incorrecto, etc."
    />

    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalRechazarOpen = false)}>
            Cancelar
        </Button>
        <Button variant="danger" onclick={confirmarRechazo} loading={!!procesando}>
            Rechazar
        </Button>
    </svelte:fragment>
</Modal>