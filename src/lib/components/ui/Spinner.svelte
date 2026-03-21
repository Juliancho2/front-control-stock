<script lang="ts">
    export let size: "sm" | "md" | "lg" = "md";
    export let color = "text-primary-400";

    const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
</script>

<svg
    class="animate-spin {sizes[size]} {color}"
    fill="none"
    viewBox="0 0 24 24"
    aria-label="Cargando"
>
    <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
    />
    <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
</svg>
