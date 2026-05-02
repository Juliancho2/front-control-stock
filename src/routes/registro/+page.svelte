<script lang="ts">
    import { enhance } from "$app/forms";
    import IconLogo from "$components/ui/IconLogo.svelte";
    import type { ActionData } from "./$types";

    export let form: ActionData;

    let cargando = false;
    let mostrarPassword = false;
    let mostrarConfirmarPassword = false;
    let errores: Record<string, string> = {};

    // Auto-generar slug desde nombre del negocio
    let nombreNegocio = form?.nombreNegocio ?? "";
    let slugManual = false;
    let slug = form?.slug ?? "";

    function generarSlug(texto: string): string {
        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    function onNombreInput() {
        if (!slugManual) {
            slug = generarSlug(nombreNegocio);
        }
    }

    function onSlugInput() {
        slugManual = true;
    }

    function validarLocal(formData: FormData): boolean {
        errores = {};
        const nn = formData.get("nombreNegocio")?.toString().trim() ?? "";
        const s = formData.get("slug")?.toString().trim() ?? "";
        const n = formData.get("nombre")?.toString().trim() ?? "";
        const e = formData.get("email")?.toString().trim() ?? "";
        const p = formData.get("password")?.toString() ?? "";

        if (!nn) errores.nombreNegocio = "El nombre del negocio es obligatorio";
        if (!s) errores.slug = "El identificador es obligatorio";
        else if (!/^[a-z0-9-]+$/.test(s))
            errores.slug = "Solo minúsculas, números y guiones";
        if (!n) errores.nombre = "Tu nombre es obligatorio";
        if (!e) errores.email = "El correo es obligatorio";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
            errores.email = "Formato de correo inválido";
        if (!p) errores.password = "La contraseña es obligatoria";
        else if (p.length < 8) errores.password = "Mínimo 8 caracteres";

        const pc = formData.get("confirmarPassword")?.toString() ?? "";
        if (!pc) errores.confirmarPassword = "Confirma tu contraseña";
        else if (p !== pc)
            errores.confirmarPassword = "Las contraseñas no coinciden";

        return Object.keys(errores).length === 0;
    }
</script>

<svelte:head>
    <title>Registrar negocio — FerreControl</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-xl">
        <!-- Logo / título -->
        <div class="text-center mb-8">
            <div class="flex items-center justify-center mb-4">
                <IconLogo className="w-[75px] h-[75px]" />
                <h1 class="text-3xl font-bold text-gray-900 self-center ml-3">
                    FerreControl
                </h1>
            </div>
            <p class="text-2xl font-semibold text-slate-800 my-1">
                Registra tu negocio
            </p>
            <p class="text-base text-gray-500">
                Controla ventas, inventario y caja en minutos.
            </p>
        </div>

        <!-- Card del formulario -->
        <div class="card">
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

                    <section class="grid gap-4 lg:grid-cols-2 w-full">
                        <!-- Sección: Datos del negocio -->
                        <div class="pb-2">
                            <h2
                                class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3"
                            >
                                Datos del negocio
                            </h2>

                            <!-- Nombre del negocio -->
                            <div class="mb-3">
                                <label
                                    for="nombreNegocio"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Nombre del negocio <span
                                        class="text-danger-500">*</span
                                    >
                                </label>
                                <input
                                    id="nombreNegocio"
                                    name="nombreNegocio"
                                    type="text"
                                    required
                                    bind:value={nombreNegocio}
                                    oninput={onNombreInput}
                                    placeholder="Ferretería El Tornillo"
                                    class="input"
                                    class:border-danger-400={errores.nombreNegocio}
                                    disabled={cargando}
                                />
                                {#if errores.nombreNegocio}
                                    <p class="text-xs text-danger-600 mt-1">
                                        {errores.nombreNegocio}
                                    </p>
                                {/if}
                            </div>

                            <!-- Slug -->
                            <div>
                                <label
                                    for="slug"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Identificador único <span
                                        class="text-danger-500">*</span
                                    >
                                </label>
                                <input
                                    id="slug"
                                    name="slug"
                                    type="text"
                                    required
                                    bind:value={slug}
                                    oninput={onSlugInput}
                                    placeholder="ferreteria-el-tornillo"
                                    class="input font-mono text-sm"
                                    class:border-danger-400={errores.slug}
                                    disabled={cargando}
                                    readonly
                                />
                                <p class="text-xs text-gray-400 mt-1">
                                    Se genera automáticamente. Solo minúsculas,
                                    números y guiones.
                                </p>
                                {#if errores.slug}
                                    <p class="text-xs text-danger-600 mt-1">
                                        {errores.slug}
                                    </p>
                                {/if}
                            </div>
                        </div>

                        <!-- Sección: Datos del administrador -->
                        <div class="border-t pt-4 lg:pt-0 border-gray-100">
                            <h2
                                class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3"
                            >
                                Tu cuenta de administrador
                            </h2>

                            <!-- Nombre -->
                            <div class="mb-3">
                                <label
                                    for="nombre"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Nombre completo <span
                                        class="text-danger-500">*</span
                                    >
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    required
                                    value={form?.nombre ?? ""}
                                    placeholder="Juan Pérez"
                                    class="input"
                                    class:border-danger-400={errores.nombre}
                                    disabled={cargando}
                                />
                                {#if errores.nombre}
                                    <p class="text-xs text-danger-600 mt-1">
                                        {errores.nombre}
                                    </p>
                                {/if}
                            </div>

                            <!-- Email -->
                            <div class="mb-3">
                                <label
                                    for="email"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Correo electrónico <span
                                        class="text-danger-500">*</span
                                    >
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autocomplete="email"
                                    required
                                    value={form?.email ?? ""}
                                    placeholder="admin@ferreteria.com"
                                    class="input"
                                    class:border-danger-400={errores.email}
                                    disabled={cargando}
                                />
                                {#if errores.email}
                                    <p class="text-xs text-danger-600 mt-1">
                                        {errores.email}
                                    </p>
                                {/if}
                            </div>

                            <!-- Password -->
                            <div class="mb-3">
                                <label
                                    for="password"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Contraseña <span class="text-danger-500"
                                        >*</span
                                    >
                                </label>
                                <div class="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={mostrarPassword
                                            ? "text"
                                            : "password"}
                                        autocomplete="new-password"
                                        required
                                        placeholder="••••••••"
                                        class="input pr-10"
                                        class:border-danger-400={errores.password}
                                        disabled={cargando}
                                    />
                                    <button
                                        type="button"
                                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        onclick={() =>
                                            (mostrarPassword =
                                                !mostrarPassword)}
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
                                <p class="text-xs text-gray-400 mt-1">
                                    Mínimo 8 caracteres
                                </p>
                                {#if errores.password}
                                    <p class="text-xs text-danger-600 mt-1">
                                        {errores.password}
                                    </p>
                                {/if}
                            </div>

                            <!-- Confirmar contraseña -->
                            <div>
                                <label
                                    for="confirmarPassword"
                                    class="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Confirmar contraseña <span
                                        class="text-danger-500">*</span
                                    >
                                </label>
                                <div class="relative">
                                    <input
                                        id="confirmarPassword"
                                        name="confirmarPassword"
                                        type={mostrarConfirmarPassword
                                            ? "text"
                                            : "password"}
                                        autocomplete="new-password"
                                        required
                                        placeholder="••••••••"
                                        class="input"
                                        class:border-danger-400={errores.confirmarPassword}
                                        disabled={cargando}
                                    />
                                    <button
                                        type="button"
                                        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        onclick={() =>
                                            (mostrarConfirmarPassword =
                                                !mostrarConfirmarPassword)}
                                        tabindex="-1"
                                    >
                                        {#if mostrarConfirmarPassword}
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
                                    {#if errores.confirmarPassword}
                                        <p class="text-xs text-danger-600 mt-1">
                                            {errores.confirmarPassword}
                                        </p>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </section>

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
                            Registrando...
                        {:else}
                            Empieza gratis
                        {/if}
                    </button>
                    <p
                        class="text-center font-semibold text-xs text-gray-500 mt-3"
                    >
                        Prueba gratis 15 días · Sin tarjeta.
                    </p>
                </form>
            </div>
        </div>

        <!-- Link a login -->
        <p class="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?
            <a
                href="/login"
                class="font-medium text-primary-600 hover:text-primary-800"
            >
                Inicia sesión
            </a>
        </p>
    </div>
</div>
