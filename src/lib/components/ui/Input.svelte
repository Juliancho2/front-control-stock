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

	let showPassword = false;
	$: currentType = type === "password" ? (showPassword ? "text" : "password") : type;

	$: inputClass = [
		"input",
		error ? "input-error" : "",
		$$slots.icon ? "pl-9" : "",
		($$slots.suffix || type === "password") ? "pr-10" : "",
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
			type={currentType}
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
		{:else if type === "password"}
			<button
				type="button"
				class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
				on:click={() => (showPassword = !showPassword)}
				tabindex="-1"
			>
				{#if showPassword}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
					</svg>
				{:else}
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
					</svg>
				{/if}
			</button>
		{/if}
	</div>

	{#if error}
		<p class="text-xs text-danger-600">{error}</p>
	{:else if hint}
		<p class="text-xs text-gray-400">{hint}</p>
	{/if}
</div>
