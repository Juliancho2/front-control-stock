<script lang="ts">
	import { page } from "$app/stores";
</script>

<svelte:head>
	<title>Error {$page.status} — FerreControl</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="text-center max-w-sm">
		<p class="text-6xl font-bold text-primary-400 mb-4">{$page.status}</p>
		<h1 class="text-xl font-semibold text-gray-900 mb-2">
			{$page.status === 404 ? "Página no encontrada" : "Algo salió mal"}
		</h1>
		<p class="text-gray-500 text-sm mb-6">
			{$page.error?.message ?? "Ocurrió un error inesperado."}
		</p>
		<a href="/" class="btn-primary">Volver al inicio</a>
	</div>
</div>
