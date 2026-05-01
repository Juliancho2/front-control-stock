<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { authApi } from "$api/auth";
    import { toastStore } from "$stores/toast.store";
    import Input from "$components/ui/Input.svelte";

    let cargando = false;
    let newPassword = "";
    let confirmPassword = "";
    let error = "";

    // Obtener el token de la URL: /reset-password?token=...
    $: token = $page.url.searchParams.get("token");

    async function cambiarPassword() {
        error = "";
        if (!newPassword || !confirmPassword) {
            error = "Todos los campos son obligatorios";
            return;
        }
        if (newPassword !== confirmPassword) {
            error = "Las contraseñas no coinciden";
            return;
        }
        if (newPassword.length < 8) {
            error = "La contraseña debe tener al menos 8 caracteres";
            return;
        }
        if (!token) {
            error = "Enlace inválido o expirado. Vuelve a solicitar la recuperación.";
            return;
        }

        cargando = true;
        try {
            await authApi.resetPassword(token, newPassword);
            toastStore.exito("Tu contraseña ha sido actualizada exitosamente.");
            goto("/login");
        } catch (e: any) {
            error = e?.mensajes?.[0] ?? "Hubo un error al restablecer la contraseña. Puede que el enlace haya expirado.";
        } finally {
            cargando = false;
        }
    }
</script>

<svelte:head>
    <title>Restablecer contraseña — FerreControl</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
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
			<h1 class="text-2xl font-semibold text-gray-900">FerreControl</h1>
			<p class="text-sm text-gray-500 mt-1">
				Restablecer tu contraseña
			</p>
		</div>

        <div class="card">
            <div class="card-body">
                {#if !token}
                    <div class="p-4 bg-danger-50 text-danger-700 text-sm rounded-lg text-center">
                        El enlace de recuperación es inválido o no se encontró el token de seguridad.
                        <div class="mt-4">
                            <a href="/login" class="text-primary-600 hover:underline font-medium">Volver al inicio</a>
                        </div>
                    </div>
                {:else}
                    <form
                        on:submit|preventDefault={cambiarPassword}
                        class="space-y-4"
                    >
                        {#if error}
                            <div class="p-3 bg-danger-50 border border-danger-200 text-danger-700 text-sm rounded-lg">
                                {error}
                            </div>
                        {/if}

                        <Input
                            id="newPassword"
                            label="Nueva contraseña"
                            type="password"
                            bind:value={newPassword}
                            placeholder="Mínimo 8 caracteres"
                            disabled={cargando}
                            required
                        />

                        <Input
                            id="confirmPassword"
                            label="Confirmar contraseña"
                            type="password"
                            bind:value={confirmPassword}
                            placeholder="Repite la nueva contraseña"
                            disabled={cargando}
                            required
                        />

                        <button
                            type="submit"
                            class="btn-primary w-full mt-2"
                            disabled={cargando}
                        >
                            {#if cargando}
                                Guardando...
                            {:else}
                                Guardar nueva contraseña
                            {/if}
                        </button>
                    </form>
                {/if}
            </div>
        </div>
    </div>
</div>
