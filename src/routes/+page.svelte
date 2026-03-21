<script lang="ts">
	let { data } = $props();
</script>

<div class="flex flex-col items-center justify-center min-h-screen">
	<h1 class="text-4xl font-bold mb-4">Control de Stock</h1>
	{#if data.session}
		<p class="mb-4">Bienvenido, {data.session.user}</p>
		<div class="flex gap-4">
			<a href="/admin/dashboard" class="px-4 py-2 bg-blue-500 text-white rounded">Ir al Panel</a>
			<a href="/pos" class="px-4 py-2 bg-green-500 text-white rounded">Ir al POS</a>
		</div>
	{:else}
		<a href="/login" class="px-4 py-2 bg-blue-500 text-white rounded">Iniciar Sesión</a>
	{/if}
</div>
