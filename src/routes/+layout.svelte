<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { page } from "$app/stores";
	import { authStore } from "$stores/auth.store";
	import { setAccessToken } from "$api/fetch";
	import {
		offlineStore,
		estaOnline,
		ventasPendientes,
	} from "$stores/offline.store";
	import { initDB } from "$offline/db";
	import { ventasQueue } from "$offline/ventas.queue";
	import { toastStore } from "$stores/toast.store";
	import type { InfoSuscripcion } from "$types/index";
	import type { LayoutData } from "./$types";

	export let data: LayoutData & { suscripcion?: InfoSuscripcion | null };

	// Inicializar auth store y token en memoria con datos del servidor
	$: {
		setAccessToken(data.accessToken ?? null);
		authStore.inicializar(
			data.usuario
				? {
						usuario: data.usuario,
						accessToken: data.accessToken ?? "",
						refreshToken: "",
						expiresIn: 0,
						tenantId: "",
						tenantNombre: data.tenantNombre ?? undefined,
						suscripcion: data.suscripcion ?? undefined,
					}
				: null,
		);
	}

	// Detector de conectividad + offline sync
	onMount(() => {
		const actualizarOnline = () => offlineStore.setOnline(navigator.onLine);

		void (async () => {
			// Init IndexedDB
			await initDB();

			// Load pending sales from DB into store
			const pendientes = await ventasQueue.getAll();
			for (const v of pendientes) {
				offlineStore.agregarVenta(v.payload);
			}
		})();

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

	$: esPOS = ["/pos", "/turno", "/ventas"].some((path) =>
		$page.url.pathname.startsWith(path),
	);
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

<!-- Botón flotante de WhatsApp Soporte -->
{#if $authStore.usuario && !esPOS}
	<a
		href="https://api.whatsapp.com/send/?phone=573164305964"
		target="_blank"
		rel="noopener noreferrer"
		class="fixed bottom-6 right-6 z-[50] flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110 active:scale-95 group"
		title="Contactar soporte por WhatsApp"
	>
		<!-- WhatsApp Icon -->
		<svg
			class="w-8 h-8"
			fill="currentColor"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.76-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-2.75l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.149-1.613a11.781 11.781 0 005.894 1.57h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413"
			/>
		</svg>

		<!-- Tooltip visual -->
		<span
			class="absolute {esPOS
				? 'left-full ml-4'
				: 'right-full mr-4'} bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none"
		>
			¿Necesitas ayuda? Chatea con nosotros
		</span>
	</a>
{/if}

<!-- Toast notifications — siempre visible encima de todo -->
{#await import("../lib/components/ui/ToastContainer.svelte") then { default: ToastContainer }}
	<ToastContainer />
{/await}
