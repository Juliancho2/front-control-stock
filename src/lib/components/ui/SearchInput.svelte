<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { debounce } from "$utils/index";

    export let value = "";
    export let placeholder = "Buscar...";
    export let delay = 300;

    const dispatch = createEventDispatcher<{ search: string }>();

    const emitir = debounce((v: string) => dispatch("search", v), delay);

    function onInput(e: Event) {
        value = (e.target as HTMLInputElement).value;
        emitir(value);
    }

    function limpiar() {
        value = "";
        dispatch("search", "");
    }
</script>

<div class="relative">
    <div
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
    >
        <svg
            class="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
    </div>
    <input
        type="search"
        {value}
        {placeholder}
        on:input={onInput}
        class="input pl-9 pr-8"
    />
    {#if value}
        <button
            type="button"
            on:click={limpiar}
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
