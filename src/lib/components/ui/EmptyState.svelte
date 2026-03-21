<script lang="ts">
    export let titulo = "Sin resultados";
    export let descripcion: string | undefined = undefined;
    export let icono: string | undefined = undefined;
</script>

<div class="flex flex-col items-center justify-center py-16 text-center">
    {#if icono}
        <div
            class="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4"
        >
            <svg
                class="w-7 h-7 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d={icono}
                />
            </svg>
        </div>
    {/if}
    <p class="text-base font-medium text-gray-900 mb-1">{titulo}</p>
    {#if descripcion}
        <p class="text-sm text-gray-500 mb-4">{descripcion}</p>
    {/if}
    {#if $$slots.default}
        <slot />
    {/if}
</div>
