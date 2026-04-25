<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import Button from "$components/ui/Button.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import ConfirmDialog from "$components/ui/ConfirmDialog.svelte";
    import { comprasApi } from "$api/compras";
    import { toastStore } from "$stores/toast.store";
    import { formatFechaHora, esEmailValido } from "$utils/index";
    import type { Proveedor } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let proveedores: Proveedor[] = [];
    let total = 0;
    let cargando = true;
    let pagina = 1;
    let busqueda = "";

    // Form
    let modalForm = false;
    let modo: "crear" | "editar" = "crear";
    let proveedorEditId = "";
    let form = resetForm();
    let guardando = false;
    let errores: Record<string, string> = {};

    // Eliminar
    let proveedorEliminar: Proveedor | null = null;
    let eliminando = false;

    function resetForm() {
        return {
            nombre: "",
            ruc: "",
            telefono: "",
            email: "",
            direccion: "",
            contactoNombre: "",
            diasCredito: 30,
        };
    }

    async function cargar() {
        cargando = true;
        try {
            const filtros: Record<string, string> = {
                page: String(pagina),
                limit: "10",
            };
            if (busqueda) filtros.q = busqueda;
            const res = await comprasApi.proveedores.listar(
                filtros,
                accessToken,
            );
            proveedores = res.data;
            total = res.total;
        } catch {
            toastStore.error("Error al cargar proveedores");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function abrirCrear() {
        modo = "crear";
        proveedorEditId = "";
        form = resetForm();
        modalForm = true;
    }

    function abrirEditar(p: Proveedor) {
        modo = "editar";
        proveedorEditId = p.id;
        form = {
            nombre: p.nombre,
            ruc: p.ruc ?? "",
            telefono: p.telefono ?? "",
            email: p.email ?? "",
            direccion: p.direccion ?? "",
            contactoNombre: p.contactoNombre ?? "",
            diasCredito: p.diasCredito,
        };
        modalForm = true;
    }

    async function guardar() {
        errores = {};
        if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio";
        if (form.email && !esEmailValido(form.email))
            errores.email = "Formato de correo inválido";
        if (form.diasCredito < 0) errores.diasCredito = "No puede ser negativo";
        if (Object.keys(errores).length > 0) return;
        guardando = true;
        try {
            const payload: Partial<Proveedor> = {
                nombre: form.nombre,
                ruc: form.ruc || null,
                telefono: form.telefono || null,
                email: form.email || null,
                direccion: form.direccion || null,
                contactoNombre: form.contactoNombre || null,
                diasCredito: form.diasCredito,
            };
            if (modo === "crear") {
                await comprasApi.proveedores.crear(payload, accessToken);
                toastStore.exito("Proveedor creado");
            } else {
                await comprasApi.proveedores.actualizar(
                    proveedorEditId,
                    payload,
                    accessToken,
                );
                toastStore.exito("Proveedor actualizado");
            }
            modalForm = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al guardar");
        } finally {
            guardando = false;
        }
    }

    async function eliminar() {
        if (!proveedorEliminar) return;
        eliminando = true;
        try {
            await comprasApi.proveedores.eliminar(
                proveedorEliminar.id,
                accessToken,
            );
            toastStore.exito("Proveedor eliminado");
            proveedorEliminar = null;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al eliminar");
        } finally {
            eliminando = false;
        }
    }
</script>

<svelte:head><title>Proveedores — FerreControl</title></svelte:head>

<PageHeader titulo="Proveedores">
    <Button variant="primary" onclick={abrirCrear}>
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
                d="M12 4v16m8-8H4"
            />
        </svg>
        Nuevo proveedor
    </Button>
</PageHeader>

<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchInput
            value={busqueda}
            placeholder="Buscar proveedor..."
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
{:else if proveedores.length === 0}
    <EmptyState
        titulo="Sin proveedores"
        descripcion="No hay proveedores registrados"
        icono="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    >
        <Button variant="primary" onclick={abrirCrear}>Crear proveedor</Button>
    </EmptyState>
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>RUC/NIT</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Contacto</th>
                    <th class="text-center">Crédito (días)</th>
                    <th>Estado</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each proveedores as p}
                    <tr class="hover:bg-gray-50">
                        <td class="font-medium">{p.nombre}</td>
                        <td class="text-gray-500">{p.ruc ?? "—"}</td>
                        <td class="text-gray-500">{p.telefono ?? "—"}</td>
                        <td class="text-gray-500 text-xs">{p.email ?? "—"}</td>
                        <td class="text-gray-500">{p.contactoNombre ?? "—"}</td>
                        <td class="text-center">{p.diasCredito}</td>
                        <td
                            ><Badge variant={p.activo ? "green" : "gray"} dot
                                >{p.activo ? "Activo" : "Inactivo"}</Badge
                            ></td
                        >
                        <td class="text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button
                                    onclick={() => abrirEditar(p)}
                                    class="text-xs text-primary-500 hover:underline"
                                    >Editar</button
                                >
                                <button
                                    onclick={() => (proveedorEliminar = p)}
                                    class="text-xs text-danger-500 hover:underline"
                                    >Eliminar</button
                                >
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <Pagination {total} bind:currentPage={pagina} limit={10} />
{/if}

<!-- Modal crear/editar -->
<Modal
    bind:open={modalForm}
    title={modo === "crear" ? "Nuevo proveedor" : "Editar proveedor"}
    size="lg"
>
    <div class="space-y-4">
        <Input
            label="Nombre"
            bind:value={form.nombre}
            error={errores.nombre}
            required
            placeholder="Razón social o nombre comercial"
        />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="RUC / NIT"
                bind:value={form.ruc}
                placeholder="Opcional"
            />
            <Input
                label="Teléfono"
                bind:value={form.telefono}
                placeholder="Opcional"
            />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="Email"
                type="email"
                bind:value={form.email}
                error={errores.email}
                placeholder="Opcional"
            />
            <Input
                label="Nombre de contacto"
                bind:value={form.contactoNombre}
                placeholder="Opcional"
            />
        </div>
        <Input
            label="Dirección"
            bind:value={form.direccion}
            placeholder="Opcional"
        />
        <Input
            label="Días de crédito"
            type="number"
            bind:value={form.diasCredito}
            error={errores.diasCredito}
            min={0}
        />
    </div>
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalForm = false)}
            >Cancelar</Button
        >
        <Button variant="primary" loading={guardando} onclick={guardar}
            >{modo === "crear" ? "Crear" : "Guardar"}</Button
        >
    </svelte:fragment>
</Modal>

<!-- Confirmar eliminar -->
<ConfirmDialog
    open={!!proveedorEliminar}
    titulo="Eliminar proveedor"
    mensaje="¿Estás seguro de eliminar al proveedor «{proveedorEliminar?.nombre}»?"
    variant="danger"
    loading={eliminando}
    on:confirm={eliminar}
    on:cancel={() => (proveedorEliminar = null)}
/>
