<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { authStore } from "$stores/auth.store";
	import {
		offlineStore,
		estaOnline,
		ventasPendientes,
	} from "$stores/offline.store";
	import { initDB } from "$offline/db";
	import { ventasQueue } from "$offline/ventas.queue";
	import { toastStore } from "$stores/toast.store";
	import type { LayoutData } from "./$types";

	export let data: LayoutData;

	// Inicializar auth store con los datos del servidor
	$: authStore.inicializar(
		data.usuario
			? {
					usuario: data.usuario,
					accessToken: "",
					refreshToken: "",
					expiresIn: 0,
				}
			: null,
	);

	// Detector de conectividad + offline sync
	onMount(async () => {
		// Init IndexedDB
		await initDB();

		// Load pending sales from DB into store
		const pendientes = await ventasQueue.getAll();
		for (const v of pendientes) {
			offlineStore.agregarVenta(v.payload);
		}

		const actualizarOnline = () => offlineStore.setOnline(navigator.onLine);
		window.addEventListener("online", onReconnect);
		window.addEventListener("offline", actualizarOnline);
		actualizarOnline();

		return () => {
			window.removeEventListener("online", onReconnect);
			window.removeEventListener("offline", actualizarOnline);
		};
	});

	async function onReconnect() {
		offlineStore.setOnline(true);
		const count = await ventasQueue.count();
		if (count > 0) {
			toastStore.info(
				`Reconectado. Sincronizando ${count} venta(s) pendiente(s)...`,
			);
			const result = await ventasQueue.process(data.accessToken);
			if (result.ok > 0)
				toastStore.exito(`${result.ok} venta(s) sincronizada(s)`);
			if (result.failed > 0)
				toastStore.error(
					`${result.failed} venta(s) fallaron al sincronizar`,
				);
		}
	}
</script>

<!-- Offline banner -->
{#if !$estaOnline}
	<div
		class="fixed top-0 left-0 right-0 z-[60] bg-amber-500 text-white text-center py-1.5 text-sm font-medium shadow-md"
	>
		<svg
			class="w-4 h-4 inline-block mr-1 -mt-0.5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728M12 12h.01"
			/>
		</svg>
		Sin conexión — Modo offline activo
		{#if $ventasPendientes > 0}
			<span class="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs"
				>{$ventasPendientes} venta(s) pendiente(s)</span
			>
		{/if}
	</div>
{/if}

<slot />

<!-- Toast notifications — siempre visible encima de todo -->
{#await import("../lib/components/ui/ToastContainer.svelte") then { default: ToastContainer }}
	<ToastContainer />
{/await}
