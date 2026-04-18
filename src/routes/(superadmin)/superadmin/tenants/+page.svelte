<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Input from "$components/ui/Input.svelte";
    import Select from "$components/ui/Select.svelte";
    import Button from "$components/ui/Button.svelte";
    import { tenantsApi } from "$api/tenants";
    import { planesApi } from "$api/planes";
    import { toastStore } from "$stores/toast.store";
    import { formatFechaHora } from "$utils/index";
    import type { Tenant, Plan } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let tenants: Tenant[] = [];
    let planes: Plan[] = [];
    let cargando = true;

    // Crear / Editar
    let mostrarModal = false;
    let editando: Tenant | null = null;
    let guardando = false;
    let nombre = "";
    let slug = "";
    let planId = "";
    let errores: Record<string, string> = {};

    // Campos admin (solo al crear)
    let adminNombre = "";
    let adminEmail = "";
    let adminPassword = "";
    let adminPasswordConfirm = "";

    // Toggle activo
    let tenantToggle: Tenant | null = null;
    let toggling = false;

    async function cargar() {
        cargando = true;
        try {
            [tenants, planes] = await Promise.all([
                tenantsApi.listar(accessToken),
                planesApi.listar(accessToken),
            ]);
        } catch {
            toastStore.error("Error al cargar tenants");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function slugify(text: string): string {
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function abrirCrear() {
        editando = null;
        nombre = "";
        slug = "";
        planId = planes.length > 0 ? planes[0].id : "";
        adminNombre = "";
        adminEmail = "";
        adminPassword = "";
        adminPasswordConfirm = "";
        errores = {};
        mostrarModal = true;
    }

    function abrirEditar(t: Tenant) {
        editando = t;
        nombre = t.nombre;
        slug = t.slug;
        planId = t.planId ?? "";
        errores = {};
        mostrarModal = true;
    }

    function validar(): boolean {
        errores = {};
        if (!nombre.trim()) errores.nombre = "El nombre es requerido";
        if (!editando) {
            if (!slug.trim()) errores.slug = "El slug es requerido";
            else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
                errores.slug =
                    "Solo minúsculas, números y guiones. Ej: mi-empresa";
            if (!adminNombre.trim())
                errores.adminNombre =
                    "El nombre del administrador es requerido";
            if (!adminEmail.trim())
                errores.adminEmail = "El email es requerido";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail))
                errores.adminEmail = "Email no válido";
            if (!adminPassword)
                errores.adminPassword = "La contraseña es requerida";
            else if (adminPassword.length < 8)
                errores.adminPassword = "Mínimo 8 caracteres";
            if (adminPassword !== adminPasswordConfirm)
                errores.adminPasswordConfirm = "Las contraseñas no coinciden";
        }
        return Object.keys(errores).filter((k) => errores[k]).length === 0;
    }

    async function guardar() {
        if (!validar()) return;
        guardando = true;
        try {
            if (editando) {
                await tenantsApi.actualizar(
                    editando.id,
                    { nombre: nombre.trim(), planId: planId || undefined },
                    accessToken,
                );
                toastStore.exito("Tenant actualizado");
            } else {
                await tenantsApi.crear(
                    {
                        nombre: nombre.trim(),
                        slug: slug.trim(),
                        planId: planId || undefined,
                        admin: {
                            nombre: adminNombre.trim(),
                            email: adminEmail.trim().toLowerCase(),
                            password: adminPassword,
                        },
                    },
                    accessToken,
                );
                toastStore.exito(
                    "Tenant y administrador creados correctamente",
                );
            }
            mostrarModal = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al guardar tenant");
        } finally {
            guardando = false;
        }
    }

    async function toggleActivo() {
        if (!tenantToggle) return;
        toggling = true;
        try {
            await tenantsApi.actualizar(
                tenantToggle.id,
                { activo: !tenantToggle.activo },
                accessToken,
            );
            toastStore.exito(
                tenantToggle.activo ? "Tenant desactivado" : "Tenant activado",
            );
            tenantToggle = null;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error");
        } finally {
            toggling = false;
        }
    }

    function formatPrecio(precio: number, moneda: string): string {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: moneda,
            minimumFractionDigits: 0,
        }).format(precio);
    }

    $: planOpciones = planes
        .filter((p) => p.activo)
        .map((p) => ({
            value: p.id,
            label: `${p.nombre} — ${formatPrecio(p.precioMensual, p.moneda)}/mes`,
        }));
</script>

<svelte:head><title>Tenants — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Tenants (Empresas)" />

<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1"></div>
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
        Nuevo tenant
    </Button>
</div>

