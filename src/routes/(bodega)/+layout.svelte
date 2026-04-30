<script lang="ts">
	import Sidebar from "$components/layout/Sidebar.svelte";
	import Topbar from "$components/layout/Topbar.svelte";
	import { esAdmin } from "$stores/auth.store";

	let colapsado = false;
	let sidebarAbierto = false;

	const nav = [
		{
			label: "Inventario",
			href: "/bodega/inventario",
			icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
		},
		{
			label: "Recepciones",
			href: "/bodega/recepciones",
			icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
		},
		{
			label: "Órdenes de compra",
			href: "/bodega/compras",
			icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
		},
		{
			label: "Traslados",
			href: "/bodega/traslados",
			icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
		},
		{
			label: "Bodegas",
			href: "/bodega/bodegas",
			icon: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
		},
		{
			label: "Proveedores",
			href: "/bodega/proveedores",
			icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
		},
		{
			label: "Notificaciones",
			href: "/bodega/notificaciones",
			icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
		},
	];
</script>

<div class="h-screen flex overflow-hidden bg-gray-50">
	<Sidebar items={nav} bind:colapsado bind:abierto={sidebarAbierto}>
		<svelte:fragment slot="footer">
			{#if $esAdmin}
				<a
					href="/seleccionar-panel"
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
					title={colapsado ? "Cambiar panel" : undefined}
				>
					<svg
						class="w-5 h-5 flex-shrink-0"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1.75"
							d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
						/>
					</svg>
					{#if !colapsado}
						<span class="truncate">Cambiar panel</span>
					{/if}
				</a>
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
