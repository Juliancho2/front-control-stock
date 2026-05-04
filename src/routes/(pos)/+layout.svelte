<script lang="ts">
	import { onMount } from "svelte";
	import Topbar from "$components/layout/Topbar.svelte";
	import {
		hayTurnoAbierto,
		turnoActivo,
		estaOnline,
		ventasPendientes,
		turnoStore,
	} from "../../lib/index";
	import { cajaApi } from "$api/caja";
	import type { LayoutData } from "./$types";
	import IconLogo from "$components/ui/IconLogo.svelte";

	export let data: LayoutData;
	const { accessToken } = data;

	// Sincronizar el store con los datos del servidor (evita parpadeos)
	$: {
		if (data.turnoActivo !== undefined) {
			turnoStore.inicializar(data.turnoActivo);
		}
	}

	onMount(async () => {
		// Por si acaso los datos no venían del servidor o para asegurar actualización
		if (!$turnoActivo && accessToken) {
			try {
				const t = await cajaApi.turnoActivo(accessToken);
				turnoStore.inicializar(t);
			} catch {
				turnoStore.inicializar(null);
			}
		}
	});
</script>

<div class="h-screen flex flex-col overflow-hidden bg-gray-100">
	<!-- Topbar POS -->
	<Topbar titulo="Punto de Venta">
		<svelte:fragment slot="titulo">
			<div class="flex items-center gap-2">
				<IconLogo size={42} />
				<span class="hidden sm:inline text-sm font-medium text-gray-900"
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
