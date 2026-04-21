<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { debounce } from "$utils/index";
    import { productosApi } from "$api/productos";
    import { toastStore } from "$stores/toast.store";
    import type { Producto } from "$types/index";
    import Spinner from "$components/ui/Spinner.svelte";

    const dispatch = createEventDispatcher<{ seleccionar: Producto }>();

    let query = "";
    let resultados: Producto[] = [];
    let buscando = false;
    let inputEl: HTMLInputElement;
    let mostrarResultados = false;

    export let token: string | undefined = undefined;

    // Foco automático al montar (el cajero necesita escribir de inmediato)
    onMount(() => inputEl?.focus());

    const buscar = debounce(async (q: string) => {
        if (!q.trim()) {
            resultados = [];
            mostrarResultados = false;
            return;
        }

        buscando = true;
        try {
            // Intentar por SKU exacto primero (lector de código de barras)
            if (/^[A-Z0-9\-_]+$/i.test(q) && q.length >= 3) {
                try {
                    const p = await productosApi.buscarPorSku(
                        q.toUpperCase(),
                        token,
                    );
                    seleccionar(p);
                    return;
                } catch {
                    /* no era SKU exacto, continuar con búsqueda */
                }
            }

            const res = await productosApi.listar(
                {
                    q,
                    activo: true,
                    limit: 8,
                },
                token,
            );

            resultados = res.data;
            mostrarResultados = true;
        } catch {
            toastStore.error("Error al buscar productos");
        } finally {
            buscando = false;
        }
    }, 280);

    function seleccionar(producto: Producto) {
        dispatch("seleccionar", producto);
        query = "";
        resultados = [];
        mostrarResultados = false;
        inputEl?.focus();
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            query = "";
            resultados = [];
            mostrarResultados = false;
        }
        if (e.key === "Enter" && resultados.length === 1) {
            seleccionar(resultados[0]);
        }
    }

    $: buscar(query);
</script>

<div class="relative">
    <div class="relative">
        <!-- Ícono lupa -->
        <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
            />
        </svg>

        <input
            bind:this={inputEl}
            bind:value={query}
            onkeydown={onKeydown}
            type="text"
            placeholder="Buscar por nombre o escanear código..."
            class="w-full pl-10 pr-10 py-3 text-sm border border-gray-200 rounded-xl
             focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
             bg-white shadow-sm"
            autocomplete="off"
            spellcheck="false"
        />

        {#if buscando}
            <div class="absolute right-3 top-1/2 -translate-y-1/2">
                <Spinner size="sm" />
            </div>
        {:else if query}
            <button
                onclick={() => {
                    query = "";
                    resultados = [];
                    inputEl?.focus();
                }}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabindex="-1"
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
        {/if}
    </div>

    <!-- Resultados dropdown -->
    {#if mostrarResultados && resultados.length > 0}
        <div
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-y-auto max-h-[60vh]"
        >
            {#each resultados as producto}
                <button
                    onclick={() => seleccionar(producto)}
                    class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                    <!-- Imagen o placeholder -->
                    <div
                        class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden"
                    >
                        {#if producto.imagenUrl}
                            <img
                                src={producto.imagenUrl}
                                alt={producto.nombre}
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            <svg
                                class="w-5 h-5 text-gray-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        {/if}
                    </div>

                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">
                            {producto.nombre}
                        </p>
                        <p class="text-xs text-gray-400">
                            {producto.sku} · {producto.unidadMedida}
                        </p>
                    </div>

                    <div class="text-right flex-shrink-0">
                        <p class="text-sm font-semibold text-gray-900">
                            ${Number(producto.precioVenta).toFixed(2)}
                        </p>
                    </div>
                </button>
            {/each}
        </div>

        <!-- Clic fuera para cerrar -->
        <div
            class="fixed inset-0 z-10"
            onclick={() => (mostrarResultados = false)}
            role="presentation"
        />
    {/if}

    {#if mostrarResultados && resultados.length === 0 && !buscando && query.length >= 2}
        <div
            class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center z-20"
        >
            <p class="text-sm text-gray-400">
                No se encontraron productos para "{query}"
            </p>
        </div>
    {/if}
</div>
