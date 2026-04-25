<script lang="ts">
    import { onMount } from "svelte";
    import PageHeader from "$components/layout/PageHeader.svelte";
    import Button from "$components/ui/Button.svelte";
    import Badge from "$components/ui/Badge.svelte";
    import Spinner from "$components/ui/Spinner.svelte";
    import SearchInput from "$components/ui/SearchInput.svelte";
    import Pagination from "$components/ui/Pagination.svelte";
    import EmptyState from "$components/ui/EmptyState.svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Input from "$components/ui/Input.svelte";
    import Select from "$components/ui/Select.svelte";
    import { clientesApi, type FiltroClientes } from "$api/clientes";
    import { toastStore } from "$stores/toast.store";
    import {
        formatCurrency,
        formatFechaHora,
        esEmailValido,
    } from "$utils/index";
    import type { Cliente, TipoCliente } from "$types/index";

    export let data: { accessToken: string };
    const { accessToken } = data;

    let clientes: Cliente[] = [];
    let total = 0;
    let cargando = true;
    let busqueda = "";
    let filtroTipo: string = "";
    let pagina = 1;

    // Modal crear/editar
    let modalAbierto = false;
    let clienteEditar: Cliente | null = null;
    let guardando = false;
    let form = resetForm();
    let errores: Record<string, string> = {};

    // Modal detalle/crédito
    let clienteDetalle: Cliente | null = null;
    let modalDetalleAbierto = false;
    let montoAbono = 0;
    let referenciaAbono = "";
    let abonando = false;

    function resetForm() {
        return {
            nombre: "",
            tipo: "consumidor_final" as string,
            rucCedula: "",
            telefono: "",
            email: "",
            direccion: "",
            limiteCredito: 0,
        };
    }

    async function cargar() {
        cargando = true;
        try {
            const filtros: FiltroClientes = { page: pagina, limit: 10 };
            if (busqueda) filtros.q = busqueda;
            if (filtroTipo) filtros.tipo = filtroTipo;
            const res = await clientesApi.listar(filtros, accessToken);
            clientes = res.data;
            total = res.total;
        } catch {
            toastStore.error("Error al cargar clientes");
        } finally {
            cargando = false;
        }
    }

    onMount(cargar);

    function abrirCrear() {
        clienteEditar = null;
        form = resetForm();
        modalAbierto = true;
    }

    function abrirEditar(c: Cliente) {
        clienteEditar = c;
        form = {
            nombre: c.nombre,
            tipo: c.tipo,
            rucCedula: c.rucCedula ?? "",
            telefono: c.telefono ?? "",
            email: c.email ?? "",
            direccion: c.direccion ?? "",
            limiteCredito: c.limiteCredito,
        };
        modalAbierto = true;
    }

    async function guardar() {
        errores = {};
        if (!form.nombre.trim()) errores.nombre = "El nombre es obligatorio";
        if (form.email && !esEmailValido(form.email))
            errores.email = "Formato de correo inválido";
        if (form.limiteCredito < 0)
            errores.limiteCredito = "No puede ser negativo";
        if (Object.keys(errores).length > 0) return;
        guardando = true;
        try {
            const payload = {
                ...form,
                rucCedula: form.rucCedula || null,
                telefono: form.telefono || null,
                email: form.email || null,
                direccion: form.direccion || null,
            };
            if (clienteEditar) {
                await clientesApi.actualizar(
                    clienteEditar.id,
                    payload,
                    accessToken,
                );
                toastStore.exito("Cliente actualizado");
            } else {
                await clientesApi.crear(payload, accessToken);
                toastStore.exito("Cliente creado");
            }
            modalAbierto = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al guardar");
        } finally {
            guardando = false;
        }
    }

    function verDetalle(c: Cliente) {
        clienteDetalle = c;
        montoAbono = 0;
        referenciaAbono = "";
        modalDetalleAbierto = true;
    }

    async function abonar() {
        if (!clienteDetalle || montoAbono <= 0) return;
        abonando = true;
        try {
            await clientesApi.abonarDeuda(
                clienteDetalle.id,
                montoAbono,
                referenciaAbono || undefined,
                accessToken,
            );
            toastStore.exito("Abono registrado");
            modalDetalleAbierto = false;
            cargar();
        } catch (e: any) {
            toastStore.error(e?.mensajes?.[0] ?? "Error al registrar abono");
        } finally {
            abonando = false;
        }
    }

    const tipoCliente: Record<string, string> = {
        consumidor_final: "Consumidor",
        empresa: "Empresa",
        mayorista: "Mayorista",
    };
    const tipoOpciones = [
        { value: "", label: "Todos los tipos" },
        { value: "consumidor_final", label: "Consumidor Final" },
        { value: "empresa", label: "Empresa" },
        { value: "mayorista", label: "Mayorista" },
    ];
</script>

<svelte:head><title>Clientes — FerreControl</title></svelte:head>

<PageHeader titulo="Clientes">
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
        Nuevo cliente
    </Button>
</PageHeader>

