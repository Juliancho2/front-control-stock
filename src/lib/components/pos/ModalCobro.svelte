<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Modal from "$components/ui/Modal.svelte";
    import Button from "$components/ui/Button.svelte";
    import Select from "$components/ui/Select.svelte";
    import Input from "$components/ui/Input.svelte";
    import { formatCurrency } from "$utils/index";
    import type { TipoComprobante, FormaPago, MetodoPago } from "$types/index";

    export let open = false;
    export let total = 0;
    export let procesando = false;
    export let clientes: { id: string, nombre: string, rucCedula?: string }[] = [];

    const dispatch = createEventDispatcher<{
        confirmar: {
            tipoComprobante: TipoComprobante;
            formaPago: FormaPago;
            pagos: { metodo: MetodoPago; monto: number; referencia?: string }[];
            clienteId: string | null;
        };
    }>();

    let tipoComprobante: TipoComprobante = "boleta";
    let formaPago: FormaPago = "efectivo";
    let montoRecibido: number = 0;
    let referencia = "";
    let clienteId: string | null = null;

    // Para pago mixto
    let pagosMixto: {
        metodo: MetodoPago;
        monto: number;
        referencia: string;
    }[] = [];

    const opcionesComprobante = [
        { value: "boleta", label: "Boleta" },
        { value: "factura", label: "Factura" },
        { value: "proforma", label: "Proforma" },
    ];

    const opcionesPago = [
        { value: "efectivo", label: "Efectivo" },
        { value: "tarjeta", label: "Tarjeta" },
        { value: "transferencia", label: "Transferencia" },
        { value: "credito", label: "Crédito" },
        { value: "mixto", label: "Mixto" },
    ];

    const opcionesMetodo = [
        { value: "efectivo", label: "Efectivo" },
        { value: "tarjeta_debito", label: "Tarjeta débito" },
        { value: "tarjeta_credito", label: "Tarjeta crédito" },
        { value: "transferencia", label: "Transferencia" },
        { value: "qr", label: "QR" },
    ];

    $: cambio = Math.max(0, Number(montoRecibido) - total);
    $: totalMixto = pagosMixto.reduce((s, p) => s + Number(p.monto), 0);
    $: faltanteMixto = Math.max(0, total - totalMixto);

    function addMonto(cantidad: number) {
        montoRecibido = Number(montoRecibido) + cantidad;
        setTimeout(() => inputMonto?.focus(), 100);
    }

    let inputMonto: HTMLInputElement;

    function onInputMonto(e: Event) {
        const value = (e.target as HTMLInputElement).value.replace(/\D/g, "");
        montoRecibido = Number(value) || 0;
    }

    function formatMiles(value: number): string {
        return new Intl.NumberFormat("es-CO").format(value);
    }

    function quickAmounts() {
        const t = Number(total);
        const amounts = [];
        if (t > 0) amounts.push(t);
        if (t > 10000) amounts.push(Math.ceil(t / 10000) * 10000);
        if (t > 20000) amounts.push(Math.ceil(t / 20000) * 20000);
        if (t > 50000) amounts.push(Math.ceil(t / 50000) * 50000);
        if (t <= 10000) amounts.push(15000);
        if (t <= 20000) amounts.push(20000);
        if (t <= 50000) amounts.push(50000);
        if (t <= 100000) amounts.push(100000);
        return [...new Set(amounts)].sort((a, b) => a - b).slice(0, 5);
    }

    let wasOpen = false;
    $: if (open && !wasOpen) {
        wasOpen = true;
        tipoComprobante = "boleta";
        formaPago = "efectivo";
        montoRecibido = total;
        referencia = "";
        clienteId = null;
        pagosMixto = [];
        errorCobro = "";
        setTimeout(() => inputMonto?.focus(), 300);
    }
    $: if (!open) wasOpen = false;

    function agregarPagoMixto() {
        pagosMixto = [
            ...pagosMixto,
            { metodo: "efectivo", monto: faltanteMixto, referencia: "" },
        ];
    }

    function quitarPagoMixto(idx: number) {
        pagosMixto = pagosMixto.filter((_, i) => i !== idx);
    }

    function metodoDesdeFormaPago(fp: FormaPago): MetodoPago {
        const map: Record<string, MetodoPago> = {
            efectivo: "efectivo",
            tarjeta: "tarjeta_debito",
            transferencia: "transferencia",
            credito: "credito_cuenta",
        };
        return map[fp] ?? "efectivo";
    }

    let errorCobro = "";

    function confirmar() {
        errorCobro = "";
        let pagos: {
            metodo: MetodoPago;
            monto: number;
            referencia?: string;
        }[];

        if (formaPago === "mixto") {
            if (totalMixto < total) {
                errorCobro = "Los pagos no cubren el total";
                return;
            }
            pagos = pagosMixto.map((p) => ({
                metodo: p.metodo,
                monto: Number(p.monto),
                referencia: p.referencia || undefined,
            }));
        } else if (formaPago === "efectivo" && Number(montoRecibido) < total) {
            errorCobro = "El monto recibido es insuficiente";
            return;
        } else {
            pagos = [
                {
                    metodo: metodoDesdeFormaPago(formaPago),
                    monto:
                        formaPago === "efectivo"
                            ? Number(montoRecibido)
                            : total,
                    referencia: referencia || undefined,
                },
            ];
        }

        if (formaPago === "credito" && !clienteId) {
            errorCobro = "Debes seleccionar un cliente para ventas a crédito";
            return;
        }

        if (Number(montoRecibido) < total) {
            errorCobro = "El monto recibido es menor al total";
            return;
        }

        dispatch("confirmar", { tipoComprobante, formaPago, pagos, clienteId });
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && puedeConfirmar && !procesando) {
            confirmar();
        }
    }

    $: puedeConfirmar =
        Number(montoRecibido) >= total &&
        (formaPago === "mixto"
            ? totalMixto >= total
            : formaPago === "efectivo"
              ? Number(montoRecibido) >= total
              : true);
