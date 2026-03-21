<script lang="ts">
    export let headers: { key: string; label: string; class?: string }[] = [];
    export let rows: Record<string, any>[] = [];
    export let loading = false;
    export let emptyText = "No hay datos para mostrar";
    export let hoverable = true;
    export let striped = false;
</script>

<div class="table-container">
    <table class="table w-full text-sm">
        <thead>
            <tr>
                {#each headers as h (i)}
                    <th class={h.class ?? ""}>{h.label}</th>
                {/each}
                {#if $$slots.actions}
                    <th class="text-right">Acciones</th>
                {/if}
            </tr>
        </thead>
        <tbody>
            {#if loading}
                {#each Array(5) as _, i}
                    <tr>
                        {#each headers as h (i)}
                            <td>
                                <div
                                    class="h-4 bg-gray-100 rounded animate-pulse w-3/4"
                                ></div>
                            </td>
                        {/each}
                        {#if $$slots.actions}
                            <td></td>
                        {/if}
                    </tr>
                {/each}
            {:else if rows.length === 0}
                <tr>
                    <td
                        colspan={headers.length + ($$slots.actions ? 1 : 0)}
                        class="py-12 text-center text-gray-400"
                    >
                        {emptyText}
                    </td>
                </tr>
            {:else}
                {#each rows as row, i}
                    <tr
                        class:bg-gray-50={striped && i % 2 !== 0}
                        class:hover:bg-gray-50={hoverable}
                    >
                        {#each headers as h}
                            <td class={h.class ?? ""}>
                                <slot name="cell" {row} key={h.key}>
                                    {row[h.key] ?? "—"}
                                </slot>
                            </td>
                        {/each}
                        {#if $$slots.actions}
                            <td class="text-right">
                                <slot name="actions" {row} />
                            </td>
                        {/if}
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</div>
