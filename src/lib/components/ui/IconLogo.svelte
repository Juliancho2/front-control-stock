<script lang="ts">
    export let className: string = "";
    export let size: number = 120;
</script>

<div class="inline-flex items-center justify-center {className}">
    <svg
        width={size}
        height={size}
        viewBox="0 0 300 300"
        xmlns="http://www.w3.org/2000/svg"
    >
        <title>FerreControl POS</title>

        <circle cx="150" cy="150" r="150" fill="#111" />

        <!-- Arco cinta métrica -->
        <circle
            cx="150"
            cy="150"
            r="108"
            fill="none"
            stroke="#1D9E75"
            stroke-width="28"
            stroke-dasharray="508 678"
            stroke-dashoffset="84"
            stroke-linecap="round"
        />
        <circle
            cx="150"
            cy="150"
            r="108"
            fill="none"
            stroke="#222"
            stroke-width="28"
            stroke-dasharray="170 678"
            stroke-dashoffset="-424"
            stroke-linecap="round"
        />

        <!-- Marcas medición -->
        <g
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            opacity="0.4"
        >
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="50"
                transform="rotate(20 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="44"
                transform="rotate(40 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="50"
                transform="rotate(60 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="44"
                transform="rotate(80 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="50"
                transform="rotate(100 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="44"
                transform="rotate(120 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="50"
                transform="rotate(140 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="44"
                transform="rotate(160 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="50"
                transform="rotate(180 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="44"
                transform="rotate(200 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="50"
                transform="rotate(220 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="44"
                transform="rotate(240 150 150)"
            />
            <line
                x1="150"
                y1="34"
                x2="150"
                y2="50"
                transform="rotate(260 150 150)"
            />
        </g>

        <!-- Caja registradora -->
        <g transform="translate(150,150)">
            <rect x="-38" y="-36" width="76" height="56" rx="8" fill="white" />
            <rect
                x="-28"
                y="-28"
                width="38"
                height="18"
                rx="4"
                fill="#1D9E75"
            />
            <rect x="16" y="-28" width="18" height="18" rx="4" fill="#1D9E75" />
            <rect x="-28" y="-4" width="13" height="10" rx="3" fill="#333" />
            <rect x="-12" y="-4" width="13" height="10" rx="3" fill="#333" />
            <rect x="4" y="-4" width="13" height="10" rx="3" fill="#333" />
            <rect x="-38" y="24" width="76" height="14" rx="5" fill="#1D9E75" />
            <rect x="-10" y="27" width="20" height="8" rx="4" fill="white" />
            <rect
                x="-10"
                y="-52"
                width="20"
                height="18"
                rx="3"
                fill="white"
                opacity="0.7"
            />
            <line
                x1="-5"
                y1="-46"
                x2="5"
                y2="-46"
                stroke="#1D9E75"
                stroke-width="2"
                stroke-linecap="round"
            />
            <line
                x1="-5"
                y1="-41"
                x2="3"
                y2="-41"
                stroke="#1D9E75"
                stroke-width="2"
                stroke-linecap="round"
            />
        </g>
    </svg>
</div>
