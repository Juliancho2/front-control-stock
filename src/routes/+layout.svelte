<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { authStore } from "$stores/auth.store";
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

	// Detector de conectividad para modo offline
	onMount(() => {
		const { offlineStore } = import("../lib/stores/offline.store");
		const actualizarOnline = () =>
			offlineStore.then((m) =>
				m.offlineStore.setOnline(navigator.onLine),
			);
		window.addEventListener("online", actualizarOnline);
		window.addEventListener("offline", actualizarOnline);
		return () => {
			window.removeEventListener("online", actualizarOnline);
			window.removeEventListener("offline", actualizarOnline);
		};
	});
</script>

<slot />

<!-- Toast notifications — siempre visible encima de todo -->
{#await import("../lib/components/ui/ToastContainer.svelte") then { default: ToastContainer }}
	<ToastContainer />
{/await}
