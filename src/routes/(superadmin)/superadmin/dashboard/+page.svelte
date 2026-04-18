<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import { tenantsApi } from "$api/tenants";
    import { toastStore } from "$stores/toast.store";
    import { formatFechaHora } from "$utils/index";
    import type { Tenant } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let cargando = true;
    let stats = {
        totalTenants: 0,
        tenantsActivos: 0,
        tenantsInactivos: 0,
        totalPlanes: 0,
        tenantsPorPlan: [] as { plan: string; cantidad: number }[],
        ultimosTenants: [] as Tenant[],
    };

    async function cargar() {
        cargando = true;
        try {
            stats = await tenantsApi.dashboard(accessToken);
        } catch {
            toastStore.error("Error al cargar el dashboard");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);
</script>

<PageHeader titulo="Dashboard" subtitulo="Vista general de la plataforma" />

{#if cargando}
    <div class="flex justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else}
    <!-- Tarjetas de métricas -->
    <div
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8"
    >
        <div
            class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
        >
            <div class="flex items-center gap-4">
                <div
                    class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center"
                >
                    <svg
                        class="w-6 h-6 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Total Tenants</p>
                    <p class="text-2xl font-bold text-gray-900">
                        {stats.totalTenants}
                    </p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-4">
                <div
                    class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center"
                >
                    <svg
                        class="w-6 h-6 text-green-600"
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
                </div>
                <div>
                    <p class="text-sm text-gray-500">Activos</p>
                    <p class="text-2xl font-bold text-green-600">
                        {stats.tenantsActivos}
                    </p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-4">
                <div
                    class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center"
                >
                    <svg
                        class="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                    </svg>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Inactivos</p>
                    <p class="text-2xl font-bold text-red-600">
                        {stats.tenantsInactivos}
                    </p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-4">
                <div
                    class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center"
                >
                    <svg
                        class="w-6 h-6 text-purple-600"
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
                <div>
                    <p class="text-sm text-gray-500">Planes</p>
                    <p class="text-2xl font-bold text-purple-600">
                        {stats.totalPlanes}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Distribución por plan -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
                Distribución por Plan
            </h3>
            {#if stats.tenantsPorPlan.length === 0}
                <p class="text-gray-500 text-sm">Sin datos</p>
            {:else}
                <div class="space-y-3">
                    {#each stats.tenantsPorPlan as item}
                        {@const porcentaje =
                            stats.totalTenants > 0
                                ? Math.round(
                                      (item.cantidad / stats.totalTenants) *
                                          100,
                                  )
                                : 0}
                        <div>
                            <div class="flex justify-between text-sm mb-1">
                                <span class="font-medium text-gray-700"
                                    >{item.plan}</span
                                >
                                <span class="text-gray-500"
                                    >{item.cantidad} ({porcentaje}%)</span
                                >
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-2.5">
                                <div
                                    class="bg-primary-600 h-2.5 rounded-full transition-all"
                                    style="width: {porcentaje}%"
                                ></div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>

        <!-- Últimos tenants -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-gray-900">
                    Últimos Tenants
                </h3>
                <a
                    href="/superadmin/tenants"
                    class="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                    Ver todos →
                </a>
            </div>
            {#if stats.ultimosTenants.length === 0}
                <p class="text-gray-500 text-sm">Sin tenants registrados</p>
            {:else}
                <div class="space-y-3">
                    {#each stats.ultimosTenants as tenant}
                        <div
                            class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                            <div class="min-w-0 flex-1">
                                <p class="font-medium text-gray-900 truncate">
                                    {tenant.nombre}
                                </p>
                                <p class="text-xs text-gray-500">
                                    {tenant.slug} · {formatFechaHora(
                                        tenant.createdAt,
                                    )}
                                </p>
                            </div>
                            <div
                                class="flex items-center gap-2 flex-shrink-0 ml-3"
                            >
                                <span class="text-xs text-gray-500"
                                    >{tenant.plan?.nombre ?? "Sin plan"}</span
                                >
                                <Badge color={tenant.activo ? "green" : "red"}>
                                    {tenant.activo ? "Activo" : "Inactivo"}
                                </Badge>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
{/if}
