<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Select from "$components/ui/Select.svelte";
    import Input from "$components/ui/Input.svelte";
    import Button from "$components/ui/Button.svelte";
    import ConfirmDialog from "$components/ui/ConfirmDialog.svelte";
    import { usuariosApi } from "$api/usuarios";
    import { toastStore } from "$stores/toast.store";
    import { formatFechaHora } from "$utils/index";
    import type { Usuario, RolUsuario } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let usuarios: Usuario[] = [];
    let total = 0;
    let cargando = true;
    let busqueda = "";
    let pagina = 1;

    // Crear usuario
    let mostrarCrear = false;
    let creando = false;
    let nuevoNombre = "";
    let nuevoEmail = "";
    let nuevoPassword = "";
    let confirmarPassword = "";
    let nuevoRolCrear = "cajero";
    let enviarPorEmail = true;
    let erroresCrear: Record<string, string> = {};

    // Cambio de rol
    let usuarioCambioRol: Usuario | null = null;
    let nuevoRol: string = "";
    let cambiandoRol = false;

    // Toggle activo
    let usuarioToggle: Usuario | null = null;
    let toggling = false;

    // Cambio de contraseña (otros usuarios)
    let usuarioCambioPassword: Usuario | null = null;
    let nuevoPasswordUsuario = "";
    let confirmarPasswordUsuario = "";
    let cambiandoPasswordUsuario = false;
    let errorPasswordUsuario = "";

    function abrirCambioPassword(u: Usuario) {
        usuarioCambioPassword = u;
        nuevoPasswordUsuario = "";
        confirmarPasswordUsuario = "";
        errorPasswordUsuario = "";
    }

    async function cambiarPassword() {
        errorPasswordUsuario = "";
        if (!usuarioCambioPassword || !nuevoPasswordUsuario) {
            errorPasswordUsuario = "La nueva contraseña es obligatoria";
            return;
        }
        if (nuevoPasswordUsuario !== confirmarPasswordUsuario) {
            errorPasswordUsuario = "Las contraseñas no coinciden";
            return;
        }
        if (nuevoPasswordUsuario.length < 8) {
            errorPasswordUsuario = "Mínimo 8 caracteres";
            return;
        }
        cambiandoPasswordUsuario = true;
        try {
            await usuariosApi.cambiarPasswordUsuario(
                usuarioCambioPassword.id,
                nuevoPasswordUsuario,
                accessToken,
            );
            toastStore.exito("Contraseña actualizada correctamente");
            usuarioCambioPassword = null;
        } catch (e: any) {
            errorPasswordUsuario =
                e?.mensajes?.[0] ?? "Error al cambiar contraseña";
        } finally {
            cambiandoPasswordUsuario = false;
        }
    }

    async function cargar() {
        cargando = true;
        try {
            const filtros: Record<string, string> = {
                page: String(pagina),
                limit: "10",
            };
            if (busqueda) filtros.q = busqueda;
            const res = await usuariosApi.listar(filtros, accessToken);
            usuarios = res.data;
            total = res.total;
        } catch {
            toastStore.error("Error al cargar usuarios");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function abrirCrear() {
        nuevoNombre = "";
        nuevoEmail = "";
        nuevoPassword = "";
        confirmarPassword = "";
        nuevoRolCrear = "cajero";
        enviarPorEmail = true;
        erroresCrear = {};
        mostrarCrear = true;
    }

    function generarPassword(): string {
        const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lower = "abcdefghijklmnopqrstuvwxyz";
        const digits = "0123456789";
        const all = upper + lower + digits;
        let pwd = "";
        pwd += upper[Math.floor(Math.random() * upper.length)];
        pwd += lower[Math.floor(Math.random() * lower.length)];
        pwd += digits[Math.floor(Math.random() * digits.length)];
        for (let i = 3; i < 12; i++)
            pwd += all[Math.floor(Math.random() * all.length)];
        return pwd
            .split("")
            .sort(() => Math.random() - 0.5)
            .join("");
    }

    function autogenerarPassword() {
        const pwd = generarPassword();
        nuevoPassword = pwd;
        confirmarPassword = pwd;
        erroresCrear = { ...erroresCrear, password: "", confirmar: "" };
    }

    function validarCrear(): boolean {
        erroresCrear = {};
        if (!nuevoNombre.trim()) erroresCrear.nombre = "El nombre es requerido";
        if (!nuevoEmail.trim()) erroresCrear.email = "El email es requerido";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmail))
            erroresCrear.email = "Email inválido";
        if (!nuevoPassword)
            erroresCrear.password = "La contraseña es requerida";
        else if (nuevoPassword.length < 8)
            erroresCrear.password = "Mínimo 8 caracteres";
        else if (
            !/[A-Z]/.test(nuevoPassword) ||
            !/[a-z]/.test(nuevoPassword) ||
            !/[0-9]/.test(nuevoPassword)
        )
            erroresCrear.password = "Debe tener mayúscula, minúscula y número";
        if (nuevoPassword !== confirmarPassword)
            erroresCrear.confirmar = "Las contraseñas no coinciden";
        return (
            Object.keys(erroresCrear).filter((k) => erroresCrear[k]).length ===
            0
        );
    }

    async function crearUsuario() {
        if (!validarCrear()) return;
        creando = true;
        try {
            await usuariosApi.crear(
                {
                    nombre: nuevoNombre.trim(),
                    email: nuevoEmail.trim(),
                    password: nuevoPassword,
                    rol: nuevoRolCrear,
                },
                accessToken,
            );
            toastStore.exito("Usuario creado correctamente");
            mostrarCrear = false;
            pagina = 1;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al crear usuario");
        } finally {
            creando = false;
        }
    }

    function abrirCambioRol(u: Usuario) {
        usuarioCambioRol = u;
        nuevoRol = u.rol;
    }

    async function cambiarRol() {
        if (!usuarioCambioRol || !nuevoRol) return;
        cambiandoRol = true;
        try {
            await usuariosApi.cambiarRol(
                usuarioCambioRol.id,
                nuevoRol,
                accessToken,
            );
            toastStore.exito("Rol actualizado");
            usuarioCambioRol = null;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al cambiar rol");
        } finally {
            cambiandoRol = false;
        }
    }

    async function toggleActivo() {
        if (!usuarioToggle) return;
        const usuario = usuarioToggle;
        usuarioToggle = null;
        toggling = true;
        try {
            await usuariosApi.toggleActivo(
                usuario.id,
                !usuario.activo,
                accessToken,
            );
            toastStore.exito(
                usuario.activo ? "Usuario desactivado" : "Usuario activado",
            );
            usuarioToggle = null;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error");
        } finally {
            toggling = false;
        }
    }

    const rolColor: Record<string, "green" | "blue" | "yellow" | "gray"> = {
        admin: "green",
        cajero: "blue",
        vendedor: "yellow",
        bodeguero: "gray",
    };

    const rolOpciones = [
        { value: "admin", label: "Administrador" },
        { value: "cajero", label: "Cajero" },
        { value: "bodeguero", label: "Bodeguero" },
    ];
