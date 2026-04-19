<script lang="ts">
    export let data: { usuario: { nombre: string } };
</script>

<svelte:head><title>Seleccionar Panel — FerreControl</title></svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="w-full max-w-xl">
        <!-- Header -->
        <div class="text-center mb-10">
            <div
                class="w-14 h-14 bg-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-400/20"
            >
                <svg
                    class="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900">
                Hola, {data.usuario.nombre}
            </h1>
            <p class="text-sm text-gray-400 mt-1">
                Selecciona el panel al que deseas acceder
            </p>
        </div>

        <!-- Panel cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Admin Panel -->
            <a
                href="/admin/dashboard"
                class="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 p-6 hover:ring-primary-200 hover:shadow-lg hover:shadow-primary-400/5 transition-all duration-200"
            >
                <div
                    class="w-12 h-12 rounded-2xl bg-primary-50 group-hover:bg-primary-400 flex items-center justify-center mb-4 transition-colors duration-200"
                >
                    <svg
                        class="w-6 h-6 text-primary-400 group-hover:text-white transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 mb-1">
                    Panel Admin
                </h2>
                <p class="text-sm text-gray-400 leading-relaxed">
                    Dashboard, ventas, productos, clientes, usuarios y reportes
                </p>
                <div
                    class="absolute top-6 right-6 text-gray-200 group-hover:text-primary-400 transition-colors"
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
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </div>
            </a>

            <!-- Bodega Panel -->
            <a
                href="/bodega/inventario"
                class="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 p-6 hover:ring-primary-200 hover:shadow-lg hover:shadow-primary-400/5 transition-all duration-200"
            >
                <div
                    class="w-12 h-12 rounded-2xl bg-warning-50 group-hover:bg-warning-400 flex items-center justify-center mb-4 transition-colors duration-200"
                >
                    <svg
                        class="w-6 h-6 text-warning-400 group-hover:text-white transition-colors duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-900 mb-1">
                    Panel Bodega
                </h2>
                <p class="text-sm text-gray-400 leading-relaxed">
                    Inventario, recepciones, órdenes de compra, traslados y
                    proveedores
                </p>
                <div
                    class="absolute top-6 right-6 text-gray-200 group-hover:text-primary-400 transition-colors"
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
                            d="M9 5l7 7-7 7"
                        />
                    </svg>
                </div>
            </a>
        </div>

        <!-- Logout -->
        <div class="text-center mt-8">
            <form method="POST" action="/logout">
                <button
                    type="submit"
                    class="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Cerrar sesión
                </button>
            </form>
        </div>
    </div>
</div>
