<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "./$types";
	import { authApi } from "$api/auth";
	import Input from "$components/ui/Input.svelte";
	import IconLogo from "$components/ui/IconLogo.svelte";

	export let form: ActionData;

	let cargando = false;
	let errores: Record<string, string> = {};

	// Recuperación de contraseña
	let mostrarModalOlvide = false;
	let emailRecuperar = "";
	let enviandoCorreo = false;
	let mensajeRecuperacion = "";
	let errorRecuperacion = "";

	async function solicitarRecuperacion() {
		errorRecuperacion = "";
		if (
			!emailRecuperar ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRecuperar)
		) {
			errorRecuperacion = "Ingresa un correo electrónico válido";
			return;
		}
		enviandoCorreo = true;
		try {
			await authApi.olvidePassword(emailRecuperar);
			mensajeRecuperacion =
				"Si el correo está registrado, recibirás un enlace de recuperación pronto.";
		} catch (e) {
			errorRecuperacion = "Hubo un error al intentar enviar el correo.";
		} finally {
			enviandoCorreo = false;
		}
	}

	function validarLocal(formData: FormData): boolean {
		errores = {};
		const email = formData.get("email")?.toString().trim() ?? "";
		const password = formData.get("password")?.toString() ?? "";

		if (!email) errores.email = "El correo es obligatorio";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			errores.email = "Formato de correo inválido";

		if (!password) errores.password = "La contraseña es obligatoria";
		else if (password.length < 6) errores.password = "Mínimo 6 caracteres";

		return Object.keys(errores).length === 0;
	}
</script>

<svelte:head>
	<title>Iniciar sesión — FerreControl</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<!-- Logo / título -->
		<div class="text-center mb-8">
			<div class="flex items-center justify-center mb-4">
				<IconLogo size={60} />
				<!-- <WordMark size={200} /> -->
				<div class="flex items-start ml-3">
					<h1 class="text-3xl font-bold text-gray-900 self-center">
						Ferre<span class="text-primary-600">Control</span>
					</h1>
					<span class="text-gray-400 text-xs">POS</span>
				</div>
			</div>
			<p class="text-2xl font-semibold text-slate-800 my-1">
				Ingresa a tu cuenta
			</p>
			<p class="text-base text-gray-500">
				El punto de venta que tu ferretería necesita.
			</p>
		</div>

		<!-- Card del formulario -->
		<div class="card shadow-md">
			<div class="card-body">
				<form
					method="POST"
					use:enhance={({ formData, cancel }) => {
						if (!validarLocal(formData)) {
							cancel();
							return;
						}
						cargando = true;
						return async ({ update }) => {
							await update();
							cargando = false;
						};
					}}
					class="space-y-4"
				>
					<!-- Error del servidor -->
					{#if form?.error}
						<div
							class="flex items-center gap-2 p-3 rounded-lg bg-danger-50 border border-danger-200"
						>
							<svg
								class="w-4 h-4 text-danger-600 flex-shrink-0"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
							<p class="text-sm text-danger-700">{form.error}</p>
						</div>
					{/if}

					<!-- Email -->
					<Input
						label="Correo electrónico"
						name="email"
						type="email"
						autocomplete="email"
						required
						value={form?.email ?? ""}
						placeholder="cajero@ferreteria.com"
						error={errores.email}
						disabled={cargando}
					/>

					<!-- Password -->
					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<label
								for="password"
								class="text-sm font-medium text-gray-700"
								>Contraseña</label
							>
						</div>
						<Input
							id="password"
							name="password"
							type="password"
							autocomplete="current-password"
							required
							placeholder="••••••••"
							error={errores.password}
							disabled={cargando}
						/>
						<button
							type="button"
							class="text-xs text-primary-600 float-right mt-1 hover:text-primary-800 font-medium"
							onclick={() => {
								mostrarModalOlvide = true;
								mensajeRecuperacion = "";
								emailRecuperar = "";
							}}
						>
							¿Olvidaste tu contraseña?
						</button>
					</div>

					<!-- Botón submit -->
					<button
						type="submit"
						class="btn-primary w-full mt-2"
						disabled={cargando}
					>
						{#if cargando}
							<svg
								class="animate-spin w-4 h-4"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
								/>
							</svg>
							Ingresando...
						{:else}
							Ingresar
						{/if}
					</button>
				</form>
			</div>
		</div>

		<!-- Registro -->
		<p class="text-center text-sm text-gray-500 mt-6">
			¿No tienes cuenta?
			<a
				href="/registro"
				class="font-medium text-primary-600 hover:text-primary-800"
			>
				Registra tu negocio gratis
			</a>
		</p>

		<p class="text-center text-xs text-gray-400 mt-3">FerreControl v1.0</p>
	</div>
</div>

<!-- Modal Olvidé mi contraseña -->
{#if mostrarModalOlvide}
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
	<div
		class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
		onclick={() => (mostrarModalOlvide = false)}
	>
		<div
			class="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="px-5 py-4 border-b border-gray-100">
				<h2 class="text-base font-semibold text-gray-900">
					Recuperar contraseña
				</h2>
				<p class="text-xs text-gray-500 mt-1">
					Ingresa tu correo y te enviaremos las instrucciones.
				</p>
			</div>

			<div class="p-5">
				{#if mensajeRecuperacion}
					<div
						class="p-3 bg-green-50 text-green-700 text-sm rounded-lg mb-4"
					>
						{mensajeRecuperacion}
					</div>
				{:else}
					<div class="mb-4">
						<input
							type="email"
							bind:value={emailRecuperar}
							placeholder="correo@ejemplo.com"
							class="input"
							disabled={enviandoCorreo}
						/>
						{#if errorRecuperacion}
							<p class="text-xs text-danger-500 mt-1">
								{errorRecuperacion}
							</p>
						{/if}
					</div>
				{/if}

				<div class="flex gap-3 mt-4">
					<button
						type="button"
						class="btn-secondary flex-1 text-sm py-2"
						onclick={() => (mostrarModalOlvide = false)}
						disabled={enviandoCorreo}
					>
						Cerrar
					</button>
					{#if !mensajeRecuperacion}
						<button
							type="button"
							class="btn-primary flex-1 text-sm py-2"
							onclick={solicitarRecuperacion}
							disabled={enviandoCorreo}
						>
							{enviandoCorreo ? "Enviando..." : "Enviar correo"}
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<p class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500">
	Copyright © {new Date().getFullYear()} FerreControl. Todos los derechos reservados.
</p>