</script>

<svelte:head><title>Usuarios — FerreControl</title></svelte:head>

<PageHeader titulo="Usuarios" />

<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchInput
            value={busqueda}
            placeholder="Buscar por nombre o email..."
            on:search={(e) => {
                busqueda = e.detail;
                pagina = 1;
                cargar();
            }}
        />
    </div>
    <Button variant="primary" onclick={abrirCrear}>
        <svg
            class="w-4 h-4 mr-1.5 -ml-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
            />
        </svg>
        Nuevo usuario
    </Button>
</div>

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if usuarios.length === 0}
    <EmptyState
        titulo="Sin usuarios"
        descripcion="No se encontraron usuarios"
        icono="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Registrado</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each usuarios as u}
                    <tr class="hover:bg-gray-50">
                        <td class="font-medium text-gray-900">{u.nombre}</td>
                        <td class="text-gray-500">{u.email}</td>
                        <td
                            ><Badge variant={rolColor[u.rol] ?? "gray"}
                                >{u.rol}</Badge
                            ></td
                        >
                        <td
                            ><Badge variant={u.activo ? "green" : "red"} dot
                                >{u.activo ? "Activo" : "Inactivo"}</Badge
                            ></td
                        >
                        <td class="text-xs text-gray-400"
                            >{formatFechaHora(u.createdAt)}</td
                        >
                        <td class="text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button
                                    onclick={() => abrirCambioPassword(u)}
                                    class="text-xs text-primary-500 hover:underline"
                                >
                                    Cambiar contraseña
                                </button>
                                <button
                                    onclick={() => abrirCambioRol(u)}
                                    class="text-xs text-primary-500 hover:underline"
                                    >Cambiar rol</button
                                >
                                <button
                                    onclick={() => (usuarioToggle = u)}
                                    class="text-xs {u.activo
                                        ? 'text-danger-500'
                                        : 'text-primary-500'} hover:underline"
                                >
                                    {u.activo ? "Desactivar" : "Activar"}
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <Pagination {total} bind:currentPage={pagina} limit={10} />
{/if}

