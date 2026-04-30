<script lang="ts">
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { authApi } from "$api/auth";
    import { toastStore } from "$stores/toast.store";

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

                        <div>
                            <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                Nueva contraseña
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                bind:value={newPassword}
                                class="input"
                                placeholder="Mínimo 8 caracteres"
                                disabled={cargando}
                                required
                            />
                        </div>

                        <div>
                            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                bind:value={confirmPassword}
                                class="input"
                                placeholder="Repite la nueva contraseña"
                                disabled={cargando}
                                required
                            />
                        </div>

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
