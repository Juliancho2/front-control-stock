<script lang="ts">
	import Topbar from "$components/layout/Topbar.svelte";
	import {
		hayTurnoAbierto,
		turnoActivo,
		estaOnline,
		ventasPendientes,
	} from "../../lib/index";
	import type { LayoutData } from "./$types";

	export let data: LayoutData;
</script>

<div class="h-screen flex flex-col overflow-hidden bg-gray-100">
	<!-- Topbar POS -->
	<Topbar titulo="Punto de Venta">
		<svelte:fragment slot="titulo">
			<div class="flex items-center gap-2">
				<div
					class="inline-flex items-center justify-center w-7 h-7 bg-primary-400 rounded-lg"
				>
					<svg
						class="w-4 h-4 text-white"
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
				<span class="text-sm font-medium text-gray-900"
					>Punto de Venta</span
				>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="acciones">
			<!-- Indicador offline -->
			{#if !$estaOnline}
				<div
					class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-warning-50 border border-warning-200"
				>
					<span
						class="w-2 h-2 rounded-full bg-warning-400 animate-pulse"
					></span>
					<span
						class="text-xs font-medium text-warning-700 hidden sm:inline"
						>Sin conexión</span
					>
					{#if $ventasPendientes > 0}
						<span class="text-xs text-warning-600 hidden sm:inline"
							>· {$ventasPendientes} pendiente{$ventasPendientes >
							1
								? "s"
								: ""}</span
						>
					{/if}
				</div>
			{/if}

			<!-- Estado turno -->
			{#if $hayTurnoAbierto}
				<div
					class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary-50 border border-primary-200"
				>
					<span class="w-2 h-2 rounded-full bg-primary-400"></span>
					<span
						class="text-xs font-medium text-primary-700 hidden sm:inline"
						>Turno abierto</span
					>
				</div>
			{:else}
				<a
					href="/turno"
					class="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-danger-50 border border-danger-200 hover:bg-danger-100 transition-colors"
				>
					<span class="w-2 h-2 rounded-full bg-danger-400"></span>
					<span
						class="text-xs font-medium text-danger-700 hidden sm:inline"
						>Abrir turno</span
					>
				</a>
			{/if}

			<!-- Acceso rápido ventas del turno -->
			<a
				href="/ventas"
				class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
				title="Historial de ventas"
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
						stroke-width="1.75"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			</a>
		</svelte:fragment>
	</Topbar>

	<!-- Contenido -->
	<main class="flex-1 overflow-hidden">
		<slot />
	</main>
</div>
