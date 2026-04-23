<script lang="ts">
	import { enhance } from "$app/forms";
	import { usuarioActual } from "../../stores/auth.store";
	import NotificationBell from "./NotificationBell.svelte";

	export let titulo = "FerreControl";
	export let mostrarMenuLateral = true;

	let menuUsuarioAbierto = false;

	const inicialesUsuario = (nombre: string) =>
		nombre
			.split(" ")
			.slice(0, 2)
			.map((n) => n[0])
			.join("")
			.toUpperCase();
</script>

<header
	class="h-topbar bg-white border-b border-gray-200 flex items-center px-4 gap-3 z-30 sticky top-0"
>
	<!-- Botón toggle sidebar -->
	{#if mostrarMenuLateral}
		<slot name="menu-toggle" />
	{/if}

	<!-- Título / breadcrumb -->
	<div class="flex-1 min-w-0">
		<slot name="titulo">
			<span class="text-sm font-medium text-gray-900 truncate"
				>{titulo}</span
			>
		</slot>
	</div>

	<!-- Acciones adicionales -->
	<slot name="acciones" />

	<!-- Notificaciones -->
	{#if $usuarioActual}
		<NotificationBell />
	{/if}

	<!-- Menú de usuario -->
	{#if $usuarioActual}
		<div class="relative">
			<button
				onclick={() => (menuUsuarioAbierto = !menuUsuarioAbierto)}
				class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
			>
				<div
					class="w-7 h-7 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
				>
					{inicialesUsuario($usuarioActual.nombre)}
				</div>
				<div class="text-left hidden sm:block">
					<p class="text-xs font-medium text-gray-900 leading-tight">
						{$usuarioActual.nombre}
					</p>
					<p class="text-xs text-gray-400 capitalize">
						{$usuarioActual.rol}
					</p>
				</div>
				<svg
					class="w-3.5 h-3.5 text-gray-400 hidden sm:block"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			<!-- Dropdown -->
			{#if menuUsuarioAbierto}
				<div
					class="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
					role="menu"
				>
					<div class="px-3 py-2 border-b border-gray-100 mb-1">
						<p class="text-xs font-medium text-gray-900">
							{$usuarioActual.nombre}
						</p>
						<p class="text-xs text-gray-400">
							{$usuarioActual.email}
						</p>
					</div>
					<form method="POST" action="/logout" use:enhance>
						<button
							type="submit"
							class="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
							role="menuitem"
						>
							Cerrar sesión
						</button>
					</form>
				</div>

				<!-- Clic fuera para cerrar -->
				<div
					class="fixed inset-0 z-40"
					onclick={() => (menuUsuarioAbierto = false)}
					role="presentation"
				/>
			{/if}
		</div>
	{/if}
</header>
