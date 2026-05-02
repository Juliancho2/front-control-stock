<script lang="ts">
	import { enhance } from "$app/forms";
	import {
		nombreNegocioActual,
		suscripcionActual,
		usuarioActual,
	} from "../../stores/auth.store";
	import NotificationBell from "./NotificationBell.svelte";
	import Button from "$components/ui/Button.svelte";
	import Spinner from "$components/ui/Spinner.svelte";
	import Input from "$components/ui/Input.svelte";
	import { usuariosApi } from "$api/usuarios";
	import { toastStore } from "$stores/toast.store";
	import Badge from "$components/ui/Badge.svelte";

	export let titulo = "FerreControl";
	export let mostrarMenuLateral = true;

	let menuUsuarioAbierto = false;
	let mostrarModalPassword = false;
	let passwordActual = "";
	let nuevoPasswordPerfil = "";
	let confirmarPasswordPerfil = "";
	let cambiandoPassword = false;
	let errorPassword = "";
	let cerrandoSesion = false;

	function abrirModalPassword() {
		passwordActual = "";
		nuevoPasswordPerfil = "";
		confirmarPasswordPerfil = "";
		errorPassword = "";
		mostrarModalPassword = true;
		menuUsuarioAbierto = false;
	}

	async function cambiarMiPassword() {
		errorPassword = "";
		if (!passwordActual || !nuevoPasswordPerfil) {
			errorPassword = "Todos los campos son obligatorios";
			return;
		}
		if (nuevoPasswordPerfil !== confirmarPasswordPerfil) {
			errorPassword = "Las contraseñas nuevas no coinciden";
			return;
		}
		if (nuevoPasswordPerfil.length < 8) {
			errorPassword =
				"La nueva contraseña debe tener al menos 8 caracteres";
			return;
		}
		cambiandoPassword = true;
		try {
			await usuariosApi.cambiarMiPassword(
				passwordActual,
				nuevoPasswordPerfil,
			);
			toastStore.exito("Contraseña actualizada correctamente");
			mostrarModalPassword = false;
		} catch (e: any) {
			errorPassword =
				e?.mensajes?.[0] ?? "Error al cambiar la contraseña";
		} finally {
			cambiandoPassword = false;
		}
	}

	const inicialesUsuario = (nombre: string) =>
		nombre
			.split(" ")
			.slice(0, 2)
			.map((n) => n[0])
			.join("")
			.toUpperCase();

	$: mostrarSuscripcion =
		!!$usuarioActual &&
		($usuarioActual.rol === "admin" ||
			$usuarioActual.rol === "superadmin") &&
		!!$suscripcionActual;

	$: textoSuscripcion = $suscripcionActual
		? `${$suscripcionActual.planNombre} · ${$suscripcionActual.diasRestantes} día(s)`
		: "";

	$: mostrarBotonUpgrade =
		!!$usuarioActual &&
		$usuarioActual.rol === "admin" &&
		!!$suscripcionActual &&
		($suscripcionActual.planCodigo === "trial" ||
			$suscripcionActual.planCodigo === "basic");
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
			<Badge dot variant="green"
				>{$nombreNegocioActual?.toLocaleUpperCase() || titulo}</Badge
			>
		</slot>
	</div>

	<!-- Acciones adicionales -->
	<slot name="acciones" />

	{#if mostrarSuscripcion}
		<div class="flex items-center gap-2">
			{#if mostrarBotonUpgrade}
				<Button
					variant="secondary"
					size="sm"
					href="/admin/suscripcion/pagar"
					class="hidden md:flex items-center gap-1.5 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
				>
					<svg
						class="w-3.5 h-3.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
					Mejorar plan
				</Button>
			{/if}
			<span
				class="hidden lg:inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border"
				class:bg-amber-50={$suscripcionActual?.diasRestantes !==
					undefined && $suscripcionActual.diasRestantes <= 5}
				class:border-amber-200={$suscripcionActual?.diasRestantes !==
					undefined && $suscripcionActual.diasRestantes <= 5}
				class:text-amber-700={$suscripcionActual?.diasRestantes !==
					undefined && $suscripcionActual.diasRestantes <= 5}
				class:bg-blue-50={$suscripcionActual?.diasRestantes !==
					undefined && $suscripcionActual.diasRestantes > 5}
				class:border-blue-200={$suscripcionActual?.diasRestantes !==
					undefined && $suscripcionActual.diasRestantes > 5}
				class:text-blue-700={$suscripcionActual?.diasRestantes !==
					undefined && $suscripcionActual.diasRestantes > 5}
			>
				{textoSuscripcion}
			</span>
		</div>
	{/if}

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
					<button
						onclick={abrirModalPassword}
						class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
						role="menuitem"
					>
						Cambiar contraseña
					</button>
					<form
						method="POST"
						action="/logout"
						use:enhance={() => {
							cerrandoSesion = true;
							return async ({ update }) => {
								await update();
								cerrandoSesion = false;
							};
						}}
					>
						<button
							type="submit"
							class="w-full text-left px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors flex items-center justify-between gap-2"
							role="menuitem"
							disabled={cerrandoSesion}
						>
							<span
								>{cerrandoSesion
									? "Cerrando sesión..."
									: "Cerrar sesión"}</span
							>
							{#if cerrandoSesion}
								<Spinner size="sm" />
							{/if}
						</button>
					</form>
				</div>

				<!-- Clic fuera para cerrar -->
				<div
					class="fixed inset-0 z-40"
					onclick={() => (menuUsuarioAbierto = false)}
					role="presentation"
				></div>
			{/if}
		</div>
	{/if}
</header>

<!-- Modal cambiar mi contraseña -->
{#if mostrarModalPassword}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
		onclick={() => (mostrarModalPassword = false)}
	>
		<div
			class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="px-5 py-4 border-b border-gray-100">
				<h2 class="text-base font-semibold text-gray-900">
					Cambiar mi contraseña
				</h2>
			</div>

			<div class="px-5 py-4 space-y-4">
				<Input
					label="Contraseña actual"
					type="password"
					bind:value={passwordActual}
					placeholder="Ingresa tu contraseña actual"
				/>
				<Input
					label="Nueva contraseña"
					type="password"
					bind:value={nuevoPasswordPerfil}
					placeholder="Mínimo 8 caracteres"
				/>
				<Input
					label="Confirmar nueva contraseña"
					type="password"
					bind:value={confirmarPasswordPerfil}
					placeholder="Repite la nueva contraseña"
				/>

				{#if errorPassword}
					<p class="text-xs text-danger-500">{errorPassword}</p>
				{/if}
			</div>

			<div class="px-5 pb-5 flex gap-3">
				<Button
					variant="secondary"
					fullWidth
					onclick={() => (mostrarModalPassword = false)}
					disabled={cambiandoPassword}
				>
					Cancelar
				</Button>
				<Button
					variant="primary"
					fullWidth
					loading={cambiandoPassword}
					onclick={cambiarMiPassword}
				>
					Guardar
				</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes modal-in {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
	.animate-modal-in {
		animation: modal-in 0.2s ease-out;
	}
</style>
