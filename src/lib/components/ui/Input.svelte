<script lang="ts">
	export let label: string | undefined = undefined;
	export let error: string | undefined = undefined;
	export let hint: string | undefined = undefined;
	export let type = "text";
	export let value: string | number = "";
	export let placeholder = "";
	export let disabled = false;
	export let required = false;
	export let id: string = `input-${Math.random().toString(36).slice(2, 7)}`;

	$: inputClass = [
		"input",
		error ? "input-error" : "",
		$$slots.icon ? "pl-9" : "",
		$$slots.suffix ? "pr-10" : "",
	].join(" ");
</script>

<div class="flex flex-col gap-1">
	{#if label}
		<label for={id} class="text-sm font-medium text-gray-700">
			{label}{#if required}<span class="text-danger-400 ml-0.5">*</span
				>{/if}
		</label>
	{/if}

	<div class="relative">
		{#if $$slots.icon}
			<div
				class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
			>
				<slot name="icon" />
			</div>
		{/if}

		<input
			{id}
			{type}
			{placeholder}
			{disabled}
			{required}
			bind:value
			class={inputClass}
			on:input
			on:change
			on:blur
			on:focus
			on:keydown
			{...$$restProps}
		/>

		{#if $$slots.suffix}
			<div class="absolute inset-y-0 right-0 flex items-center pr-3">
				<slot name="suffix" />
			</div>
		{/if}
	</div>

	{#if error}
		<p class="text-xs text-danger-600">{error}</p>
	{:else if hint}
		<p class="text-xs text-gray-400">{hint}</p>
	{/if}
</div>