{#if cargando}
    <div class="flex items-center justify-center py-20">
        <Spinner size="lg" />
    </div>
{:else if tenants.length === 0}
    <EmptyState
        titulo="Sin tenants"
        descripcion="No se encontraron empresas registradas"
        icono="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    />
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Slug</th>
                    <th>Plan</th>
                    <th>Estado</th>
                    <th>Creado</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each tenants as t}
                    <tr class="hover:bg-gray-50">
                        <td class="font-medium text-gray-900">{t.nombre}</td>
                        <td class="text-gray-500 font-mono text-xs">{t.slug}</td
                        >
                        <td
                            ><Badge variant="blue"
                                >{t.plan?.nombre ?? "Sin plan"}</Badge
                            ></td
                        >
                        <td
                            ><Badge variant={t.activo ? "green" : "red"} dot
                                >{t.activo ? "Activo" : "Inactivo"}</Badge
                            ></td
                        >
                        <td class="text-xs text-gray-400"
                            >{formatFechaHora(t.createdAt)}</td
                        >
                        <td class="text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button
                                    onclick={() => abrirEditar(t)}
                                    class="text-xs text-primary-600 hover:underline"
                                    >Editar</button
                                >
                                <button
                                    onclick={() => (tenantToggle = t)}
                                    class="text-xs {t.activo
                                        ? 'text-red-500'
                                        : 'text-primary-600'} hover:underline"
                                >
                                    {t.activo ? "Desactivar" : "Activar"}
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}

<!-- Modal crear/editar tenant -->
{#if mostrarModal}
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
    <div
        class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onclick={() => (mostrarModal = false)}
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
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                </div>
                <div>
                    <h2 class="text-base font-semibold text-gray-900">
                        {editando ? "Editar tenant" : "Nuevo tenant"}
                    </h2>
                    <p class="text-xs text-gray-500">
                        {editando
                            ? "Modifica los datos de la empresa"
                            : "Registra una nueva empresa en el sistema"}
                    </p>
                </div>
            </div>

            <!-- Body -->
            <div class="px-5 py-4 space-y-4">
                <Input
                    label="Nombre"
                    bind:value={nombre}
                    placeholder="Ej: Ferretería Central"
                    error={errores.nombre}
                    required
                    oninput={() => {
                        if (!editando) slug = slugify(nombre);
                    }}
                />

                {#if !editando}
                    <Input
                        label="Slug (identificador único)"
                        bind:value={slug}
                        placeholder="ej: ferreteria-central"
                        error={errores.slug}
                        required
                        hint="URL-friendly. Solo minúsculas, números y guiones"
                    />
                {:else}
                    <div>
                        <span
                            class="block text-sm font-medium text-gray-700 mb-1"
                            >Slug</span
                        >
                        <p
                            class="text-sm text-gray-500 font-mono bg-gray-50 px-3 py-2 rounded-lg"
                        >
                            {editando.slug}
                        </p>
                        <p class="text-xs text-gray-400 mt-1">
                            El slug no se puede cambiar
                        </p>
                    </div>
                {/if}

                <Select
                    label="Plan"
                    options={planOpciones}
                    bind:value={planId}
                />

                {#if !editando}
                    <div class="border-t pt-4 mt-2">
                        <h3 class="text-sm font-semibold text-gray-700 mb-3">
                            Administrador inicial
                        </h3>
                        <div class="space-y-3">
                            <Input
                                label="Nombre del administrador"
                                bind:value={adminNombre}
                                placeholder="Ej: Juan Pérez"
                                error={errores.adminNombre}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                bind:value={adminEmail}
                                placeholder="admin@empresa.com"
                                error={errores.adminEmail}
                                required
                            />
                            <Input
                                label="Contraseña"
                                type="password"
                                bind:value={adminPassword}
                                placeholder="Mínimo 8 caracteres"
                                error={errores.adminPassword}
                                required
                            />
                            <Input
                                label="Confirmar contraseña"
                                type="password"
                                bind:value={adminPasswordConfirm}
                                placeholder="Repetir contraseña"
                                error={errores.adminPasswordConfirm}
                                required
                            />
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            <div class="px-5 pb-5 flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (mostrarModal = false)}
                    disabled={guardando}
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    fullWidth
                    loading={guardando}
                    onclick={guardar}
                >
                    {editando ? "Guardar cambios" : "Crear tenant"}
                </Button>
            </div>
        </div>
    </div>
{/if}

<!-- Confirmación toggle activo -->
{#if tenantToggle}
    <div
        class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
        <div
            class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4"
        >
            <h2 class="text-base font-semibold text-gray-900">
                {tenantToggle.activo ? "Desactivar" : "Activar"} tenant
            </h2>
            <p class="text-sm text-gray-600">
                ¿Deseas {tenantToggle.activo ? "desactivar" : "activar"} a
                <strong>{tenantToggle.nombre}</strong>?
                {#if tenantToggle.activo}
                    <span class="block mt-1 text-xs text-red-500"
                        >Los usuarios de este tenant no podrán acceder al
                        sistema.</span
                    >
                {/if}
            </p>
            <div class="flex gap-3">
                <Button
                    variant="secondary"
                    fullWidth
                    onclick={() => (tenantToggle = null)}
                    disabled={toggling}>Cancelar</Button
                >
                <Button
                    variant={tenantToggle.activo ? "danger" : "primary"}
                    fullWidth
                    loading={toggling}
                    onclick={toggleActivo}
                    >{tenantToggle.activo ? "Desactivar" : "Activar"}</Button
                >
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
