<script lang="ts">
	import Sidebar from "$components/layout/Sidebar.svelte";
	import Topbar from "$components/layout/Topbar.svelte";

	let colapsado = false;

	const nav = [
		{
			label: "Dashboard",
			href: "/admin/dashboard",
			icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
		},
		{
			label: "Productos",
			href: "/admin/productos",
			icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
		},
		{
			label: "Categorías",
			href: "/admin/categorias",
			icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
		},
		{
			label: "Clientes",
			href: "/admin/clientes",
			icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
		},
		{
			label: "Ventas",
			href: "/admin/ventas",
			icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
		},
		{
			label: "Usuarios",
			href: "/admin/usuarios",
			icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
		},
		{
			label: "Reportes",
			href: "/admin/reportes",
			icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
		},
	];
</script>

<div class="h-screen flex overflow-hidden bg-gray-50">
	<Sidebar items={nav} bind:colapsado />

	<div class="flex-1 flex flex-col overflow-hidden">
		<Topbar mostrarMenuLateral={false}>
			<svelte:fragment slot="menu-toggle">
				<button
					onclick={() => (colapsado = !colapsado)}
					class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
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

		<main class="flex-1 overflow-y-auto p-6">
			<slot />
		</main>
	</div>
</div>
