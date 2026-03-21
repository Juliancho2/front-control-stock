<script lang="ts">
    export let variant: "green" | "red" | "yellow" | "gray" | "blue" = "gray";
    export let dot = false;

    const classes = {
        green: "bg-primary-50 text-primary-800",
        red: "bg-danger-50 text-danger-800",
        yellow: "bg-warning-50 text-warning-800",
        gray: "bg-gray-100 text-gray-700",
        blue: "bg-blue-50 text-blue-700",
    };

    const dotClasses = {
        green: "bg-primary-400",
        red: "bg-danger-400",
        yellow: "bg-warning-400",
        gray: "bg-gray-400",
        blue: "bg-blue-400",
    };
</script>

<span
    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium {classes[
        variant
    ]}"
>
    {#if dot}
        <span class="w-1.5 h-1.5 rounded-full {dotClasses[variant]}"></span>
    {/if}
    <slot />
</span>
