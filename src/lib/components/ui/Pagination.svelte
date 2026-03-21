<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    export let total: number;
    export let limit = 20;
    export let currentPage = 1;

    $: totalPages = Math.ceil(total / limit);
    $: pages = getPaginas(currentPage, totalPages);

    function getPaginas(actual: number, total: number): (number | "...")[] {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        if (actual <= 4) return [1, 2, 3, 4, 5, "...", total];
        if (actual >= total - 3)
            return [
                1,
                "...",
                total - 4,
                total - 3,
                total - 2,
                total - 1,
                total,
            ];
        return [1, "...", actual - 1, actual, actual + 1, "...", total];
    }

    function ir(p: number) {
        const url = new URL($page.url);
        url.searchParams.set("page", String(p));
        goto(url.toString(), { replaceState: true });
    }
</script>

{#if totalPages > 1}
    <div class="flex items-center justify-between text-sm text-gray-500 mt-4">
        <span>
            {(currentPage - 1) * limit + 1}–{Math.min(
                currentPage * limit,
                total,
            )}
            de <strong class="text-gray-900">{total}</strong>
        </span>

        <div class="flex items-center gap-1">
            <!-- Anterior -->
            <button
                onclick={() => ir(currentPage - 1)}
                disabled={currentPage <= 1}
                class="px-2 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
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
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>

            <!-- Números -->
            {#each pages as p}
                {#if p === "..."}
                    <span class="px-2 text-gray-400">…</span>
                {:else}
                    <button
                        onclick={() => ir(Number(p))}
                        class="w-8 h-8 rounded-lg text-sm font-medium transition-colors
              {p === currentPage
                            ? 'bg-primary-400 text-white'
                            : 'hover:bg-gray-100 text-gray-700'}"
                    >
                        {p}
                    </button>
                {/if}
            {/each}

            <!-- Siguiente -->
            <button
                onclick={() => ir(currentPage + 1)}
                disabled={currentPage >= totalPages}
                class="px-2 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Página siguiente"
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
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>
        </div>
    </div>
{/if}
