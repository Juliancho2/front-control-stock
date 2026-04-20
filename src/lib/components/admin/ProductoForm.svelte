<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import Button from "$components/ui/Button.svelte";
    import Input from "$components/ui/Input.svelte";
    import Select from "$components/ui/Select.svelte";
    import type { Producto, Categoria } from "$types/index";

    export let producto: Partial<Producto> = {};
    export let categorias: Categoria[] = [];
    export let guardando = false;
    export let modo: "crear" | "editar" = "crear";

    const dispatch = createEventDispatcher<{
        guardar: Partial<Producto>;
        cancelar: void;
    }>();

    let sku = producto.sku ?? "";
    let nombre = producto.nombre ?? "";
    let descripcion = producto.descripcion ?? "";
    let unidadMedida = producto.unidadMedida ?? "unidad";
    let precioCompra = producto.precioCompra ?? 0;
    let precioVenta = producto.precioVenta ?? 0;
    let precioMayorista = producto.precioMayorista ?? 0;
    let stockMinimo = producto.stockMinimo ?? 5;
    let categoriaId = producto.categoriaId ?? "";
    let activo = producto.activo ?? true;
    let iva = producto.iva ?? 0;

    let errores: Record<string, string> = {};

    function generarSKU() {
        const prefix = "PROD";
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        sku = `${prefix}-${random}`;
    }

    onMount(() => {
        if (modo === "crear" && !sku) {
            generarSKU();
        }
    });

    function validar(): boolean {
        errores = {};
        if (!sku.trim()) errores.sku = "SKU es obligatorio";
        if (!nombre.trim()) errores.nombre = "Nombre es obligatorio";
        if (precioVenta <= 0) errores.precioVenta = "Debe ser mayor a 0";
        if (precioCompra < 0) errores.precioCompra = "No puede ser negativo";
        return Object.keys(errores).length === 0;
    }

    function enviar(e: Event) {
        e.preventDefault();
        if (!validar()) return;
        dispatch("guardar", {
            sku: sku.trim(),
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            unidadMedida,
            precioCompra,
            precioVenta,
            precioMayorista: precioMayorista || null,
            iva: iva || null,
            stockMinimo,
            categoriaId: categoriaId || null,
            activo,
        });
    }

    $: opcionesCat = categorias.map((c) => ({ value: c.id, label: c.nombre }));
    $: unidades = [
        { value: "unidad", label: "Unidad" },
        { value: "kg", label: "Kilogramo" },
        { value: "metro", label: "Metro" },
        { value: "litro", label: "Litro" },
        { value: "caja", label: "Caja" },
        { value: "rollo", label: "Rollo" },
        { value: "par", label: "Par" },
        { value: "galón", label: "Galón" },
    ];
    $: opcionesIVA = [
        { value: 0, label: "Sin IVA" },
        { value: 5, label: "5%" },
        { value: 10, label: "10%" },
        { value: 15, label: "15%" },
        { value: 21, label: "21%" },
    ];
</script>

<form onsubmit={enviar} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
            label="SKU"
            bind:value={sku}
            error={errores.sku}
            required
            placeholder="PROD-001"
            disabled={modo === "editar"}
        >
            <svelte:fragment slot="suffix">
                {#if modo === "crear"}
                    <button
                        type="button"
                        class="text-primary-500 hover:text-primary-700 p-1 transition-colors"
                        onclick={generarSKU}
                        title="Generar nuevo SKU"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            ><path
                                d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"
                            /><path d="M5 3v4" /><path d="M19 17v4" /><path
                                d="M3 5h4"
                            /><path d="M17 19h4" /></svg
                        >
                    </button>
                {/if}
            </svelte:fragment>
        </Input>
        <Input
            label="Nombre del producto"
            bind:value={nombre}
            error={errores.nombre}
            required
            placeholder="Martillo Stanley 16oz"
        />
    </div>

    <div>
        <label for="descripcion" class="text-sm font-medium text-gray-700 mb-1 block"
            >Descripción</label
        >
        <textarea
            id="descripcion"
            bind:value={descripcion}
            rows="3"
            class="input resize-none"
            placeholder="Descripción del producto (opcional)"
        ></textarea>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
            label="Categoría"
            options={opcionesCat}
            bind:value={categoriaId}
            placeholder="Sin categoría"
        />
        <Select
            label="Unidad de medida"
            options={unidades}
            bind:value={unidadMedida}
        />
        <Input
            label="Stock mínimo"
            type="number"
            bind:value={stockMinimo}
            hint="Alerta cuando quede por debajo"
        />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
            label="Precio de compra"
            type="number"
            step="0.01"
            bind:value={precioCompra}
            error={errores.precioCompra}
        />
        <Input
            label="Precio de venta"
            type="number"
            step="0.01"
            bind:value={precioVenta}
            error={errores.precioVenta}
            required
        />
        <Select
            label="IVA (%)"
            options={opcionesIVA}
            bind:value={iva}
            placeholder="Sin IVA"
        />
        <Input
            label="Precio mayorista"
            type="number"
            step="0.01"
            bind:value={precioMayorista}
            hint="Opcional"
        />
    </div>

    {#if modo === "editar"}
        <div class="flex items-center gap-2">
            <input
                type="checkbox"
                id="activo"
                bind:checked={activo}
                class="rounded border-gray-300 text-primary-500 focus:ring-primary-400"
            />
            <label for="activo" class="text-sm text-gray-700"
                >Producto activo</label
            >
        </div>
    {/if}

    <div class="flex items-center gap-3 pt-4 border-t border-gray-100">
        <Button variant="secondary" onclick={() => dispatch("cancelar")}
            >Cancelar</Button
        >
        <Button variant="primary" type="submit" loading={guardando}>
            {modo === "crear" ? "Crear producto" : "Guardar cambios"}
        </Button>
    </div>
</form>
