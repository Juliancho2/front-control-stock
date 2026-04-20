<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { fade, fly } from "svelte/transition";

    export let open = false;
    export let title: string | undefined = undefined;
    export let size: "sm" | "md" | "lg" | "xl" = "md";
    export let closable = true;

    const dispatch = createEventDispatcher<{ close: void }>();

    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-2xl",
    };

    function cerrar() {
        if (!closable) return;
        open = false;
        dispatch("close");
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") cerrar();
    }
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
    <!-- Backdrop -->
    <div
        class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        transition:fade={{ duration: 150 }}
        onclick={cerrar}
        role="presentation"
    />

    <!-- Panel -->
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
    >
        <div
            class="w-full {sizes[
                size
            ]} max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl pointer-events-auto"
            transition:fly={{ y: 16, duration: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            {#if title || closable}
                <div
                    class="flex items-center justify-between px-5 py-4 border-b border-gray-100"
                >
                    {#if title}
                        <h2
                            id="modal-title"
                            class="text-base font-semibold text-gray-900"
                        >
                            {title}
                        </h2>
                    {:else}
                        <div />
                    {/if}
                    {#if closable}
                        <button
                            onclick={cerrar}
                            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                            aria-label="Cerrar"
                        >
                            <svg
                                class="w-5 h-5"
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
            {/if}

            <div class="px-5 py-4">
                <slot />
            </div>

            {#if $$slots.footer}
                <div
                    class="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3"
                >
                    <slot name="footer" />
                </div>
            {/if}
        </div>
    </div>
{/if}
