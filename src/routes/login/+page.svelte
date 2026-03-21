<script lang="ts">
	import { enhance } from "$app/forms";
	import type { ActionData } from "./$types";

	export let form: ActionData;

	let cargando = false;
	let mostrarPassword = false;
</script>

<svelte:head>
	<title>Iniciar sesión — Ferretería ERP</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
	<div class="w-full max-w-sm">
		<!-- Logo / título -->
		<div class="text-center mb-8">
			<div
				class="inline-flex items-center justify-center w-14 h-14 bg-primary-400 rounded-2xl mb-4"
			>
				<svg
					class="w-8 h-8 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
					/>
				</svg>
			</div>
			<h1 class="text-2xl font-semibold text-gray-900">Ferretería ERP</h1>
			<p class="text-sm text-gray-500 mt-1">
				Ingresa tus credenciales para continuar
			</p>
		</div>

		<!-- Card del formulario -->
		<div class="card">
			<div class="card-body">
				<form
					method="POST"
					use:enhance={() => {
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
					<div>
						<label
							for="email"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							Correo electrónico
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autocomplete="email"
							required
							value={form?.email ?? ""}
							placeholder="cajero@ferreteria.com"
							class="input"
							disabled={cargando}
						/>
					</div>

					<!-- Password -->
					<div>
						<label
							for="password"
							class="block text-sm font-medium text-gray-700 mb-1"
						>
							Contraseña
						</label>
						<div class="relative">
							<input
								id="password"
								name="password"
								type={mostrarPassword ? "text" : "password"}
								autocomplete="current-password"
								required
								placeholder="••••••••"
								class="input pr-10"
								disabled={cargando}
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
								onclick={() =>
									(mostrarPassword = !mostrarPassword)}
								tabindex="-1"
							>
								{#if mostrarPassword}
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
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
										/>
									</svg>
								{:else}
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
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
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

		<!-- Footer -->
		<p class="text-center text-xs text-gray-400 mt-6">
			Ferretería ERP v1.0 — Solo personal autorizado
		</p>
	</div>
</div>
