<script lang="ts">
  export let label: string | undefined = undefined;
  export let error: string | undefined = undefined;
  export let value: string | number | undefined = undefined;
  export let placeholder = "Seleccionar...";
  export let disabled = false;
  export let required = false;
  export let options: { value: string | number; label: string }[] = [];
  export let id: string = `select-${Math.random().toString(36).slice(2, 7)}`;
</script>

<div class="flex flex-col gap-1">
  {#if label}
    <label for={id} class="text-sm font-medium text-gray-700">
      {label}{#if required}<span class="text-danger-400 ml-0.5">*</span>{/if}
    </label>
  {/if}

  <select
    {id}
    {disabled}
    {required}
    bind:value
    class="input {error
      ? 'input-error'
      : ''} appearance-none bg-no-repeat bg-right pr-8"
    style="background-image: url(&quot;data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E&quot;); background-size: 1.2rem;"
    on:change
    {...$$restProps}
  >
    {#if placeholder}
      <option value="" disabled selected={!value}>{placeholder}</option>
    {/if}
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
    <slot />
  </select>

  {#if error}
    <p class="text-xs text-danger-600">{error}</p>
  {/if}
</div>