<!-- Modal crear usuario -->
{#if mostrarCrear}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onclick={() => (mostrarCrear = false)}
    >
        <div
            class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-modal-in"
            onclick={(e) => e.stopPropagation()}
        >
            <!-- Header -->
            <div class="bg-primary-50 px-5 py-4 flex items-center gap-3">
                <div
                    class="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center"
                >
                    <svg
                        class="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-semibold text-gray-900">
                        Nuevo usuario
                    </h2>
                    <p class="text-xs text-gray-500">
                        Completa los datos para registrar un usuario
                    </p>
                </div>
            </div>

            <!-- Body -->
            <div class="px-5 py-4 space-y-4">
                <Input
                    label="Nombre completo"
                    bind:value={nuevoNombre}
                    placeholder="Ej: Juan Pérez"
                    error={erroresCrear.nombre}
                    required
                />
                <Input
                    label="Email"
                    type="email"
                    bind:value={nuevoEmail}
                    placeholder="usuario@correo.com"
                    error={erroresCrear.email}
                    required
                />
                <Select
                    label="Rol"
                    options={rolOpciones}
                    bind:value={nuevoRolCrear}
                />

                <!-- Contraseña con botón autogenerar -->
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="block text-sm font-medium text-gray-700">
                            Contraseña <span class="text-danger-400">*</span>
                        </span>
                        <button
                            type="button"
                            onclick={autogenerarPassword}
                            class="inline-flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-600 transition-colors"
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
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Autogenerar
                        </button>
                    </div>
                    <Input
                        type="password"
                        bind:value={nuevoPassword}
                        placeholder="Mínimo 8 caracteres"
                        error={erroresCrear.password}
                        hint="Debe incluir mayúscula, minúscula y número"
                    />
                </div>

                <Input
                    label="Confirmar contraseña"
                    type="password"
                    bind:value={confirmarPassword}
                    placeholder="Repite la contraseña"
                    error={erroresCrear.confirmar}
                    required
                />

                <!-- Check enviar por email -->
                <label
                    class="flex items-center gap-2.5 cursor-pointer select-none"
                >
                    <input
                        type="checkbox"
                        bind:checked={enviarPorEmail}
                        class="w-4 h-4 rounded border-gray-300 text-primary-400 focus:ring-primary-400"
                    />
                    <span class="text-sm text-gray-600"
                        >Enviar credenciales por email al usuario</span
                    >
                </label>
            </div>

            <!-- Footer -->
            <div class="px-5 pb-5 flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (mostrarCrear = false)}
                    disabled={creando}
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    fullWidth
                    loading={creando}
                    onclick={crearUsuario}
                >
                    Crear usuario
                </Button>
            </div>
        </div>
    </div>
{/if}

<!-- Modal cambio de rol -->
{#if usuarioCambioRol}
    <div
        class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4"
        >
            <h2 class="text-base font-semibold text-gray-900">
                Cambiar rol de {usuarioCambioRol.nombre}
            </h2>
            <Select
                label="Nuevo rol"
                options={rolOpciones}
                bind:value={nuevoRol}
            />
            <div class="flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (usuarioCambioRol = null)}>Cancelar</Button
                >
                <Button
                    variant="primary"
                    fullWidth
                    loading={cambiandoRol}
                    onclick={cambiarRol}>Guardar</Button
                >
            </div>
        </div>
    </div>
{/if}

<!-- Modal cambio de contraseña -->
{#if usuarioCambioPassword}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4"
        onclick={() => (usuarioCambioPassword = null)}
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4"
            onclick={(e) => e.stopPropagation()}
        >
            <h2 class="text-base font-semibold text-gray-900">
                Cambiar contraseña de {usuarioCambioPassword.nombre}
            </h2>
            <Input
                label="Nueva contraseña"
                type="password"
                bind:value={nuevoPasswordUsuario}
                placeholder="Mínimo 8 caracteres"
            />
            <Input
                label="Confirmar contraseña"
                type="password"
                bind:value={confirmarPasswordUsuario}
                placeholder="Repite la contraseña"
            />
            {#if errorPasswordUsuario}
                <p class="text-xs text-danger-500">{errorPasswordUsuario}</p>
            {/if}
            <div class="flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (usuarioCambioPassword = null)}
                    >Cancelar</Button
                >
                <Button
                    variant="primary"
                    fullWidth
                    loading={cambiandoPasswordUsuario}
                    onclick={cambiarPassword}>Guardar</Button
                >
            </div>
        </div>
    </div>
{/if}

<ConfirmDialog
    open={!!usuarioToggle}
    titulo="{usuarioToggle?.activo ? 'Desactivar' : 'Activar'} usuario"
    mensaje="¿Deseas {usuarioToggle?.activo
        ? 'desactivar'
        : 'activar'} a {usuarioToggle?.nombre ?? ''}?"
    labelConfirmar={usuarioToggle?.activo ? "Desactivar" : "Activar"}
    variant={usuarioToggle?.activo ? "danger" : "primary"}
    cargando={toggling}
    on:confirmar={toggleActivo}
    on:cancelar={() => (usuarioToggle = null)}
/>

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
