<script lang="ts">
	import { onMount } from "svelte";
	import Spinner from "$components/ui/Spinner.svelte";
	import Badge from "$components/ui/Badge.svelte";
	import { reportesApi } from "$api/reportes";
	import { productosApi } from "$api/productos";
	import { toastStore } from "$stores/toast.store";
	import {
		formatCurrency,
		formatFecha,
		fechaISO,
		inicioMes,
	} from "$utils/index";
	import { suscripcionActual, usuarioActual } from "$stores/auth.store";
	import type { Dashboard, Producto } from "$types/index";

	export let data: { accessToken: string };
	const { accessToken } = data;

	let cargando = true;
	let dashboard: Dashboard | null = null;
	let stockBajo: Producto[] = [];
	let tendencia: any[] = [];
	let hoveredBar: number | null = null;

	onMount(async () => {
		try {
			const [dash, productos, trend] = await Promise.all([
				reportesApi.dashboard(accessToken),
				productosApi.stockBajo(accessToken),
				reportesApi.ventas(
					{
						desde: inicioMes(),
						hasta: fechaISO(),
						agrupacion: "dia",
					},
					accessToken,
				),
			]);
			dashboard = dash;
			stockBajo = productos.slice(0, 8);
			tendencia = Array.isArray(trend) ? trend : [];
		} catch (e: any) {
			toastStore.error(e?.mensajes?.[0] ?? "Error al cargar dashboard");
		} finally {
			cargando = false;
		}
	});

	$: maxVenta =
		tendencia.length > 0
			? Math.max(...tendencia.map((d: any) => d.monto ?? 0), 1)
			: 1;

	$: totalMesDiario = tendencia.reduce(
		(s: number, d: any) => s + (d.monto ?? 0),
		0,
	);

	function diaCorto(fecha: string): string {
		try {
			const d = new Date(fecha + "T12:00:00");
			return d.toLocaleDateString("es", { weekday: "narrow" });
		} catch {
			return "";
		}
	}

	$: mostrarBotonUpgrade =
		!!$usuarioActual &&
		$usuarioActual.rol === "admin" &&
		!!$suscripcionActual &&
		($suscripcionActual.planCodigo === "trial" ||
			$suscripcionActual.planCodigo === "basic");
</script>

<svelte:head><title>Dashboard — FerreControl</title></svelte:head>

