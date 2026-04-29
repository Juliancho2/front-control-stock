<script lang="ts">
    import Sidebar from "$components/layout/Sidebar.svelte";
    import Topbar from "$components/layout/Topbar.svelte";

    let colapsado = false;
    let sidebarAbierto = false;

    const nav = [
        {
            label: "Dashboard",
            href: "/superadmin/dashboard",
            icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
        },
        {
            label: "Tenants",
            href: "/superadmin/tenants",
            icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        },
        {
            label: "Planes",
            href: "/superadmin/planes",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        },
        {
            label: "Pagos",
            href: "/superadmin/pagos",
            icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        },
    ];
</script>

<div class="h-screen flex overflow-hidden bg-gray-50">
    <Sidebar items={nav} bind:colapsado bind:abierto={sidebarAbierto}>
        <svelte:fragment slot="header">
            {#if !colapsado}
                <div class="px-3 py-2 mb-2">
                    <span
                        class="text-xs font-semibold uppercase tracking-wider text-primary-400"
                        >Super Admin</span
                    >
                </div>
            {/if}
        </svelte:fragment>
    </Sidebar>

    <div class="flex-1 flex flex-col overflow-hidden">
        <Topbar>
            <svelte:fragment slot="menu-toggle">
                <button
                    onclick={() => (sidebarAbierto = !sidebarAbierto)}
                    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors md:hidden"
                    aria-label="Toggle menú"
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
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
            </svelte:fragment>
        </Topbar>

        <main class="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            <slot />
        </main>
    </div>
</div>
