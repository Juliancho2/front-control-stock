<script lang="ts">
    export let titulo: string;
    export let descripcion: string | undefined = undefined;
    export let breadcrumb: { label: string; href?: string }[] = [];
</script>

<div class="mb-6">
    {#if breadcrumb.length > 0}
        <nav class="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            {#each breadcrumb as crumb, i}
                {#if i > 0}
                    <svg
                        class="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                {/if}
                {#if crumb.href}
                    <a
                        href={crumb.href}
                        class="hover:text-gray-600 transition-colors"
                        >{crumb.label}</a
                    >
                {:else}
                    <span class="text-gray-600">{crumb.label}</span>
                {/if}
            {/each}
        </nav>
    {/if}

    <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div class="min-w-0">
            <h1 class="text-xl font-semibold text-gray-900 truncate">{titulo}</h1>
            {#if descripcion}
                <p class="text-sm text-gray-500 mt-0.5">{descripcion}</p>
            {/if}
        </div>
        {#if $$slots.default}
            <div class="flex items-center gap-2 flex-shrink-0 flex-wrap">
                <slot />
            </div>
        {/if}
    </div>
</div>