<div class="flex flex-wrap items-end gap-3 mb-4">
    <div class="flex-1 min-w-[200px] max-w-sm">
        <SearchInput
            value={busqueda}
            placeholder="Buscar por nombre o RUC..."
            on:search={(e) => {
                busqueda = e.detail;
                pagina = 1;
                cargar();
            }}
        />
    </div>
    <div class="w-48">
        <Select
            options={tipoOpciones}
            bind:value={filtroTipo}
            on:change={() => {
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
{:else if clientes.length === 0}
    <EmptyState
        titulo="Sin clientes"
        descripcion="No se encontraron clientes"
        icono="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    >
        <Button variant="primary" onclick={abrirCrear}>Crear cliente</Button>
    </EmptyState>
{:else}
    <div class="table-container">
        <table class="table w-full text-sm">
            <thead>
                <tr>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>RUC/Cédula</th>
                    <th>Teléfono</th>
                    <th class="text-right">Límite crédito</th>
                    <th class="text-right">Saldo</th>
                    <th>Estado</th>
                    <th class="text-right">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each clientes as c}
                    <tr class="hover:bg-gray-50">
                        <td>
                            <p class="font-medium text-gray-900">{c.nombre}</p>
                            {#if c.email}<p class="text-xs text-gray-400">
                                    {c.email}
                                </p>{/if}
                        </td>
                        <td
                            ><Badge variant="blue"
                                >{tipoCliente[c.tipo] ?? c.tipo}</Badge
                            ></td
                        >
                        <td class="font-mono text-xs">{c.rucCedula ?? "—"}</td>
                        <td class="text-xs">{c.telefono ?? "—"}</td>
                        <td class="text-right"
                            >{formatCurrency(c.limiteCredito)}</td
                        >
                        <td
                            class="text-right {c.saldoCredito > 0
                                ? 'text-danger-600 font-semibold'
                                : ''}"
                        >
                            {formatCurrency(c.saldoCredito)}
                        </td>
                        <td
                            ><Badge variant={c.activo ? "green" : "red"} dot
                                >{c.activo ? "Activo" : "Inactivo"}</Badge
                            ></td
                        >
                        <td class="text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button
                                    onclick={() => verDetalle(c)}
                                    class="text-xs text-primary-500 hover:underline"
                                    >Detalle</button
                                >
                                <button
                                    onclick={() => abrirEditar(c)}
                                    class="text-xs text-gray-500 hover:underline"
                                    >Editar</button
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
    bind:open={modalAbierto}
    title={clienteEditar ? "Editar cliente" : "Nuevo cliente"}
    size="lg"
>
    <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="Nombre"
                bind:value={form.nombre}
                error={errores.nombre}
                required
            />
            <Select
                label="Tipo"
                options={[
                    { value: "consumidor_final", label: "Consumidor Final" },
                    { value: "empresa", label: "Empresa" },
                    { value: "mayorista", label: "Mayorista" },
                ]}
                bind:value={form.tipo}
            />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="RUC / Cédula"
                bind:value={form.rucCedula}
                placeholder="0912345678"
            />
            <Input label="Teléfono" bind:value={form.telefono} />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="Email"
                type="email"
                bind:value={form.email}
                error={errores.email}
            />
            <Input
                label="Límite de crédito"
                type="number"
                step="0.01"
                bind:value={form.limiteCredito}
                error={errores.limiteCredito}
            />
        </div>
        <Input label="Dirección" bind:value={form.direccion} />
    </div>
    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (modalAbierto = false)}
            >Cancelar</Button
        >
        <Button variant="primary" loading={guardando} onclick={guardar}>
            {clienteEditar ? "Guardar cambios" : "Crear cliente"}
        </Button>
    </svelte:fragment>
</Modal>

<!-- Modal detalle/abono -->
<Modal
    bind:open={modalDetalleAbierto}
    title={clienteDetalle?.nombre ?? "Detalle"}
    size="lg"
>
    {#if clienteDetalle}
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <span class="text-gray-500">Tipo:</span>
                    <span class="font-medium"
                        >{tipoCliente[clienteDetalle.tipo]}</span
                    >
                </div>
                <div>
                    <span class="text-gray-500">RUC:</span>
                    <span class="font-medium"
                        >{clienteDetalle.rucCedula ?? "—"}</span
                    >
                </div>
                <div>
                    <span class="text-gray-500">Teléfono:</span>
                    <span class="font-medium"
                        >{clienteDetalle.telefono ?? "—"}</span
                    >
                </div>
                <div>
                    <span class="text-gray-500">Email:</span>
                    <span class="font-medium"
                        >{clienteDetalle.email ?? "—"}</span
                    >
                </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
                <div class="bg-gray-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-gray-500">Límite</p>
                    <p class="text-lg font-bold">
                        {formatCurrency(clienteDetalle.limiteCredito)}
                    </p>
                </div>
                <div class="bg-danger-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-danger-600">Deuda</p>
                    <p class="text-lg font-bold text-danger-700">
                        {formatCurrency(clienteDetalle.saldoCredito)}
                    </p>
                </div>
                <div class="bg-primary-50 rounded-xl p-3 text-center">
                    <p class="text-xs text-primary-600">Disponible</p>
                    <p class="text-lg font-bold text-primary-700">
                        {formatCurrency(clienteDetalle.creditoDisponible)}
                    </p>
                </div>
            </div>

            {#if clienteDetalle.saldoCredito > 0}
                <div class="border-t border-gray-100 pt-4">
                    <h3 class="text-sm font-semibold text-gray-900 mb-3">
                        Registrar abono
                    </h3>
                    <div class="grid grid-cols-2 gap-3">
                        <Input
                            label="Monto"
                            type="number"
                            step="0.01"
                            bind:value={montoAbono}
                        />
                        <Input
                            label="Referencia"
                            bind:value={referenciaAbono}
                            placeholder="N° transferencia"
                        />
                    </div>
                    <div class="mt-3">
                        <Button
                            variant="primary"
                            loading={abonando}
                            disabled={montoAbono <= 0}
                            onclick={abonar}
                        >
                            Registrar abono
                        </Button>
                    </div>
                </div>
            {/if}
        </div>
    {/if}
</Modal>
