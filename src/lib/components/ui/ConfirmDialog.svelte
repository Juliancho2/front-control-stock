<script lang="ts">
    import Modal from "./Modal.svelte";
    import Button from "./Button.svelte";
    import { createEventDispatcher } from "svelte";

    export let open = false;
    export let titulo = "¿Estás seguro?";
    export let mensaje = "Esta acción no se puede deshacer.";
    export let labelConfirmar = "Confirmar";
    export let labelCancelar = "Cancelar";
    export let variant: "danger" | "primary" = "danger";
    export let cargando = false;

    const dispatch = createEventDispatcher<{
        confirmar: void;
        cancelar: void;
    }>();
</script>

<Modal bind:open {titulo} size="sm" closable={!cargando}>
    <p class="text-sm text-gray-600">{mensaje}</p>
    <svelte:fragment slot="footer">
        <Button
            variant="secondary"
            disabled={cargando}
            onclick={() => {
                open = false;
                dispatch("cancelar");
            }}
        >
            {labelCancelar}
        </Button>
        <Button {variant} {cargando} onclick={() => dispatch("confirmar")}>
            {labelConfirmar}
        </Button>
    </svelte:fragment>
</Modal>