{#if cargando}
	<div class="flex items-center justify-center py-20">
		<Spinner size="lg" />
	</div>
{:else if dashboard}
	<!-- Greeting header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
		<div>
			<h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
			<p class="text-sm text-gray-400 mt-1">Resumen general de tu negocio</p>
		</div>
		{#if mostrarBotonUpgrade}
			<a
				href="/admin/suscripcion/pagar"
				class="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-semibold hover:bg-amber-100 transition-colors shadow-sm w-fit"
			>
				<svg
					class="w-4 h-4"
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
				Mejorar mi Plan
			</a>
		{/if}
	</div>

	<!-- ─── KPI Hero: Ventas hoy destacado ───────────────────────── -->
	<div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
		<!-- Card principal: ventas hoy -->
		<div
			class="md:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 p-6 text-white"
		>
			<div class="relative z-10">
				<div class="flex items-center gap-2 mb-4">
					<div
						class="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"
					>
						<svg
							class="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
					</div>
					<span class="text-sm font-medium text-white/80"
						>Ventas de hoy</span
					>
				</div>
				<p class="text-3xl font-extrabold tracking-tight">
					{formatCurrency(dashboard.ventasHoy.monto)}
				</p>
				<p class="text-sm text-white/70 mt-2">
					{dashboard.ventasHoy.cantidad} transacciones realizadas
				</p>
			</div>
			<!-- Decorative circles -->
			<div
				class="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/5"
			></div>
			<div
				class="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5"
			></div>
		</div>

		<!-- Sub-KPIs -->
		<div class="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
			<!-- Ventas del mes -->
			<div
				class="rounded-2xl bg-white ring-1 ring-gray-100 p-5 flex flex-col justify-between"
			>
				<div class="flex items-center justify-between mb-3">
					<div
						class="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"
					>
						<svg
							class="w-4.5 h-4.5 text-primary-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
							/>
						</svg>
					</div>
					{#if dashboard.variacionMes !== 0}
						<span
							class="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full
							{dashboard.variacionMes >= 0
								? 'bg-primary-50 text-primary-600'
								: 'bg-danger-50 text-danger-600'}"
						>
							<svg
								class="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2.5"
									d={dashboard.variacionMes >= 0
										? "M5 15l7-7 7 7"
										: "M19 9l-7 7-7-7"}
								/>
							</svg>
							{Math.abs(dashboard.variacionMes).toFixed(1)}%
						</span>
					{/if}
				</div>
				<div>
					<p class="text-xs text-gray-400 font-medium">
						Ventas del mes
					</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5">
						{formatCurrency(dashboard.ventasMes.monto)}
					</p>
				</div>
			</div>

			<!-- Stock bajo -->
			<div
				class="rounded-2xl bg-white ring-1 ring-gray-100 p-5 flex flex-col justify-between"
			>
				<div class="flex items-center justify-between mb-3">
					<div
						class="w-9 h-9 rounded-xl bg-warning-50 flex items-center justify-center"
					>
						<svg
							class="w-4.5 h-4.5 text-warning-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					{#if dashboard.productosSinStock > 0}
						<span
							class="text-xs font-semibold px-2 py-0.5 rounded-full bg-danger-50 text-danger-600"
						>
							{dashboard.productosSinStock} sin stock
						</span>
					{/if}
				</div>
				<div>
					<p class="text-xs text-gray-400 font-medium">Stock bajo</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5">
						{dashboard.productosConStockBajo}
						<span class="text-sm font-normal text-gray-400"
							>productos</span
						>
					</p>
				</div>
			</div>

			<!-- Cuentas por cobrar -->
			<div
				class="rounded-2xl bg-white ring-1 ring-gray-100 p-5 flex flex-col justify-between"
			>
				<div class="flex items-center justify-between mb-3">
					<div
						class="w-9 h-9 rounded-xl bg-danger-50 flex items-center justify-center"
					>
						<svg
							class="w-4.5 h-4.5 text-danger-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
							/>
						</svg>
					</div>
					{#if dashboard.clientesConDeuda > 0}
						<span class="text-xs font-medium text-gray-400"
							>{dashboard.clientesConDeuda} clientes</span
						>
					{/if}
				</div>
				<div>
					<p class="text-xs text-gray-400 font-medium">Por cobrar</p>
					<p class="text-xl font-bold text-gray-900 mt-0.5">
						{formatCurrency(dashboard.deudaTotalPendiente)}
					</p>
				</div>
			</div>
		</div>
	</div>

	<!-- ─── Main grid: Chart + Stock alerts ──────────────────────── -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
		<!-- Gráfico de ventas -->
		<div
			class="md:col-span-2 rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden"
		>
			<div
				class="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
			>
				<div>
					<h2 class="text-sm font-semibold text-gray-900">
						Tendencia de ventas
					</h2>
					<p class="text-xs text-gray-400 mt-0.5">
						Ventas diarias del mes actual
					</p>
				</div>
				{#if tendencia.length > 0}
					<div class="text-right">
						<p class="text-lg font-bold text-gray-900">
							{formatCurrency(totalMesDiario)}
						</p>
						<p class="text-xs text-gray-400">acumulado</p>
					</div>
				{/if}
			</div>
			<div class="p-6">
				{#if tendencia.length === 0}
					<div
						class="flex flex-col items-center justify-center py-12 text-gray-300"
					>
						<svg
							class="w-10 h-10 mb-3"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
							/>
						</svg>
						<p class="text-sm">Sin datos de tendencia</p>
					</div>
				{:else}
					<!-- Y axis labels -->
					<div class="flex gap-3 h-52">
						<div
							class="flex flex-col justify-between text-xs text-gray-300 py-1 w-14 text-right shrink-0"
						>
							<span>{formatCurrency(maxVenta)}</span>
							<span>{formatCurrency(maxVenta / 2)}</span>
							<span>$0</span>
						</div>
						<!-- Bars -->
						<div class="flex-1 relative">
							<!-- Grid lines -->
							<div
								class="absolute inset-0 flex flex-col justify-between pointer-events-none"
							>
								<div
									class="border-b border-dashed border-gray-100"
								></div>
								<div
									class="border-b border-dashed border-gray-100"
								></div>
								<div class="border-b border-gray-100"></div>
							</div>
							<div
								class="relative flex items-end gap-[3px] h-full"
							>
								{#each tendencia as dia, i}
									<div
										class="flex-1 flex flex-col items-center justify-end h-full group relative"
										role="img"
										aria-label="{formatFecha(
											dia.fecha,
										)}: {formatCurrency(dia.monto ?? 0)}"
										onmouseenter={() => (hoveredBar = i)}
										onmouseleave={() => (hoveredBar = null)}
									>
										<!-- Tooltip -->
										{#if hoveredBar === i}
											<div
												class="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10 shadow-lg"
											>
												<p class="font-semibold">
													{formatCurrency(
														dia.monto ?? 0,
													)}
												</p>
												<p
													class="text-gray-400 text-[10px]"
												>
													{formatFecha(dia.fecha)}
												</p>
											</div>
										{/if}
										<div
											class="w-full rounded-t-md transition-all duration-200 min-h-[3px] {hoveredBar ===
											i
												? 'bg-primary-500'
												: 'bg-primary-300 hover:bg-primary-400'}"
											style="height: {Math.max(
												((dia.monto ?? 0) / maxVenta) *
													100,
												1.5,
											)}%"
										></div>
									</div>
								{/each}
							</div>
						</div>
					</div>
					<!-- X axis labels -->
					<div class="flex gap-3 mt-2">
						<div class="w-14 shrink-0"></div>
						<div class="flex-1 flex">
							{#each tendencia as dia, i}
								<div
									class="flex-1 text-center text-[10px] text-gray-300 font-medium"
								>
									{#if tendencia.length <= 15 || i % Math.ceil(tendencia.length / 10) === 0}
										{diaCorto(dia.fecha)}
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Alertas de stock bajo -->
		<div
			class="rounded-2xl bg-white ring-1 ring-gray-100 overflow-hidden flex flex-col"
		>
			<div
				class="px-5 py-4 border-b border-gray-50 flex items-center justify-between"
			>
				<div class="flex items-center gap-2">
					<div
						class="w-7 h-7 rounded-lg bg-warning-50 flex items-center justify-center"
					>
						<svg
							class="w-3.5 h-3.5 text-warning-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<h2 class="text-sm font-semibold text-gray-900">
						Alertas de stock
					</h2>
				</div>
				<a
					href="/admin/productos?stockBajo=true"
					class="text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
				>
					Ver todos &rarr;
				</a>
			</div>
			<div class="flex-1 overflow-y-auto">
				{#if stockBajo.length === 0}
					<div
						class="flex flex-col items-center justify-center py-12 text-gray-300"
					>
						<svg
							class="w-8 h-8 mb-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p class="text-sm">Todo en orden</p>
					</div>
				{:else}
					<ul>
						{#each stockBajo as p, i}
							<li
								class="px-5 py-3 flex items-center gap-3 hover:bg-gray-50/50 transition-colors {i !==
								stockBajo.length - 1
									? 'border-b border-gray-50'
									: ''}"
							>
								<div
									class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0"
								>
									{p.nombre.charAt(0).toUpperCase()}
								</div>
								<div class="min-w-0 flex-1">
									<p
										class="text-sm font-medium text-gray-800 truncate"
									>
										{p.nombre}
									</p>
									<p
										class="text-[11px] text-gray-400 font-mono"
									>
										{p.sku}
									</p>
								</div>
								<Badge variant="red">Bajo</Badge>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>

	<!-- ─── Bottom cards: Inventario + Compras ───────────────────── -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
		<div
			class="rounded-2xl bg-white ring-1 ring-gray-100 p-5 flex items-center gap-4 group hover:ring-gray-200 transition-all"
		>
			<div
				class="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-primary-50 flex items-center justify-center transition-colors"
			>
				<svg
					class="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors"
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
			<div class="flex-1 min-w-0">
				<p class="text-xs text-gray-400 font-medium">
					Valor del inventario
				</p>
				<p class="text-xl font-bold text-gray-900 mt-0.5">
					{formatCurrency(dashboard.valorTotalInventario)}
				</p>
			</div>
			<a
				href="/bodega/inventario"
				class="p-2 rounded-xl text-gray-300 hover:text-primary-500 hover:bg-primary-50 transition-colors"
				title="Ir a inventario"
			>
				<svg
					class="w-4 h-4"
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
			</a>
		</div>
		<div
			class="rounded-2xl bg-white ring-1 ring-gray-100 p-5 flex items-center gap-4 group hover:ring-gray-200 transition-all"
		>
			<div
				class="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-primary-50 flex items-center justify-center transition-colors"
			>
				<svg
					class="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-xs text-gray-400 font-medium">
					Órdenes de compra activas
				</p>
				<p class="text-xl font-bold text-gray-900 mt-0.5">
					{dashboard.ordenesCompraActivas}
				</p>
			</div>
			<a
				href="/bodega/compras"
				class="p-2 rounded-xl text-gray-300 hover:text-primary-500 hover:bg-primary-50 transition-colors"
				title="Ir a compras"
			>
				<svg
					class="w-4 h-4"
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
			</a>
		</div>
	</div>
{/if}
