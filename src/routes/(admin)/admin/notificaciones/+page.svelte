<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Button from "$components/ui/Button.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import ConfirmDialog from "$components/ui/ConfirmDialog.svelte";
    import { notificacionesStore, misNotificaciones } from "$stores/notificaciones.store";
    import { formatFechaHora } from "$utils/index";

    let cargando = true;
    let confirmandoEliminarTodas = false;
    let eliminandoTodas = false;

    onMount(async () => {
        await notificacionesStore.cargar();
        cargando = false;
    });

    const colores = {
        stock_bajo: "warning",
        sin_stock: "red",
        venta_exitosa: "green",
        error_stock: "red",
        venta_nueva: "primary",
    };

    const iconos = {
        stock_bajo: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
        sin_stock: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
        venta_exitosa: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        error_stock: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        venta_nueva: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    };

    async function marcarComoLeida(id: string) {
        await notificacionesStore.marcarLeida(id);
    }

    async function marcarTodasLeidas() {
        await notificacionesStore.marcarTodasLeidas();
    }

    async function eliminar(id: string) {
        await notificacionesStore.eliminar(id);
    }

    async function eliminarTodas() {
        eliminandoTodas = true;
        try {
            await notificacionesStore.eliminarTodas();
            confirmandoEliminarTodas = false;
        } finally {
            eliminandoTodas = false;
        }
    }
</script>

<svelte:head><title>Notificaciones — FerreControl</title></svelte:head>

<div class="h-full overflow-y-auto p-2 sm:p-4">
    <div class="space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-10">
    <PageHeader titulo="Todas las notificaciones">
        <div class="flex gap-2">
            <Button variant="secondary" size="sm" onclick={marcarTodasLeidas}>
                <span class="hidden sm:inline">Marcar todas como leídas</span>
                <span class="sm:hidden">Leídas</span>
            </Button>
            <Button variant="danger" size="sm" onclick={() => confirmandoEliminarTodas = true}>
                <span class="hidden sm:inline">Eliminar todas</span>
                <span class="sm:hidden">Eliminar</span>
            </Button>
        </div>
    </PageHeader>

    {#if cargando}
        <div class="flex items-center justify-center py-20">
            <Spinner size="lg" />
        </div>
    {:else if $misNotificaciones.length === 0}
        <EmptyState
            titulo="Sin notificaciones"
            descripcion="No tienes notificaciones pendientes por ahora."
            icono="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
    {:else}
        <div class="grid gap-3">
            {#each $misNotificaciones as n}
                <div 
                    class="bg-white rounded-2xl p-3 sm:p-4 ring-1 ring-gray-100 flex items-start gap-3 sm:gap-4 transition-all hover:ring-gray-200"
                    class:opacity-60={n.leida}
                    class:bg-gray-50={n.leida}
                >
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 
                        {n.tipo === 'stock_bajo' ? 'bg-amber-50 text-amber-600' : 
                         n.tipo === 'sin_stock' ? 'bg-red-50 text-red-600' :
                         n.tipo === 'venta_exitosa' ? 'bg-emerald-50 text-emerald-600' :
                         n.tipo === 'venta_nueva' ? 'bg-primary-50 text-primary-600' : 'bg-gray-50 text-gray-600'}"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconos[n.tipo] || "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
                        </svg>
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <h3 class="text-sm font-semibold text-gray-900 truncate">
                                {n.titulo}
                            </h3>
                            <span class="text-[10px] text-gray-400">
                                {formatFechaHora(n.createdAt)}
                            </span>
                        </div>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            {n.mensaje}
                        </p>
                        
                        {#if !n.leida}
                            <button 
                                onclick={() => marcarComoLeida(n.id)}
                                class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                                Marcar como leída
                            </button>
                        {/if}
                        <button 
                            onclick={() => eliminar(n.id)}
                            class="mt-2 text-xs text-gray-400 hover:text-danger-500 font-medium ml-3"
                        >
                            Eliminar
                        </button>
                    </div>

                    {#if !n.leida}
                        <div class="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    </div>
</div>

<ConfirmDialog
    bind:open={confirmandoEliminarTodas}
    titulo="Eliminar todas las notificaciones"
    mensaje="¿Estás seguro de que deseas eliminar todas las notificaciones? Esta acción no se puede deshacer."
    labelConfirmar="Eliminar todas"
    cargando={eliminandoTodas}
    on:confirmar={eliminarTodas}
/>
