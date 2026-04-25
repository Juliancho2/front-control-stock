<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import {
		misNotificaciones,
		cantidadNoLeidas,
		notificacionesStore,
	} from "$lib/stores/notificaciones.store";
	import { estaAutenticado } from "$lib/stores/auth.store";
	import { fade, slide } from "svelte/transition";

	let abierto = false;

	function toggle() {
		abierto = !abierto;
		if (abierto) {
			notificacionesStore.cargar();
		}
	}

	function marcarLeida(id: string) {
		notificacionesStore.marcarLeida(id);
	}

	function marcarTodasLeidas() {
		notificacionesStore.marcarTodasLeidas();
	}

	onMount(() => {
		if ($estaAutenticado) {
			notificacionesStore.iniciarPolling();
		}
	});

	onDestroy(() => {
		notificacionesStore.detenerPolling();
	});

	// Colores por tipo
	const colores = {
		stock_bajo: "text-warning-600 bg-warning-50",
		sin_stock: "text-danger-600 bg-danger-50",
		venta_exitosa: "text-success-600 bg-success-50",
		error_stock: "text-danger-600 bg-danger-50",
		venta_nueva: "text-primary-600 bg-primary-50",
	};

	const iconos = {
		stock_bajo:
			"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
		sin_stock:
			"M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
		venta_exitosa: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
		error_stock: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
		venta_nueva:
			"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
	};
</script>

<div class="relative">
	<button
		onclick={toggle}
		class="p-2 rounded-lg hover:bg-gray-100 transition-colors relative text-gray-500 hover:text-gray-700"
		aria-label="Notificaciones"
	>
		<svg
			class="w-6 h-6"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
			/>
		</svg>

		{#if $cantidadNoLeidas > 0}
			<span
				class="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-200 text-[10px] font-bold text-white border-2 border-white"
				transition:fade
			>
				{$cantidadNoLeidas > 9 ? "9+" : $cantidadNoLeidas}
			</span>
		{/if}
	</button>

	{#if abierto}
		<!-- Dropdown -->
		<div
			class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right translate-x-12 sm:translate-x-0"
			transition:slide={{ duration: 200 }}
		>
			<div
				class="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50"
			>
				<h3 class="text-sm font-semibold text-gray-900">
					Notificaciones
				</h3>
				{#if $cantidadNoLeidas > 0}
					<button
						onclick={marcarTodasLeidas}
						class="text-xs text-primary-600 hover:text-primary-700 font-medium"
					>
						Marcar todas como leídas
					</button>
				{/if}
			</div>

			<div class="max-h-[400px] overflow-y-auto">
				{#if $misNotificaciones.length === 0}
					<div class="px-4 py-8 text-center">
						<div
							class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"
						>
							<svg
								class="w-6 h-6 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
								/>
							</svg>
						</div>
						<p class="text-sm text-gray-500">
							No tienes notificaciones
						</p>
					</div>
				{:else}
					{#each $misNotificaciones as n (n.id)}
						<button
							onclick={() => marcarLeida(n.id)}
							class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex gap-3 {n.leida
								? 'opacity-60'
								: ''}"
						>
							<div
								class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center {colores[
									n.tipo
								]}"
							>
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d={iconos[n.tipo]}
									/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<div
									class="flex justify-between items-start gap-2"
								>
									<p
										class="text-sm font-semibold text-gray-900 leading-tight truncate"
									>
										{n.titulo}
									</p>
									<span
										class="text-[10px] text-gray-400 whitespace-nowrap"
									>
										{new Date(
											n.createdAt,
										).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<p
									class="text-xs text-gray-600 mt-1 line-clamp-2"
								>
									{n.mensaje}
								</p>
							</div>
							{#if !n.leida}
								<div class="flex-shrink-0 mt-1.5">
									<div
										class="w-2 h-2 bg-primary-500 rounded-full"
									></div>
								</div>
							{/if}
						</button>
					{/each}
				{/if}
			</div>

			{#if $misNotificaciones.length > 0}
				<div
					class="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center"
				>
					<button
						class="text-xs text-gray-500 hover:text-gray-700 font-medium"
					>
						Ver todas las notificaciones
					</button>
				</div>
			{/if}
		</div>

		<!-- Backdrop to close -->
		<div
			class="fixed inset-0 z-40"
			onclick={() => (abierto = false)}
			role="presentation"
		/>
	{/if}
</div>
