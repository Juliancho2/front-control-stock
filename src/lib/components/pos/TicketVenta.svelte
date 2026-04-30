<script lang="ts">
    import { formatCurrency, formatFechaHora } from "$utils/index";
    import type { Venta } from "$types/index";
    import { nombreNegocioActual } from "$stores/auth.store";
    
    export let venta: Venta;
</script>

<div id="ticket-impresion" class="print-only">
    <div class="ticket-header">
        <h2 class="ticket-title">{$nombreNegocioActual || "FerreControl"}</h2>
        <p class="ticket-subtitle">Recibo de Venta</p>
        <p>N°: {venta.numeroFactura}</p>
        <p>Fecha: {formatFechaHora(venta.createdAt)}</p>
    </div>

    <div class="ticket-info">
        <p>Cajero: {venta.usuario?.nombre}</p>
        <p>Cliente: {venta.cliente?.nombre || "Consumidor Final"}</p>
        <p>Pago: <span class="capitalize">{venta.formaPago}</span></p>
    </div>

    <table class="ticket-items">
        <thead>
            <tr>
                <th class="text-left w-8">Cant</th>
                <th class="text-left">Prod</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            {#each venta.items as item}
                <tr>
                    <td class="text-left align-top">{item.cantidad}</td>
                    <td class="text-left pr-2">{item.producto?.nombre}</td>
                    <td class="text-right align-top">{formatCurrency(item.subtotal)}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <div class="ticket-totals">
        <div class="row">
            <span>Subtotal:</span>
            <span>{formatCurrency(venta.subtotal)}</span>
        </div>
        {#if venta.descuento > 0}
            <div class="row">
                <span>Descuento:</span>
                <span>-{formatCurrency(venta.descuento)}</span>
            </div>
        {/if}
        <div class="row">
            <span>IVA:</span>
            <span>{formatCurrency(venta.impuesto)}</span>
        </div>
        <div class="row total">
            <span>TOTAL:</span>
            <span>{formatCurrency(venta.total)}</span>
        </div>
    </div>

    <div class="ticket-footer">
        <p>¡Gracias por su compra!</p>
        <p class="text-xs mt-2">{$nombreNegocioActual || "FerreControl"}</p>
    </div>
</div>

<style>
    /* Por defecto oculto en pantalla normal */
    .print-only {
        display: none;
    }

    /* Reglas para la ventana de impresión */
    @media print {
        @page {
            margin: 0;
            size: 80mm auto; /* Formato ticket 80mm */
        }

        :global(body) {
            margin: 0;
            padding: 0;
            background: white;
        }

        :global(body *) {
            visibility: hidden;
        }

        /* Hacer visible sólo el ticket y sus hijos */
        :global(#ticket-impresion), :global(#ticket-impresion *) {
            visibility: visible;
        }

        /* Posicionar el ticket en la esquina superior izquierda */
        :global(#ticket-impresion) {
            position: absolute;
            left: 0;
            top: 0;
            width: 75mm; /* Ligeramente menor a 80mm para dar margen */
            padding: 2mm;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            color: #000;
            display: block !important;
        }

        .ticket-header {
            text-align: center;
            margin-bottom: 8px;
        }

        .ticket-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 4px 0;
            text-transform: uppercase;
        }

        .ticket-subtitle {
            font-size: 14px;
            margin: 0 0 4px 0;
        }

        .ticket-header p {
            margin: 2px 0;
        }

        .ticket-info {
            margin-bottom: 8px;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
        }

        .ticket-info p {
            margin: 2px 0;
            font-size: 11px;
        }

        .capitalize {
            text-transform: capitalize;
        }

        .ticket-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
            font-size: 11px;
        }

        .ticket-items th {
            border-bottom: 1px dashed #000;
            padding: 4px 0;
        }

        .ticket-items td {
            padding: 4px 0;
            border-bottom: 1px dotted #ccc;
        }

        .text-left { text-align: left; }
        .text-right { text-align: right; }
        .align-top { vertical-align: top; }
        .w-8 { width: 32px; }
        .pr-2 { padding-right: 8px; }

        .ticket-totals {
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-bottom: 15px;
            font-size: 12px;
        }

        .ticket-totals .row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
        }

        .ticket-totals .total {
            font-weight: bold;
            font-size: 16px;
            margin-top: 6px;
            border-top: 1px solid #000;
            padding-top: 4px;
        }

        .ticket-footer {
            text-align: center;
            font-size: 11px;
        }
        
        .ticket-footer p {
            margin: 2px 0;
        }

        .text-xs {
            font-size: 10px;
        }
        
        .mt-2 {
            margin-top: 8px;
        }
    }
</style>
