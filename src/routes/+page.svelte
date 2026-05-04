<script lang="ts">
    import IconLogo from "$components/ui/IconLogo.svelte";
    import { onMount } from "svelte";

    let { data } = $props();

    let mounted = $state(false);
    let visibleSections = $state<Set<string>>(new Set());
    let mobileMenuOpen = $state(false);

    onMount(() => {
        mounted = true;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        visibleSections = new Set([
                            ...visibleSections,
                            entry.target.id,
                        ]);
                    }
                });
            },
            { threshold: 0.1 },
        );

        document.querySelectorAll("section[id]").forEach((section) => {
            observer.observe(section);
        });

        return () => observer.disconnect();
    });

    function isVisible(id: string) {
        return visibleSections.has(id);
    }

    function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
    }
</script>

<svelte:head>
    <title>FerreControl - Sistema de Gestión para Ferreterías</title>
    <meta
        name="description"
        content="Sistema de gestión integral para tu ferretería. Control de inventario, ventas POS, reportes y más."
    />
</svelte:head>

<div class="min-h-screen bg-white">
    <!-- Navbar -->
    <nav
        class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm animate-fade-down"
    >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16 md:h-20">
                <div class="flex items-center gap-2 md:gap-3">
                    <div class="flex items-center justify-center mb-4">
                        <IconLogo size={45} />
                        <!-- <WordMark size={200} /> -->
                        <div class="flex items-start ml-3">
                            <h1
                                class="text-xl font-bold text-gray-900 self-center"
                            >
                                Ferre<span class="text-primary-600"
                                    >Control</span
                                >
                            </h1>
                            <span class="text-gray-400 text-xs">POS</span>
                        </div>
                    </div>
                </div>

                <!-- Desktop Menu -->
                <div class="hidden lg:flex items-center gap-6">
                    <a
                        href="#funciones"
                        class="text-gray-600 hover:text-[#1D9E75] font-medium transition-all text-sm uppercase tracking-wider"
                        >Funciones</a
                    >
                    <a
                        href="#beneficios"
                        class="text-gray-600 hover:text-[#1D9E75] font-medium transition-all text-sm uppercase tracking-wider"
                        >Beneficios</a
                    >
                    <a
                        href="#planes"
                        class="text-gray-600 hover:text-[#1D9E75] font-medium transition-all text-sm uppercase tracking-wider"
                        >Planes</a
                    >
                    <a
                        href="#testimonios"
                        class="text-gray-600 hover:text-[#1D9E75] font-medium transition-all text-sm uppercase tracking-wider"
                        >Testimonios</a
                    >
                    {#if data.session}
                        <a
                            href="/admin/dashboard"
                            class="px-4 py-2 bg-[#1D9E75] text-white font-semibold rounded-lg hover:bg-[#0F6E56] transition-all text-sm"
                            >Panel Admin</a
                        >
                        <a
                            href="/pos"
                            class="px-4 py-2 bg-[#111] text-white font-semibold rounded-lg hover:bg-gray-800 transition-all text-sm"
                            >POS</a
                        >
                    {:else}
                        <a
                            href="/login"
                            class="text-gray-600 hover:text-[#1D9E75] font-medium transition-all text-sm"
                            >Iniciar Sesión</a
                        >
                        <a
                            href="/registro"
                            class="px-4 py-2 bg-[#1D9E75] text-white font-semibold rounded-lg hover:bg-[#0F6E56] transition-all transform hover:scale-105 shadow-md hover:shadow-lg btn-hover text-sm"
                            >Empezar Gratis</a
                        >
                    {/if}
                </div>

                <!-- Mobile Menu Button -->
                <button
                    class="lg:hidden p-2 text-gray-600 hover:text-[#1D9E75]"
                    onclick={toggleMobileMenu}
                >
                    {#if mobileMenuOpen}
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            /></svg
                        >
                    {:else}
                        <svg
                            class="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            /></svg
                        >
                    {/if}
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <div
            class:hidden={!mobileMenuOpen}
            class="lg:hidden bg-white border-t border-gray-200"
        >
            <div class="px-4 py-4 space-y-3">
                <a
                    href="#funciones"
                    class="block py-2 text-gray-600 hover:text-[#1D9E75] font-medium"
                    >Funciones</a
                >
                <a
                    href="#beneficios"
                    class="block py-2 text-gray-600 hover:text-[#1D9E75] font-medium"
                    >Beneficios</a
                >
                <a
                    href="#planes"
                    class="block py-2 text-gray-600 hover:text-[#1D9E75] font-medium"
                    >Planes</a
                >
                <a
                    href="#testimonios"
                    class="block py-2 text-gray-600 hover:text-[#1D9E75] font-medium"
                    >Testimonios</a
                >
                <hr class="border-gray-200" />
                {#if data.session}
                    <a
                        href="/admin/dashboard"
                        class="block py-2 text-[#1D9E75] font-medium"
                        >Panel Admin</a
                    >
                    <a href="/pos" class="block py-2 text-[#111] font-medium"
                        >POS</a
                    >
                {:else}
                    <a
                        href="/login?redirectTo="
                        class="block py-2 text-gray-600 hover:text-[#1D9E75] font-medium"
                        >Iniciar Sesión</a
                    >
                    <a
                        href="/registro"
                        class="block py-3 bg-[#1D9E75] text-white font-semibold rounded-lg text-center"
                        >Empezar Gratis</a
                    >
                {/if}
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section
        class="pt-20 pb-12 md:pt-28 md:pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white"
    >
        <div
            class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMt5LiLMTAtMTAgMTAtMjAgMC0xMC05LjUtMTAtMjAgMC0xMHoiIGZpbGw9IiMxRDlFNzUiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"
        ></div>

        <div class="max-w-7xl mx-auto relative">
            <div class="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div class="order-2 lg:order-1">
                    <div
                        class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1D9E75]/10 rounded-full text-[#1D9E75] font-medium text-xs sm:text-sm mb-4 md:mb-6"
                    >
                        <span
                            class="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse"
                        ></span>
                        SISTEMA 100% EN LA NUBE
                    </div>
                    <h1
                        class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#111] leading-[1.15] mb-4 md:mb-6 tracking-tight"
                    >
                        CONTROLA TU<br />
                        <span class="text-[#1D9E75]">FERRETERÍA</span><br />
                        <span
                            class="text-gray-400 text-2xl sm:text-3xl md:text-4xl"
                            >COMO UN PRO</span
                        >
                    </h1>
                    <p
                        class="text-base md:text-lg text-gray-600 mb-6 md:mb-8 max-w-xl leading-relaxed"
                    >
                        La plataforma más robusta para gestionar inventario,
                        ventas POS y clientes. Sin instalación, sin servidores,
                        sin complicaciones.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <a
                            href="/registro"
                            class="px-6 md:px-8 py-3 md:py-4 bg-[#1D9E75] text-white font-bold text-sm md:text-lg rounded-xl hover:bg-[#0F6E56] transition-all transform hover:scale-[1.02] shadow-lg shadow-[#1D9E75]/25 flex items-center justify-center gap-2 btn-hover"
                        >
                            <svg
                                class="w-4 h-4 md:w-5 md:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M14 10h4v4m-4-4l-4-4-4 4m4-4V2m0 22v-4m4-4l4 4-4 4m-4-4h4v-4"
                                /></svg
                            >
                            Empezar Gratis
                        </a>
                        <a
                            href="#planes"
                            class="px-6 md:px-8 py-3 md:py-4 bg-white text-[#111] font-bold text-sm md:text-lg rounded-xl border-2 border-gray-200 hover:border-[#1D9E75] transition-all flex items-center justify-center gap-2"
                        >
                            <svg
                                class="w-4 h-4 md:w-5 md:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                ><path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                /></svg
                            >
                            Ver planes
                        </a>
                    </div>
                    <div
                        class="flex items-center gap-4 md:gap-8 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200"
                    >
                        <div>
                            <div
                                class="text-2xl md:text-3xl font-bold text-[#111]"
                            >
                                500+
                            </div>
                            <div class="text-xs md:text-sm text-gray-500">
                                Ferreterías
                            </div>
                        </div>
                        <div>
                            <div
                                class="text-2xl md:text-3xl font-bold text-[#111]"
                            >
                                50K+
                            </div>
                            <div class="text-xs md:text-sm text-gray-500">
                                Productos
                            </div>
                        </div>
                        <div>
                            <div
                                class="text-2xl md:text-3xl font-bold text-[#111]"
                            >
                                99.9%
                            </div>
                            <div class="text-xs md:text-sm text-gray-500">
                                Uptime
                            </div>
                        </div>
                    </div>
                </div>
                <div class="order-1 lg:order-2 relative hidden sm:block">
                    <div
                        class="absolute inset-0 bg-[#1D9E75]/10 rounded-3xl blur-3xl"
                    ></div>
                    <div class="relative bg-[#111] rounded-2xl p-6 shadow-2xl">
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div
                                class="w-3 h-3 bg-yellow-500 rounded-full"
                            ></div>
                            <div
                                class="w-3 h-3 bg-green-500 rounded-full"
                            ></div>
                            <span class="ml-2 text-gray-400 text-sm font-mono"
                                >FerreControl v2.0</span
                            >
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-gray-800 rounded-xl p-4">
                                <div class="text-gray-400 text-xs mb-1">
                                    Ventas hoy
                                </div>
                                <div class="text-2xl font-bold text-white">
                                    $2,450,000
                                </div>
                                <div class="text-green-400 text-xs">
                                    ↑ 12% vs ayer
                                </div>
                            </div>
                            <div class="bg-gray-800 rounded-xl p-4">
                                <div class="text-gray-400 text-xs mb-1">
                                    Tickets hoy
                                </div>
                                <div class="text-2xl font-bold text-white">
                                    48
                                </div>
                                <div class="text-green-400 text-xs">
                                    ↑ 5 vs ayer
                                </div>
                            </div>
                            <div class="bg-gray-800 rounded-xl p-4 col-span-2">
                                <div class="text-gray-400 text-xs mb-2">
                                    Productos más vendidos
                                </div>
                                <div class="space-y-3">
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <span class="text-gray-300 text-sm"
                                            >Tornillos 5/8" Pack x100</span
                                        >
                                        <span class="text-[#1D9E75] font-bold"
                                            >127 und</span
                                        >
                                    </div>
                                    <div class="h-px bg-gray-700"></div>
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <span class="text-gray-300 text-sm"
                                            >Cemento Portland 50kg</span
                                        >
                                        <span class="text-[#1D9E75] font-bold"
                                            >45 und</span
                                        >
                                    </div>
                                    <div class="h-px bg-gray-700"></div>
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <span class="text-gray-300 text-sm"
                                            >Cable TW #12 AWG</span
                                        >
                                        <span class="text-[#1D9E75] font-bold"
                                            >32 und</span
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="mt-4 flex items-center justify-between pt-4 border-t border-gray-700"
                        >
                            <div class="flex -space-x-2">
                                <div
                                    class="w-8 h-8 bg-[#1D9E75] rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#111]"
                                >
                                    A
                                </div>
                                <div
                                    class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#111]"
                                >
                                    M
                                </div>
                                <div
                                    class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-[#111]"
                                >
                                    +2
                                </div>
                            </div>
                            <span class="text-gray-500 text-xs"
                                >3 usuarios activos</span
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Trusted By -->
    <section class="py-10 bg-white border-b border-gray-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p
                class="text-center text-gray-400 text-xs font-semibold mb-8 uppercase tracking-[0.2em]"
            >
                Empresas que confían en nosotros
            </p>
            <div
                class="flex flex-wrap justify-center items-center gap-12 md:gap-20"
            >
                <div
                    class="flex items-center gap-2 grayscale opacity-40 hover:opacity-70 transition-opacity"
                >
                    <div
                        class="w-10 h-10 rounded-lg bg-[#1D9E75]/20 flex items-center justify-center"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            ><path
                                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                            /></svg
                        >
                    </div>
                    <span class="text-lg font-bold text-gray-600"
                        >FerreStrong</span
                    >
                </div>
                <div
                    class="flex items-center gap-2 grayscale opacity-40 hover:opacity-70 transition-opacity"
                >
                    <div
                        class="w-10 h-10 rounded-lg bg-[#1D9E75]/20 flex items-center justify-center"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M14.7 6.3a1 1 0 0 0 0 1.4l1.3 1.3a1 1 0 0 0 1.4 0l2.3-2.3a1 1 0 0 0 0-1.4l-2.3-2.3a1 1 0 0 0-1.4 0l-1.3 1.3a1 1 0 0 0 0 1.4z"
                            /><path
                                d="M9.3 17.7a1 1 0 0 0 0-1.4l-1.3-1.3a1 1 0 0 0-1.4 0l-2.3 2.3a1 1 0 0 0 0 1.4l2.3 2.3a1 1 0 0 0 1.4 0l1.3-1.3a1 1 0 0 0 0-1.4z"
                            /></svg
                        >
                    </div>
                    <span class="text-lg font-bold text-gray-600"
                        >Tornillos<span class="font-normal">del Valle</span
                        ></span
                    >
                </div>
                <div
                    class="flex items-center gap-2 grayscale opacity-40 hover:opacity-70 transition-opacity"
                >
                    <div
                        class="w-10 h-10 rounded-lg bg-[#1D9E75]/20 flex items-center justify-center"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><rect
                                x="3"
                                y="11"
                                width="18"
                                height="11"
                                rx="2"
                            /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg
                        >
                    </div>
                    <span class="text-lg font-bold text-gray-600"
                        >Fix<span class="font-normal">Cerrajería</span></span
                    >
                </div>
                <div
                    class="flex items-center gap-2 grayscale opacity-40 hover:opacity-70 transition-opacity"
                >
                    <div
                        class="w-10 h-10 rounded-lg bg-[#1D9E75]/20 flex items-center justify-center"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" /></svg
                        >
                    </div>
                    <span class="text-lg font-bold text-gray-600"
                        >Electro<span class="font-normal">Ferre</span></span
                    >
                </div>
                <div
                    class="flex items-center gap-2 grayscale opacity-40 hover:opacity-70 transition-opacity"
                >
                    <div
                        class="w-10 h-10 rounded-lg bg-[#1D9E75]/20 flex items-center justify-center"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            ><path
                                d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                            /><polyline points="9 22 9 12 15 12 15 22" /></svg
                        >
                    </div>
                    <span class="text-lg font-bold text-gray-600"
                        >Hogar<span class="font-normal">Ferre</span></span
                    >
                </div>
            </div>
        </div>
    </section>

    <!-- Stats Bar -->
    <section class="py-12 bg-[#111]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div class="text-center hover-lift animate-fade-up stagger-1">
                    <div class="text-4xl font-bold text-white mb-2">15K+</div>
                    <div class="text-gray-400 text-sm">
                        Ventas procesadas/día
                    </div>
                </div>
                <div class="text-center hover-lift animate-fade-up stagger-2">
                    <div class="text-4xl font-bold text-white mb-2">500+</div>
                    <div class="text-gray-400 text-sm">Negocios activos</div>
                </div>
                <div class="text-center hover-lift animate-fade-up stagger-3">
                    <div class="text-4xl font-bold text-white mb-2">$50M+</div>
                    <div class="text-gray-400 text-sm">En inventario</div>
                </div>
                <div class="text-center hover-lift animate-fade-up stagger-4">
                    <div class="text-4xl font-bold text-white mb-2">24/7</div>
                    <div class="text-gray-400 text-sm">Soporte disponible</div>
                </div>
            </div>
        </div>
    </section>

    <!-- How It Works -->
    <section id="como-funciona" class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-20">
                <h2 class="text-4xl sm:text-5xl font-bold text-[#111] mb-6">
                    CÓMO EMPEZAR
                </h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    En solo 3 pasos tienes tu ferretería digitalizada
                </p>
            </div>
            <div class="grid md:grid-cols-3 gap-8">
                <div
                    class="text-center relative group hover-lift animate-fade-up stagger-1"
                >
                    <div
                        class="w-20 h-20 bg-[#1D9E75] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1D9E75]/25 group-hover:scale-110 transition-transform"
                    >
                        <svg
                            class="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            /></svg
                        >
                    </div>
                    <div
                        class="text-6xl font-bold text-gray-100 absolute top-0 right-1/2 translate-x-8 group-hover:scale-110 transition-transform"
                    >
                        1
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Crea tu cuenta
                    </h3>
                    <p class="text-gray-600">
                        Regístrate en segundos con tu correo electrónico. No
                        necesitas tarjeta de crédito.
                    </p>
                </div>
                <div
                    class="text-center relative group hover-lift animate-fade-up stagger-2"
                >
                    <div
                        class="w-20 h-20 bg-[#1D9E75] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1D9E75]/25 group-hover:scale-110 transition-transform"
                    >
                        <svg
                            class="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            /></svg
                        >
                    </div>
                    <div
                        class="text-6xl font-bold text-gray-100 absolute top-0 right-1/2 translate-x-8 group-hover:scale-110 transition-transform"
                    >
                        2
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Agrega tus productos
                    </h3>
                    <p class="text-gray-600">
                        Importa tu inventario desde Excel o agrégalos uno por
                        uno. Es rápido y fácil.
                    </p>
                </div>
                <div
                    class="text-center relative group hover-lift animate-fade-up stagger-3"
                >
                    <div
                        class="w-20 h-20 bg-[#1D9E75] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#1D9E75]/25 group-hover:scale-110 transition-transform"
                    >
                        <svg
                            class="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            /></svg
                        >
                    </div>
                    <div
                        class="text-6xl font-bold text-gray-100 absolute top-0 right-1/2 translate-x-8 group-hover:scale-110 transition-transform"
                    >
                        3
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Empieza a vender
                    </h3>
                    <p class="text-gray-600">
                        Usa el POS desde cualquier dispositivo y comienza a
                        gestionar tu negocio.
                    </p>
                </div>
            </div>
            <div class="text-center mt-12">
                <a
                    href="/registro"
                    class="inline-flex items-center gap-2 px-8 py-4 bg-[#1D9E75] text-white font-bold rounded-xl hover:bg-[#0F6E56] transition-all transform hover:scale-105 shadow-lg shadow-[#1D9E75]/30 btn-hover animate-pulse-glow group"
                >
                    <svg
                        class="w-5 h-5 group-hover:animate-bounce"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                        /></svg
                    >
                    Empezar Gratis
                    <svg
                        class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                        /></svg
                    >
                </a>
                <p class="text-gray-500 text-sm mt-3">
                    ✓ Sin tarjeta de crédito · ✓ Configuración en 5 minutos
                </p>
            </div>
        </div>
    </section>

    <!-- Beneficios Section -->
    <section id="beneficios" class="py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-20">
                <h2 class="text-4xl sm:text-5xl font-bold text-[#111] mb-6">
                    POR QUÉ FERRECONTROL
                </h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    Diseñado específicamente para las necesidades de ferreterías
                    y talleres en Colombia
                </p>
            </div>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                    class="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#1D9E75] hover:shadow-lg transition-all duration-300 card-hover animate-fade-up stagger-1"
                >
                    <div
                        class="w-14 h-14 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors"
                    >
                        <svg
                            class="w-7 h-7 text-[#1D9E75] group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Sistema Ultrarrápido
                    </h3>
                    <p class="text-gray-600">
                        Interfaz optimizada para registrar ventas en segundos.
                        No más filas en tu caja.
                    </p>
                </div>
                <div
                    class="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#1D9E75] hover:shadow-lg transition-all duration-300 card-hover animate-fade-up stagger-2"
                >
                    <div
                        class="w-14 h-14 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors"
                    >
                        <svg
                            class="w-7 h-7 text-[#1D9E75] group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Datos 100% Seguros
                    </h3>
                    <p class="text-gray-600">
                        Respaldos automáticos diarios. Tu información nunca se
                        pierde.
                    </p>
                </div>
                <div
                    class="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#1D9E75] hover:shadow-lg transition-all duration-300 card-hover animate-fade-up stagger-3"
                >
                    <div
                        class="w-14 h-14 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors"
                    >
                        <svg
                            class="w-7 h-7 text-[#1D9E75] group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Multi-Dispositivo
                    </h3>
                    <p class="text-gray-600">
                        Accede desde tu celular, tablet o computador. Donde
                        estés, cuando quieras.
                    </p>
                </div>
                <div
                    class="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#1D9E75] hover:shadow-lg transition-all duration-300 card-hover animate-fade-up stagger-4"
                >
                    <div
                        class="w-14 h-14 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors"
                    >
                        <svg
                            class="w-7 h-7 text-[#1D9E75] group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Sincronización en Tiempo Real
                    </h3>
                    <p class="text-gray-600">
                        Varias personas vendiendo al mismo tiempo con inventario
                        actualizado.
                    </p>
                </div>
                <div
                    class="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#1D9E75] hover:shadow-lg transition-all duration-300 card-hover animate-fade-up stagger-5"
                >
                    <div
                        class="w-14 h-14 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors"
                    >
                        <svg
                            class="w-7 h-7 text-[#1D9E75] group-hover:text-white transition-colors"
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
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Reportes en Un Clic
                    </h3>
                    <p class="text-gray-600">
                        Conoce tus ventas, ganancias y rotación de inventario al
                        instante.
                    </p>
                </div>
                <div
                    class="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#1D9E75] hover:shadow-lg transition-all duration-300 card-hover animate-fade-up stagger-6"
                >
                    <div
                        class="w-14 h-14 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#1D9E75] transition-colors"
                    >
                        <svg
                            class="w-7 h-7 text-[#1D9E75] group-hover:text-white transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a4 4 0 11-8 0 4 4 0 018 0zM17 20a4 4 0 100-8 4 4 0 000 8z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-[#111] mb-3">
                        Gestión de Clientes
                    </h3>
                    <p class="text-gray-600">
                        Historial de compras, créditos y seguimiento comercial
                        por cliente.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section id="funciones" class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-20">
                <h2 class="text-4xl sm:text-5xl font-bold text-[#111] mb-6">
                    FUNCIONES COMPLETAS
                </h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    Todo lo que necesitas para manejar tu ferretería en una sola
                    plataforma
                </p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                    class="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 card-hover animate-scale"
                >
                    <div
                        class="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-4"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#111] mb-2">
                        Punto de Venta (POS)
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Interfaz ultrarrápida. Búsqueda por código, nombre o
                        categoría. Carrito de compras y múltiples métodos de
                        pago.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 card-hover animate-scale"
                >
                    <div
                        class="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-4"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
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
                    <h3 class="text-lg font-bold text-[#111] mb-2">
                        Control de Inventario
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Stock en tiempo real. Alertas de stock mínimo, control
                        multi-bodega y seguimiento por producto.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 card-hover animate-scale"
                >
                    <div
                        class="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-4"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#111] mb-2">
                        Reportes y Estadísticas
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Ventas diarias, mensuales, productos más vendidos y
                        valor del inventario. Gráficos y exportación Excel.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 card-hover animate-scale"
                >
                    <div
                        class="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-4"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a4 4 0 11-8 0 4 4 0 018 0zM17 20a4 4 0 100-8 4 4 0 000 8z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#111] mb-2">
                        Gestión de Clientes
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Registra clientes. Historial de compras, créditos,
                        deudas y seguimiento comercial.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 card-hover animate-scale"
                >
                    <div
                        class="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-4"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#111] mb-2">
                        Traslados y Recepciones
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Mueve productos entre bodegas, recibe mercancía y
                        controla cada movimiento.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 card-hover animate-scale"
                >
                    <div
                        class="w-12 h-12 bg-[#1D9E75]/10 rounded-xl flex items-center justify-center mb-4"
                    >
                        <svg
                            class="w-6 h-6 text-[#1D9E75]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#111] mb-2">
                        Modo Offline
                    </h3>
                    <p class="text-gray-600 text-sm">
                        Registra ventas sin conexión. Sincroniza automáticamente
                        cuando vuelvas a internet.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Testimonios Section -->
    <section id="testimonios" class="py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-20">
                <h2 class="text-4xl sm:text-5xl font-bold text-[#111] mb-6">
                    LO QUE DICEN NUESTROS CLIENTES
                </h2>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                    Miles de ferreterías ya confían en FerreControl
                </p>
            </div>
            <div class="grid md:grid-cols-3 gap-6">
                <div
                    class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm card-hover animate-fade-up stagger-1"
                >
                    <div class="flex items-center gap-1 mb-4">
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                    </div>
                    <p class="text-gray-600 mb-6">
                        "Desde que usamos FerreControl reducimos el tiempo de
                        venta a la mitad. El inventario siempre está actualizado
                        y sabemos exactamente qué productos nos faltan."
                    </p>
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-[#1D9E75] rounded-full flex items-center justify-center text-white font-bold"
                        >
                            JC
                        </div>
                        <div>
                            <div class="text-[#111] font-bold">
                                Jorge Campos
                            </div>
                            <div class="text-gray-500 text-sm">
                                Ferretería El Tornillo
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm card-hover animate-fade-up stagger-2"
                >
                    <div class="flex items-center gap-1 mb-4">
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                    </div>
                    <p class="text-gray-600 mb-6">
                        "El soporte es excelente. Cualquier duda me responden en
                        minutos. La aplicación es muy fácil de usar y mis
                        empleados aprendieron rápido."
                    </p>
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold"
                        >
                            MR
                        </div>
                        <div>
                            <div class="text-[#111] font-bold">
                                María Rodríguez
                            </div>
                            <div class="text-gray-500 text-sm">
                                Ferretería San Juan
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm card-hover animate-fade-up stagger-3"
                >
                    <div class="flex items-center gap-1 mb-4">
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                        <svg
                            class="w-5 h-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            ><path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            /></svg
                        >
                    </div>
                    <p class="text-gray-600 mb-6">
                        "Lo que más me gusta es que puedo revisar mi ferretería
                        desde cualquier lugar. Estoy tranquilo sabiendo que todo
                        está controlado."
                    </p>
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold"
                        >
                            GP
                        </div>
                        <div>
                            <div class="text-[#111] font-bold">
                                Gabriel Pérez
                            </div>
                            <div class="text-gray-500 text-sm">
                                Ferretería Industrial
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Comparación Section -->
    <section class="py-16 md:py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8 md:mb-16">
                <h2
                    class="text-3xl md:text-4xl sm:text-5xl font-bold text-[#111] mb-4 md:mb-6"
                >
                    COMPARA LOS PLANES
                </h2>
                <p class="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
                    Elige el plan que mejor se adapte a tu negocio
                </p>
            </div>

            <!-- Mobile: Cards (hidden on lg) -->
            <div class="lg:hidden space-y-4">
                <!-- Basic Card -->
                <div
                    class="bg-white rounded-2xl p-4 md:p-6 border-2 border-gray-200 flex flex-col"
                >
                    <div class="text-center mb-4">
                        <h3
                            class="text-xl md:text-2xl font-bold text-[#111] mb-2"
                        >
                            BASIC
                        </h3>
                        <p class="text-gray-500 text-sm">
                            Ideal para negocios pequeños
                        </p>
                    </div>
                    <!-- Monthly -->
                    <div class="text-center mb-2">
                        <span class="text-3xl md:text-4xl font-bold text-[#111]"
                            >$15.000 COP</span
                        >
                        <span class="text-gray-500">/mes</span>
                    </div>
                    <!-- 6 months -->
                    <div class="text-center mb-1">
                        <span class="text-sm text-gray-500">6 meses: </span>
                        <span class="text-lg font-bold text-[#111]"
                            >$85.500 COP</span
                        >
                        <span class="text-xs text-[#1D9E75] ml-1">(-5%)</span>
                    </div>
                    <!-- 12 months -->
                    <div class="text-center mb-4">
                        <span class="text-sm text-gray-500">12 meses: </span>
                        <span class="text-lg font-bold text-[#1D9E75]"
                            >$153.000 COP</span
                        >
                        <span class="text-xs text-[#1D9E75] ml-1">(-15%)</span>
                    </div>
                    <div class="space-y-2 text-sm flex-1">
                        <div
                            class="flex justify-between py-2 border-b border-gray-100"
                        >
                            <span class="text-gray-600">Usuarios</span><span
                                class="font-bold">3</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-100"
                        >
                            <span class="text-gray-600">Bodegas</span><span
                                class="font-bold">1</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-100"
                        >
                            <span class="text-gray-600">POS</span><span
                                class="text-[#1D9E75]">✓</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-100"
                        >
                            <span class="text-gray-600">Inventario</span><span
                                class="text-[#1D9E75]">✓</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-100"
                        >
                            <span class="text-gray-400"
                                >Gestión de clientes</span
                            ><span class="text-gray-400">—</span>
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-100"
                        >
                            <span class="text-gray-400">Reportes avanzados</span
                            ><span class="text-gray-400">—</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-400">Traslados</span><span
                                class="text-gray-400">—</span
                            >
                        </div>
                    </div>
                    <a
                        href="/registro?plan=basic"
                        class="block w-full mt-4 py-3 bg-[#111] text-white font-bold rounded-xl text-center"
                        >Empezar Gratis</a
                    >
                </div>
                <!-- Pro Card -->
                <div
                    class="bg-[#111] rounded-2xl p-4 md:p-6 shadow-xl flex flex-col"
                >
                    <div class="text-center mb-4">
                        <span
                            class="inline-block px-3 py-1 bg-[#1D9E75] rounded-full text-sm font-bold text-white mb-2"
                            >MÁS VENDIDO</span
                        >
                        <h3
                            class="text-xl md:text-2xl font-bold text-white mb-2"
                        >
                            PRO
                        </h3>
                        <p class="text-gray-400 text-sm">
                            Para negocios en crecimiento
                        </p>
                    </div>
                    <!-- Monthly -->
                    <div class="text-center mb-2">
                        <span class="text-3xl md:text-4xl font-bold text-white"
                            >$35.000 COP</span
                        >
                        <span class="text-gray-400">/mes</span>
                    </div>
                    <!-- 6 months -->
                    <div class="text-center mb-1">
                        <span class="text-sm text-gray-400">6 meses: </span>
                        <span class="text-lg font-bold text-white"
                            >$199.500 COP</span
                        >
                        <span class="text-xs text-[#1D9E75] ml-1">(-5%)</span>
                    </div>
                    <!-- 12 months -->
                    <div class="text-center mb-4">
                        <span class="text-sm text-gray-400">12 meses: </span>
                        <span class="text-lg font-bold text-[#1D9E75]"
                            >$357.000 COP</span
                        >
                        <span class="text-xs text-[#1D9E75] ml-1">(-15%)</span>
                    </div>
                    <div class="space-y-2 text-sm flex-1">
                        <div
                            class="flex justify-between py-2 border-b border-gray-700"
                        >
                            <span class="text-gray-400">Usuarios</span><span
                                class="font-bold text-white">10</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-700"
                        >
                            <span class="text-gray-400">Bodegas</span><span
                                class="font-bold text-white">3</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-700"
                        >
                            <span class="text-gray-400">POS</span><span
                                class="text-[#1D9E75]">✓</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-700"
                        >
                            <span class="text-gray-400">Inventario</span><span
                                class="text-[#1D9E75]">✓</span
                            >
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-700"
                        >
                            <span class="text-gray-400"
                                >Gestión de clientes</span
                            ><span class="text-[#1D9E75]">✓</span>
                        </div>
                        <div
                            class="flex justify-between py-2 border-b border-gray-700"
                        >
                            <span class="text-gray-400">Reportes avanzados</span
                            ><span class="text-[#1D9E75]">✓</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-400">Traslados</span><span
                                class="text-[#1D9E75]">✓</span
                            >
                        </div>
                    </div>
                    <a
                        href="/registro?plan=pro"
                        class="block w-full mt-4 py-3 bg-white text-[#1D9E75] font-bold rounded-xl text-center"
                        >Empezar Gratis</a
                    >
                </div>
            </div>

            <!-- Desktop: Table (hidden on mobile) -->
            <div class="hidden lg:block overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200">
                            <th
                                class="text-left text-gray-500 font-medium py-4 px-4"
                                >Características</th
                            >
                            <th
                                class="text-center text-[#111] font-bold py-4 px-4 text-xl"
                                >BASIC</th
                            >
                            <th
                                class="text-center text-[#1D9E75] font-bold py-4 px-4 text-xl bg-[#1D9E75]/10 rounded-t-xl"
                                >PRO</th
                            >
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4">Usuarios</td>
                            <td class="text-center text-[#111] py-4 px-4">3</td>
                            <td
                                class="text-center text-[#111] py-4 px-4 bg-[#1D9E75]/5"
                                >10</td
                            >
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4">Bodegas</td>
                            <td class="text-center text-[#111] py-4 px-4">1</td>
                            <td
                                class="text-center text-[#111] py-4 px-4 bg-[#1D9E75]/5"
                                >3</td
                            >
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4"
                                >Punto de Venta (POS)</td
                            >
                            <td class="text-center text-[#111] py-4 px-4"
                                ><svg
                                    class="w-5 h-5 text-[#1D9E75] mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    ><path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    /></svg
                                ></td
                            >
                            <td
                                class="text-center text-[#111] py-4 px-4 bg-[#1D9E75]/5"
                                ><svg
                                    class="w-5 h-5 text-[#1D9E75] mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    ><path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    /></svg
                                ></td
                            >
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4">Inventario</td>
                            <td class="text-center text-[#111] py-4 px-4"
                                ><svg
                                    class="w-5 h-5 text-[#1D9E75] mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    ><path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    /></svg
                                ></td
                            >
                            <td
                                class="text-center text-[#111] py-4 px-4 bg-[#1D9E75]/5"
                                ><svg
                                    class="w-5 h-5 text-[#1D9E75] mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    ><path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    /></svg
                                ></td
                            >
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4"
                                >Gestión de Clientes</td
                            >
                            <td class="text-center text-gray-400 py-4 px-4"
                                >—</td
                            >
                            <td
                                class="text-center text-[#111] py-4 px-4 bg-[#1D9E75]/5"
                                ><svg
                                    class="w-5 h-5 text-[#1D9E75] mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    ><path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    /></svg
                                ></td
                            >
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4"
                                >Reportes Avanzados</td
                            >
                            <td class="text-center text-gray-400 py-4 px-4"
                                >—</td
                            >
                            <td
                                class="text-center text-[#111] py-4 px-4 bg-[#1D9E75]/5"
                                ><svg
                                    class="w-5 h-5 text-[#1D9E75] mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    ><path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    /></svg
                                ></td
                            >
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4">Traslados</td>
                            <td class="text-center text-gray-400 py-4 px-4"
                                >—</td
                            >
                            <td
                                class="text-center text-[#111] py-4 px-4 bg-[#1D9E75]/5"
                                ><svg
                                    class="w-5 h-5 text-[#1D9E75] mx-auto"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    ><path
                                        fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"
                                    /></svg
                                ></td
                            >
                        </tr>
                        <tr class="border-b border-gray-100">
                            <td class="text-gray-600 py-4 px-4">Precio</td>
                            <td
                                class="text-center text-[#111] font-bold py-4 px-4 text-2xl"
                                >$15.000 COP<span class="text-sm text-gray-500"
                                    >/mes</span
                                >
                                <div
                                    class="text-xs text-[#1D9E75] font-normal mt-1"
                                >
                                    6 meses: $85.500 COP (-5%)
                                </div>
                                <div class="text-xs text-[#1D9E75] font-normal">
                                    12 meses: $153.000 COP (-15%)
                                </div>
                            </td>
                            <td
                                class="text-center text-[#1D9E75] font-bold py-4 px-4 text-2xl bg-[#1D9E75]/10"
                                >$35.000 COP<span class="text-sm text-[#1D9E75]"
                                    >/mes</span
                                >
                                <div
                                    class="text-xs text-[#1D9E75] font-normal mt-1"
                                >
                                    6 meses: $199.500 COP (-5%)
                                </div>
                                <div class="text-xs text-[#1D9E75] font-normal">
                                    12 meses: $357.000 COP (-15%)
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- Planes Section -->
    <section id="planes" class="py-16 md:py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-8 md:mb-16">
                <h2
                    class="text-3xl md:text-4xl sm:text-5xl font-bold text-[#111] mb-4 md:mb-6"
                >
                    NUESTROS PLANES
                </h2>
                <p class="text-base md:text-xl text-gray-600 max-w-2xl mx-auto">
                    Precios claros, sin letras pequeñas. Ambos planes incluyen
                </p>
                <div class="flex flex-wrap justify-center gap-2 md:gap-4 mt-4">
                    <span
                        class="px-2 md:px-3 py-1 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full text-xs md:text-sm font-medium"
                        >✓ Sin límite</span
                    >
                    <span
                        class="px-2 md:px-3 py-1 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full text-xs md:text-sm font-medium"
                        >✓ Datos seguros</span
                    >
                    <span
                        class="px-2 md:px-3 py-1 bg-[#1D9E75]/10 text-[#1D9E75] rounded-full text-xs md:text-sm font-medium"
                        >✓ Soporte</span
                    >
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
                <div
                    class="bg-white rounded-2xl p-4 md:p-8 border-2 border-gray-200 hover:border-[#1D9E75] transition-all shadow-sm hover:shadow-lg flex flex-col"
                >
                    <div class="text-center mb-6">
                        <h3 class="text-2xl font-bold text-[#111] mb-2">
                            BASIC
                        </h3>
                        <p class="text-gray-500 text-sm">
                            Ideal para negocios pequeños
                        </p>
                    </div>
                    <div class="text-center mb-8">
                        <span class="text-5xl font-bold text-[#111]"
                            >$15.000 COP</span
                        >
                        <span class="text-gray-500">/mes</span>
                        <div class="text-sm text-[#1D9E75] mt-2">
                            6 meses: $85.500 COP (-5%) · 12 meses: $153.000 COP
                            (-15%)
                        </div>
                    </div>
                    <ul class="space-y-4 mb-8 flex-1">
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-gray-600">3 usuarios</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-gray-600">1 Bodega</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-gray-600"
                                >Punto de Venta (POS)</span
                            >
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-gray-600"
                                >Inventario completo</span
                            >
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-gray-600">Reportes básicos</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-gray-600">Soporte en línea</span>
                        </li>
                    </ul>
                    <a
                        href="/registro?plan=basic"
                        class="block w-full py-4 bg-[#111] text-white font-bold rounded-xl text-center hover:bg-gray-800 transition-all flex items-center justify-center gap-2 btn-hover"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            /></svg
                        >
                        Empezar Gratis
                    </a>
                </div>
                <div
                    class="bg-[#111] rounded-2xl p-8 shadow-xl relative transform hover:scale-[1.02] transition-transform hover-lift flex flex-col"
                >
                    <div
                        class="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1D9E75] rounded-full text-sm font-bold text-white"
                    >
                        MÁS VENDIDO
                    </div>
                    <div class="text-center mb-6">
                        <h3 class="text-2xl font-bold text-white mb-2">PRO</h3>
                        <p class="text-gray-400 text-sm">
                            Para negocios en crecimiento
                        </p>
                    </div>
                    <div class="text-center mb-8">
                        <span class="text-5xl font-bold text-white"
                            >$35.000 COP</span
                        >
                        <span class="text-gray-400">/mes</span>
                        <div class="text-sm text-[#1D9E75] mt-2">
                            6 meses: $199.500 COP (-5%) · 12 meses: $357.000 COP
                            (-15%)
                        </div>
                    </div>
                    <ul class="space-y-4 mb-8 flex-1">
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white">Todo del plan Basic</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white">10 usuarios</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white">3 Bodegas</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white">Gestión de clientes</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white">Reportes avanzados</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white"
                                >Traslados entre bodegas</span
                            >
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white">Exportación Excel</span>
                        </li>
                        <li class="flex items-center gap-3">
                            <svg
                                class="w-5 h-5 text-[#1D9E75] flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                ><path
                                    fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"
                                /></svg
                            >
                            <span class="text-white">Soporte prioritario</span>
                        </li>
                    </ul>
                    <a
                        href="/registro?plan=pro"
                        class="block w-full py-4 bg-[#1D9E75] text-white font-bold rounded-xl text-center hover:bg-[#0F6E56] transition-all flex items-center justify-center gap-2 btn-hover"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            ><path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            /></svg
                        >
                        Empezar Gratis
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- FAQ Section -->
    <section class="py-24 bg-white">
        <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16 animate-fade-down">
                <h2 class="text-4xl font-bold text-[#111] mb-4">
                    PREGUNTAS FRECUENTES
                </h2>
                <p class="text-gray-600">Todo lo que necesitas saber</p>
            </div>
            <div class="space-y-4">
                <div
                    class="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md hover-lift transition-all animate-fade-up stagger-1"
                >
                    <h3 class="text-[#111] font-bold mb-2">
                        ¿Necesito instalar algún programa?
                    </h3>
                    <p class="text-gray-600">
                        No. FerreControl funciona 100% en la nube. Solo
                        necesitas un navegador web (Chrome, Edge, Safari) y
                        conexión a internet.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md hover-lift transition-all animate-fade-up stagger-2"
                >
                    <h3 class="text-[#111] font-bold mb-2">
                        ¿Puedo usar el sistema sin internet?
                    </h3>
                    <p class="text-gray-600">
                        Sí. Nuestro modo offline te permite seguir vendiendo sin
                        conexión. Cuando vuelvas a internet, todo se sincroniza
                        automáticamente.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md hover-lift transition-all animate-fade-up stagger-3"
                >
                    <h3 class="text-[#111] font-bold mb-2">
                        ¿Qué pasa si quiero cambiar de plan?
                    </h3>
                    <p class="text-gray-600">
                        Puedes cambiar de plan en cualquier momento. El cambio
                        se aplica inmediatamente y solo pagan la diferencia.
                    </p>
                </div>
                <div
                    class="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md hover-lift transition-all animate-fade-up stagger-4"
                >
                    <h3 class="text-[#111] font-bold mb-2">
                        ¿Mis datos están seguros?
                    </h3>
                    <p class="text-gray-600">
                        Totalmente. Tenemos respaldos automáticos diarios y
                        nuestros servidores están en centros de datos
                        profesionales con certificación de seguridad.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section
        class="py-28 bg-gradient-to-br from-[#1D9E75] via-[#168a60] to-[#0F6E56] relative overflow-hidden"
    >
        <!-- Decorative circles -->
        <div
            class="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"
        ></div>
        <div
            class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"
        ></div>
        <div
            class="absolute top-1/4 right-1/4 w-64 h-64 bg-[#1D9E75]/30 rounded-full blur-3xl animate-pulse"
        ></div>

        <!-- Grid pattern -->
        <div
            class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NCAwLTE4LTguMDYtMTgtMThzOC4wNi0xOCAxOC0xOHoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-30"
        ></div>

        <!-- Floating shapes -->
        <div
            class="absolute top-20 left-[10%] w-4 h-4 bg-white/30 rounded-full animate-float"
        ></div>
        <div
            class="absolute top-32 right-[15%] w-3 h-3 bg-white/40 rounded-full animate-float"
            style="animation-delay: 0.5s;"
        ></div>
        <div
            class="absolute bottom-24 left-[20%] w-2 h-2 bg-white/50 rounded-full animate-float"
            style="animation-delay: 1s;"
        ></div>
        <div
            class="absolute bottom-32 right-[25%] w-5 h-5 bg-white/20 rounded-full animate-float"
            style="animation-delay: 1.5s;"
        ></div>

        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2
                class="text-4xl sm:text-5xl font-bold text-white mb-4 animate-fade-down"
            >
                ¿LISTO PARA DIGITALIZAR TU FERRERÍA?
            </h2>
            <p class="text-xl text-white/90 mb-4 animate-fade-up">
                Empieza gratis ahora. Sin compromiso, sin tarjeta de crédito.
            </p>
            <div
                class="flex flex-wrap justify-center gap-3 mb-8 animate-fade-up stagger-1"
            >
                <span
                    class="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm"
                    >✓ Sin límites</span
                >
                <span
                    class="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm"
                    >✓ Sin instalación</span
                >
                <span
                    class="px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm"
                    >✓ Soporte 24/7</span
                >
            </div>
            <a
                href="/registro"
                class="inline-flex items-center gap-3 px-12 py-5 bg-white text-[#1D9E75] font-bold text-xl rounded-2xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl btn-hover animate-pulse-glow group"
            >
                <svg
                    class="w-7 h-7 group-hover:animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                    /></svg
                >
                Empezar gratis
                <svg
                    class="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                    /></svg
                >
            </a>
            <p class="text-white/70 text-sm mt-4 animate-fade-up stagger-2">
                🛡️ Tus datos están seguros con nosotros
            </p>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-white border-t border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
                class="flex flex-col md:flex-row items-center justify-between gap-4"
            >
                <div class="flex items-center justify-center mb-4">
                    <IconLogo size={45} />
                    <!-- <WordMark size={200} /> -->
                    <div class="flex items-start ml-3">
                        <h1 class="text-xl font-bold text-gray-900 self-center">
                            Ferre<span class="text-primary-600">Control</span>
                        </h1>
                        <span class="text-gray-400 text-xs">POS</span>
                    </div>
                </div>
                <p class="text-sm text-gray-500">
                    © {new Date().getFullYear()} FerreControl. Todos los derechos
                    reservados.
                </p>
            </div>
        </div>
    </footer>

    <!-- WhatsApp Floating Button -->
    <a
        href="https://wa.me/573022600652"
        target="_blank"
        rel="noopener noreferrer"
        class="fixed bottom-6 right-6 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 animate-bounce"
    >
        <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.493.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
            />
        </svg>
    </a>
</div>

<style>
    :global(html) {
        scroll-behavior: smooth;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeInDown {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes fadeInRight {
        from {
            opacity: 0;
            transform: translateX(30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes float {
        0%,
        100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    @keyframes pulse-glow {
        0%,
        100% {
            box-shadow: 0 0 0 0 rgba(29, 158, 117, 0.4);
        }
        50% {
            box-shadow: 0 0 0 15px rgba(29, 158, 117, 0);
        }
    }

    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }

    @keyframes float3d {
        0%,
        100% {
            transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
        }
        25% {
            transform: perspective(1000px) rotateY(2deg) rotateX(1deg);
        }
        75% {
            transform: perspective(1000px) rotateY(-2deg) rotateX(-1deg);
        }
    }

    @keyframes counter {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    section[id] {
        animation: fadeInUp 0.8s ease-out forwards;
    }

    .animate-fade-up {
        animation: fadeInUp 0.6s ease-out forwards;
    }

    .animate-fade-down {
        animation: fadeInDown 0.6s ease-out forwards;
    }

    .animate-fade-left {
        animation: fadeInLeft 0.6s ease-out forwards;
    }

    .animate-fade-right {
        animation: fadeInRight 0.6s ease-out forwards;
    }

    .animate-scale {
        animation: scaleIn 0.6s ease-out forwards;
    }

    .animate-float {
        animation: float 3s ease-in-out infinite;
    }

    .animate-float-delayed {
        animation: float 3s ease-in-out infinite;
        animation-delay: 1.5s;
    }

    .animate-pulse-glow {
        animation: pulse-glow 2s ease-in-out infinite;
    }

    .animate-shimmer {
        background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
        );
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
    }

    .btn-hover {
        transition: all 0.3s ease;
    }

    .btn-hover:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(29, 158, 117, 0.3);
    }

    .card-hover {
        transition: all 0.4s ease;
    }

    .card-hover:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    }

    .card-hover:hover .card-icon {
        transform: scale(1.1) rotate(5deg);
    }

    .card-icon {
        transition: all 0.3s ease;
    }

    .gradient-text {
        background: linear-gradient(135deg, #1d9e75 0%, #0f6e56 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .gradient-border {
        position: relative;
    }

    .gradient-border::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 2px;
        background: linear-gradient(135deg, #1d9e75, #0f6e56);
        -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
    }

    .stagger-1 {
        animation-delay: 0.1s;
    }
    .stagger-2 {
        animation-delay: 0.2s;
    }
    .stagger-3 {
        animation-delay: 0.3s;
    }
    .stagger-4 {
        animation-delay: 0.4s;
    }
    .stagger-5 {
        animation-delay: 0.5s;
    }
    .stagger-6 {
        animation-delay: 0.6s;
    }

    .hover-lift {
        transition: all 0.3s ease;
    }

    .hover-lift:hover {
        transform: translateY(-5px);
    }

    .hover-scale {
        transition: all 0.3s ease;
    }

    .hover-scale:hover {
        transform: scale(1.05);
    }

    .hover-grow {
        transition: all 0.3s ease;
    }

    .hover-grow:hover {
        transform: scale(1.1);
    }

    ::view-transition-old(root),
    ::view-transition-new(root) {
        animation-duration: 0.3s;
    }
</style>
