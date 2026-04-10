<script lang="ts">
	import { page } from "$app/stores";

	export let items: {
		label: string;
		href: string;
		icon: string;
		badge?: number;
	}[] = [];

	export let colapsado = false;

	$: rutaActual = $page.url.pathname;

	function esActivo(ruta: string, href: string) {
		return ruta === href || ruta.startsWith(href + "/");
	}
</script>

<aside
	class="flex flex-col bg-gray-900 text-white transition-all duration-200 flex-shrink-0 h-full overflow-hidden
         {colapsado ? 'w-sidebar-collapsed' : 'w-sidebar'}"
>
	<!-- Logo -->
	<div class="flex items-center gap-3 px-4 py-4 border-b border-gray-700/50">
		<div
			class="w-8 h-8 bg-primary-400 rounded-lg flex items-center justify-center flex-shrink-0"
		>
			<svg
				class="w-5 h-5 text-white"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				/>
			</svg>
		</div>
		{#if !colapsado}
			<span class="text-sm font-semibold text-white truncate"
				>Ferretería ERP</span
			>
		{/if}
	</div>

	<!-- Navegación -->
	<nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
		{#each items as item (item.href)}
			{@const activo = esActivo(rutaActual, item.href)}
			<a
				href={item.href}
				class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
               {activo
					? 'bg-primary-400/20 text-primary-300'
					: 'text-gray-400 hover:bg-gray-800 hover:text-white'}"
				title={colapsado ? item.label : undefined}
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
						d={item.icon}
					/>
				</svg>

				{#if !colapsado}
					<span class="flex-1 truncate">{item.label}</span>
					{#if item.badge}
						<span
							class="ml-auto flex-shrink-0 w-5 h-5 bg-danger-400 text-white text-xs rounded-full flex items-center justify-center font-medium"
						>
							{item.badge > 9 ? "9+" : item.badge}
						</span>
					{/if}
				{/if}
			</a>
		{/each}
	</nav>

	<!-- Toggle colapsado -->
	<div class="px-2 py-3 border-t border-gray-700/50">
		<button
			onclick={() => (colapsado = !colapsado)}
			class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
			title={colapsado ? "Expandir menú" : "Colapsar menú"}
		>
			<svg
				class="w-5 h-5 transition-transform {colapsado
					? 'rotate-180'
					: ''}"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
				/>
			</svg>
			{#if !colapsado}
				<span>Colapsar</span>
			{/if}
		</button>
	</div>
</aside>
