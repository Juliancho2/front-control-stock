<script lang="ts">
	export let variant: "primary" | "secondary" | "danger" | "ghost" | "link" =
		"primary";
	export let size: "sm" | "md" | "lg" = "md";
	export let type: "button" | "submit" | "reset" = "button";
	export let disabled = false;
	export let loading = false;
	export let fullWidth = false;
	export let href: string | undefined = undefined;

	const variants = {
		primary:
			"bg-primary-400 text-white hover:bg-primary-600 focus:ring-primary-400 active:bg-primary-800",
		secondary:
			"bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300",
		danger: "bg-danger-400 text-white hover:bg-danger-600 focus:ring-danger-400",
		ghost: "bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-200",
		link: "bg-transparent text-primary-400 hover:underline focus:ring-primary-200 p-0",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-xs gap-1.5",
		md: "px-4 py-2 text-sm gap-2",
		lg: "px-5 py-2.5 text-base gap-2",
	};

	$: classes = [
		"inline-flex items-center justify-center font-medium rounded-lg",
		"transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1",
		"disabled:opacity-50 disabled:cursor-not-allowed",
		variants[variant],
		variant !== "link" ? sizes[size] : "",
		fullWidth ? "w-full" : "",
	].join(" ");
</script>

{#if href}
	<a {href} class={classes} {...$$restProps}>
		{#if loading}
			<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
		{/if}
		<slot />
	</a>
{:else}
	<button {type} {disabled} class={classes} {...$$restProps}>
		{#if loading}
			<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
		{/if}
		<slot />
	</button>
{/if}
