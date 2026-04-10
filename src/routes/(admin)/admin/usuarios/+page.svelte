<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Select from "$components/ui/Select.svelte";
    import Button from "$components/ui/Button.svelte";
    import ConfirmDialog from "$components/ui/Confirmdialog.svelte";
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

    // Cambio de rol
    let usuarioCambioRol: Usuario | null = null;
    let nuevoRol: string = "";
    let cambiandoRol = false;

    // Toggle activo
    let usuarioToggle: Usuario | null = null;
    let toggling = false;

    async function cargar() {
        cargando = true;
        try {
            const filtros: Record<string, string> = {
                page: String(pagina),
                limit: "20",
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
        toggling = true;
        try {
            await usuariosApi.toggleActivo(
                usuarioToggle.id,
                !usuarioToggle.activo,
                accessToken,
            );
            toastStore.exito(
                usuarioToggle.activo
                    ? "Usuario desactivado"
                    : "Usuario activado",
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
        { value: "vendedor", label: "Vendedor" },
        { value: "bodeguero", label: "Bodeguero" },
    ];
</script>

<svelte:head><title>Usuarios — Ferretería ERP</title></svelte:head>

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
    <Pagination {total} bind:currentPage={pagina} />
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
