<script lang="ts">
	import { onMount } from "svelte";
	import PageHeader from "$components/layout/PageHeader.svelte";
	import Spinner from "$components/ui/Spinner.svelte";
	import Badge from "$components/ui/Badge.svelte";
	import Button from "$components/ui/Button.svelte";
	import { reportesApi } from "$api/reportes";
	import { productosApi } from "$api/productos";
	import { toastStore } from "$stores/toast.store";
	import {
		formatCurrency,
		formatFecha,
		fechaISO,
		inicioMes,
	} from "$utils/index";
	import type { Dashboard, Producto } from "$types/index";

	export let data: { accessToken: string };
	const { accessToken } = data;

	let cargando = true;
	let dashboard: Dashboard | null = null;
	let stockBajo: Producto[] = [];
	let tendencia: any[] = [];

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
			stockBajo = productos.slice(0, 10);
			tendencia = Array.isArray(trend) ? trend : [];
		} catch (e: any) {
			toastStore.error(e?.mensajes?.[0] ?? "Error al cargar dashboard");
		} finally {
			cargando = false;
		}
	});

	// Barra más alta para escala del gráfico
	$: maxVenta =
		tendencia.length > 0
			? Math.max(...tendencia.map((d: any) => d.monto ?? 0), 1)
			: 1;
</script>

<svelte:head><title>Dashboard — Ferretería ERP</title></svelte:head>

<PageHeader titulo="Dashboard" />

{#if cargando}
	<div class="flex items-center justify-center py-20">
		<Spinner size="lg" />
	</div>
{:else if dashboard}
	<!-- KPIs -->
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
		<!-- Ventas hoy -->
		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p
							class="text-xs text-gray-500 uppercase tracking-wide"
						>
							Ventas hoy
						</p>
						<p class="text-2xl font-bold text-gray-900 mt-1">
							{formatCurrency(dashboard.ventasHoy.monto)}
						</p>
						<p class="text-xs text-gray-400 mt-0.5">
							{dashboard.ventasHoy.cantidad} transacciones
						</p>
					</div>
					<div
						class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"
					>
						<svg
							class="w-5 h-5 text-primary-500"
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
				</div>
			</div>
		</div>

		<!-- Ventas mes -->
		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p
							class="text-xs text-gray-500 uppercase tracking-wide"
						>
							Ventas del mes
						</p>
						<p class="text-2xl font-bold text-gray-900 mt-1">
							{formatCurrency(dashboard.ventasMes.monto)}
						</p>
						<p
							class="text-xs mt-0.5 {dashboard.variacionMes >= 0
								? 'text-primary-600'
								: 'text-danger-600'}"
						>
							{dashboard.variacionMes >= 0
								? "+"
								: ""}{dashboard.variacionMes.toFixed(1)}% vs mes
							anterior
						</p>
					</div>
					<div
						class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"
					>
						<svg
							class="w-5 h-5 text-blue-500"
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
				</div>
			</div>
		</div>

		<!-- Stock bajo -->
		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p
							class="text-xs text-gray-500 uppercase tracking-wide"
						>
							Stock bajo
						</p>
						<p class="text-2xl font-bold text-gray-900 mt-1">
							{dashboard.productosConStockBajo}
						</p>
						<p class="text-xs text-gray-400 mt-0.5">
							{dashboard.productosSinStock} sin stock
						</p>
					</div>
					<div
						class="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center"
					>
						<svg
							class="w-5 h-5 text-warning-500"
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
				</div>
			</div>
		</div>

		<!-- Cuentas por cobrar -->
		<div class="card">
			<div class="card-body">
				<div class="flex items-center justify-between">
					<div>
						<p
							class="text-xs text-gray-500 uppercase tracking-wide"
						>
							Cuentas por cobrar
						</p>
						<p class="text-2xl font-bold text-gray-900 mt-1">
							{formatCurrency(dashboard.deudaTotalPendiente)}
						</p>
						<p class="text-xs text-gray-400 mt-0.5">
							{dashboard.clientesConDeuda} clientes
						</p>
					</div>
					<div
						class="w-10 h-10 rounded-xl bg-danger-50 flex items-center justify-center"
					>
						<svg
							class="w-5 h-5 text-danger-500"
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
				</div>
			</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
		<!-- Gráfico de ventas (barras simples CSS) -->
		<div class="lg:col-span-2 card">
			<div class="card-header">Ventas del mes (diario)</div>
			<div class="card-body">
				{#if tendencia.length === 0}
					<p class="text-sm text-gray-400 text-center py-8">
						Sin datos de tendencia
					</p>
				{:else}
					<div class="flex items-end gap-1 h-48">
						{#each tendencia as dia}
							<div
								class="flex-1 flex flex-col items-center gap-1"
							>
								<div
									class="w-full bg-primary-400 rounded-t-sm min-h-[2px] transition-all"
									style="height: {((dia.monto ?? 0) /
										maxVenta) *
										100}%"
									title="{formatFecha(
										dia.fecha,
									)}: {formatCurrency(dia.monto ?? 0)}"
								></div>
							</div>
						{/each}
					</div>
					<div
						class="flex justify-between text-xs text-gray-400 mt-2"
					>
						<span
							>{tendencia.length > 0
								? formatFecha(tendencia[0].fecha)
								: ""}</span
						>
						<span
							>{tendencia.length > 0
								? formatFecha(
										tendencia[tendencia.length - 1].fecha,
									)
								: ""}</span
						>
					</div>
				{/if}
			</div>
		</div>

		<!-- Alertas de stock bajo -->
		<div class="card">
			<div class="card-header flex items-center justify-between">
				<span>Alertas de stock</span>
				<Button
					variant="link"
					size="sm"
					href="/admin/productos?stockBajo=true">Ver todos</Button
				>
			</div>
			<div class="card-body p-0">
				{#if stockBajo.length === 0}
					<p class="text-sm text-gray-400 text-center py-8">
						Todo en orden
					</p>
				{:else}
					<ul class="divide-y divide-gray-100">
						{#each stockBajo as p}
							<li
								class="px-4 py-3 flex items-center justify-between"
							>
								<div class="min-w-0 flex-1">
									<p
										class="text-sm font-medium text-gray-900 truncate"
									>
										{p.nombre}
									</p>
									<p class="text-xs text-gray-400">{p.sku}</p>
								</div>
								<Badge variant="red">Bajo</Badge>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>

	<!-- Resumen extra -->
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
		<div class="card">
			<div class="card-body flex items-center gap-4">
				<div
					class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
				>
					<svg
						class="w-5 h-5 text-gray-500"
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
				<div>
					<p class="text-sm text-gray-500">Valor del inventario</p>
					<p class="text-lg font-bold text-gray-900">
						{formatCurrency(dashboard.valorTotalInventario)}
					</p>
				</div>
			</div>
		</div>
		<div class="card">
			<div class="card-body flex items-center gap-4">
				<div
					class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
				>
					<svg
						class="w-5 h-5 text-gray-500"
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
				<div>
					<p class="text-sm text-gray-500">
						Órdenes de compra activas
					</p>
					<p class="text-lg font-bold text-gray-900">
						{dashboard.ordenesCompraActivas}
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}