</script>

<Modal bind:open title="Cobrar venta" size="lg" onkeydown={onKeydown}>
    <div class="space-y-5">
        <!-- Total destacado -->
        <div
            class="text-center bg-gray-100 rounded-xl py-4 px-6 border border-gray-200"
        >
            <p
                class="text-xs  font-medium uppercase tracking-wide"
            >
                Total a cobrar
            </p>
            <p class="text-2xl font-bold text-primary-700 mt-1">
                {formatCurrency(total)}
            </p>
        </div>

        <!-- Cambio destacado -->
        {#if cambio > 0}
            <div class="text-center bg-primary-50 rounded-xl py-4 px-6 border border-primary-100">
                <p class="text-sm text-success-700 font-medium uppercase tracking-wide">
                    Cambio
                </p>
                <p class="text-4xl font-bold text-success-700 mt-1">
                    {formatCurrency(cambio)}
                </p>
            </div>
        {/if}

        <!-- Tipo comprobante y forma de pago -->
        <div class="grid grid-cols-2 gap-4">
            <Select
                label="Comprobante"
                options={opcionesComprobante}
                bind:value={tipoComprobante}
            />
            <Select
                label="Forma de pago"
                options={opcionesPago}
                bind:value={formaPago}
            />
        </div>

        <Select
            label="Cliente (Opcional)"
            options={[
                { value: "", label: "Consumidor Final" },
                ...clientes.map(c => ({ value: c.id, label: `${c.nombre} ${c.rucCedula ? `(${c.rucCedula})` : ''}` }))
            ]}
            bind:value={clienteId}
        />

        <!-- Pago efectivo -->
        {#if formaPago === "efectivo"}
            <div class="space-y-3">
                <div class="flex flex-col gap-1">
                    <label for="monto-recibido" class="text-sm font-medium text-gray-700">
                        Monto recibido
                    </label>
                    <input
                        id="monto-recibido"
                        type="text"
                        value={formatMiles(Number(montoRecibido))}
                        oninput={onInputMonto}
                        onkeydown={onKeydown}
                        class="input text-lg font-semibold"
                        placeholder="0"
                        bind:this={inputMonto}
                    />
                </div>
                <!-- Botones rápidos -->
                <div class="flex gap-2 flex-wrap">
                    {#each quickAmounts() as monto}
                        <button
                            type="button"
                            onclick={() => (montoRecibido = monto)}
                            class="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors
                                {montoRecibido === monto
                                ? 'bg-primary-50 border-primary-300 text-primary-700'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}"
                        >
                            {formatCurrency(monto)}
                        </button>
                    {/each}
                    <button
                        type="button"
                        onclick={() => addMonto(10000)}
                        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        +10K
                    </button>
                    <button
                        type="button"
                        onclick={() => addMonto(20000)}
                        class="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                        +20K
                    </button>
                </div>
            </div>
        {/if}

        <!-- Pago tarjeta/transferencia -->
        {#if formaPago === "tarjeta" || formaPago === "transferencia"}
            <Input
                label="Referencia / N° operación"
                bind:value={referencia}
                placeholder="Opcional"
            />
        {/if}

        <!-- Pago mixto -->
        {#if formaPago === "mixto"}
            <div class="space-y-3">
                {#each pagosMixto as pago, idx}
                    <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto] gap-2 p-3 bg-gray-50 rounded-lg items-end">
                        <div class="flex-1">
                            <Select
                                label="Método"
                                options={opcionesMetodo}
                                bind:value={pago.metodo}
                            />
                        </div>
                        <div class="w-full sm:w-28">
                            <Input
                                label="Monto"
                                type="number"
                                bind:value={pago.monto}
                                min={0}
                                step="0.01"
                            />
                        </div>
                        <div class="flex-1">
                            <Input
                                label="Ref."
                                bind:value={pago.referencia}
                                placeholder="Opcional"
                            />
                        </div>
                        <button
                            onclick={() => quitarPagoMixto(idx)}
                            class="p-2 text-danger-400 hover:text-danger-600"
                            title="Quitar"
                        >
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                {/each}

                <Button
                    variant="secondary"
                    size="sm"
                    onclick={agregarPagoMixto}
                >
                    + Agregar método de pago
                </Button>

                {#if pagosMixto.length > 0}
                    <div class="flex items-center justify-between text-sm px-1">
                        <span class="text-gray-500">
                            Cubierto: <strong
                                >{formatCurrency(totalMixto)}</strong
                            >
                        </span>
                        {#if faltanteMixto > 0}
                            <span class="text-danger-500 font-medium">
                                Falta: {formatCurrency(faltanteMixto)}
                            </span>
                        {:else}
                            <span class="text-success-600 font-medium">
                                Completo
                            </span>
                        {/if}
                    </div>
                {/if}
            </div>
        {/if}
    </div>

    {#if errorCobro}
        <p class="text-xs text-danger-600 text-center mt-2">{errorCobro}</p>
    {/if}

    <svelte:fragment slot="footer">
        <Button variant="secondary" onclick={() => (open = false)}>
            Cancelar
        </Button>
        <Button
            variant="primary"
            loading={procesando}
            disabled={!puedeConfirmar}
            onclick={confirmar}
        >
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
                    d="M5 13l4 4L19 7"
                />
            </svg>
            Cobrar
        </Button>
    </svelte:fragment>
</Modal>
