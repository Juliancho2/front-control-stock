<script lang="ts">
	import Papa from "papaparse";
	const { parse, unparse } = Papa;
	import PageHeader from "$components/layout/PageHeader.svelte";
	import Button from "$components/ui/Button.svelte";
	import Spinner from "$components/ui/Spinner.svelte";
	import { productosApi } from "$api/productos";
	import { toastStore } from "$stores/toast.store";
	import { formatCurrency } from "$utils/index";

	export let data: { accessToken: string };
	const { accessToken } = data;

	let archivos: FileList | null = null;
	let procesando = false;
	let previsualizacion: any[] = [];
	let encabezados: string[] = [];
	let resultado: {
		total: number;
		exitosas: number;
		duplicados: number;
		errores: { fila: number; mensaje: string }[];
	} | null = null;

	const columnasRequeridas = ["sku", "nombre"];
	const columnasOpcionales = [
		"descripcion",
		"categoria",
		"proveedor",
		"unidadMedida",
		"precioCompra",
		"precioVenta",
		"precioMayorista",
		"stockMinimo",
		"stockInicial",
		"iva",
		"activo",
	];

	function manejarArchivo(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			archivos = target.files;
			leerCsv(archivos[0]);
		}
	}

	function leerCsv(file: File) {
		const reader = new FileReader();

		reader.onload = () => {
			let csv = reader.result as string;

			csv = csv
				.replace(/^\uFEFF/, "")
				.replace(/\r\n/g, "\n")
				.replace(/\r/g, "\n")
				.split("\n")
				.map((line) =>
					line
						.replace(/\t+/g, "")
						.replace(/[,;]+$/g, "")
						.trim(),
				)
				.filter((line) => line.length > 0)
				.join("\n");

			parse(csv, {
				header: false,
				skipEmptyLines: true,
				delimiter: ",",
				complete: (results) => {
					const rows = results.data as string[][];
					const rawHeaders = rows[0];

					const validIndices: number[] = [];
					const headers = rawHeaders
						.map((h, i) => {
							const clean = String(h)
								.replace(/^\uFEFF/, "")
								.trim()
								.toLowerCase();
							if (clean !== "") validIndices.push(i);
							return clean;
						})
						.filter((h) => h !== ""); // elimina headers vacíos

					// Construir objetos usando solo los índices válidos
					previsualizacion = rows
						.slice(1)
						.filter((row) =>
							row.some((cell) => String(cell).trim() !== ""),
						)
						.map((row) => {
							const obj: any = {};
							headers.forEach((h, i) => {
								obj[h] = row[validIndices[i]] ?? "";
							});
							return obj;
						});

					encabezados = headers;
				},
			});
		};

		reader.readAsText(file, "utf-8");
	}

	function parseNumeric(val: any): number {
		if (val === undefined || val === null || val === "") return 0;
		if (typeof val === "number") return val;

		let str = String(val).trim().replace(/[$\s]/g, "");
		const hasComma = str.includes(",");
		const hasDot = str.includes(".");

		if (hasComma && hasDot) {
			if (str.indexOf(",") < str.indexOf(".")) {
				// Formato US: 1,234.56
				return Number(str.replace(/,/g, "")) || 0;
			} else {
				// Formato ES: 1.234,56
				return Number(str.replace(/\./g, "").replace(",", ".")) || 0;
			}
		}

		if (hasComma) {
			const parts = str.split(",");
			// Si tiene 3 dígitos después, asumimos miles (ej: 45,000)
			if (parts[1].length === 3)
				return Number(str.replace(/,/g, "")) || 0;
			return Number(str.replace(",", ".")) || 0;
		}

		if (hasDot) {
			const parts = str.split(".");
			// Si tiene 3 dígitos después, asumimos miles (ej: 45.000)
			if (parts[1].length === 3)
				return Number(str.replace(/\./g, "")) || 0;
			return Number(str) || 0;
		}

		return Number(str) || 0;
	}

	async function importar() {
		if (previsualizacion.length === 0) return;

		procesando = true;
		try {
			// Mapeo flexible e inteligente
			const productos = previsualizacion.map((p) => {
				// Función auxiliar para buscar valores en sinónimos
				const get = (keys: string[]) => {
					for (const k of keys) {
						// Normalizar la clave para buscar
						const normK = k.toLowerCase().replace(/[\s_-]/g, "");
						// Buscar en las claves del objeto (que ya están normalizadas por transformHeader)
						for (const objKey of Object.keys(p)) {
							if (
								objKey.toLowerCase().replace(/[\s_-]/g, "") ===
								normK
							) {
								const val = p[objKey];
								if (
									val !== undefined &&
									val !== null &&
									val !== ""
								)
									return val;
							}
						}
					}
					return undefined;
				};

				return {
					sku: String(
						get(["sku", "codigo", "referencia"]) || "",
					).trim(),
					nombre: String(
						get(["nombre", "producto", "articulo"]) || "",
					).trim(),
					descripcion: get([
						"descripcion",
						"detalle",
						"info",
						"desc",
					]),
					categoria: get([
						"categoria",
						"grupo",
						"familia",
						"clase",
					])?.trim(),
					proveedor: get([
						"proveedor",
						"fabricante",
						"marca",
					])?.trim(),
					unidadMedida:
						get([
							"unidadmedida",
							"unidad_medida",
							"um",
							"unidad",
						]) || "unidad",
					precioCompra: parseNumeric(
						get([
							"preciocompra",
							"precio_compra",
							"costo",
							"compra",
						]),
					),
					precioVenta: parseNumeric(
						get(["precioventa", "precio_venta", "precio", "venta"]),
					),
					precioMayorista: get([
						"preciomayorista",
						"precio_mayorista",
						"mayorista",
					])
						? parseNumeric(
								get([
									"preciomayorista",
									"precio_mayorista",
									"mayorista",
								]),
							)
						: undefined,
					stockMinimo: parseNumeric(
						get([
							"stockminimo",
							"stock_minimo",
							"minimo",
							"stockmin",
						]),
					),
					stockInicial: parseNumeric(
						get([
							"stockinicial",
							"stock_inicial",
							"inicial",
							"stockini",
						]),
					),
					iva: parseNumeric(get(["iva", "impuesto", "tax"])),
					activo:
						get(["activo", "status", "estado"]) === "false"
							? false
							: true,
				};
			});

			const res = await productosApi.importar(productos, accessToken);
			resultado = res;

			if (res.exitosas > 0) {
				toastStore.exito(
					`${res.exitosas} productos importados correctamente`,
				);
			}
			if (res.errores.length > 0) {
				toastStore.advertencia(
					`Hubo ${res.errores.length} errores al importar`,
				);
			}
		} catch (err: any) {
			toastStore.error(
				err?.mensajes?.[0] ?? "Error al procesar la importación",
			);
		} finally {
			procesando = false;
		}
	}

	function descargarPlantilla() {
		const headers = [...columnasRequeridas, ...columnasOpcionales];
		const csv = unparse([headers]);
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", "plantilla_productos.csv");
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}
</script>

<svelte:head>
	<title>Importar Productos — FerreControl</title>
</svelte:head>

<PageHeader titulo="Importar Productos">
	<Button variant="secondary" href="/admin/productos"
		>Volver al listado</Button
	>
</PageHeader>

<div class="max-w-5xl mx-auto space-y-6 pb-20">
	<!-- Paso 1: Subir Archivo -->
	<section class="card p-6">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-lg font-semibold text-gray-800">
				1. Seleccionar archivo CSV
			</h2>
			<button
				class="text-sm text-primary-600 hover:underline font-medium"
				onclick={descargarPlantilla}
			>
				Descargar plantilla CSV
			</button>
		</div>

		<div
			class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer bg-gray-50"
			role="button"
			tabindex="0"
			onclick={() => document.getElementById("csv-input")?.click()}
			onkeydown={(e) =>
				e.key === "Enter" &&
				document.getElementById("csv-input")?.click()}
		>
			<input
				id="csv-input"
				type="file"
				accept=".csv"
				class="hidden"
				onchange={manejarArchivo}
			/>
			<svg
				class="w-12 h-12 text-gray-400 mx-auto mb-4"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/>
			</svg>
			<p class="text-gray-600">
				{archivos
					? archivos[0].name
					: "Haz clic para subir o arrastra un archivo CSV"}
			</p>
			<p class="text-xs text-gray-400 mt-2">
				Asegúrate de que las columnas coincidan con la plantilla (sku,
				nombre, etc.)
			</p>
		</div>
	</section>

	{#if previsualizacion.length > 0}
		<!-- Paso 2: Previsualización -->
		<section class="card p-6 space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-gray-800">
					2. Previsualización ({previsualizacion.length} filas)
				</h2>
				<Button
					variant="primary"
					onclick={importar}
					disabled={procesando}
				>
					{#if procesando}
						<span class="mr-1">
							<Spinner size="sm" />
						</span>
						Procesando...
					{:else}
						Confirmar e Importar
					{/if}
				</Button>
			</div>

			<div class="table-container">
				<table class="table">
					<thead>
						<tr>
							{#each encabezados as h}
								<th>{h}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each previsualizacion.slice(0, 10) as fila}
							<tr>
								{#each encabezados as h}
									<td>{fila[h] ?? "—"}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if previsualizacion.length > 10}
				<p class="text-xs text-gray-400 text-center">
					Mostrando solo las primeras 10 filas de {previsualizacion.length}
				</p>
			{/if}
		</section>
	{/if}

	{#if resultado}
		<!-- Paso 3: Resultados -->
		<section
			class="card p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4"
		>
			<h2 class="text-lg font-semibold text-gray-800">
				Resultado de la Importación
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div
					class="p-4 bg-primary-50 border border-primary-100 rounded-xl text-center"
				>
					<p class="text-xs text-primary-600 font-bold uppercase">
						Procesados
					</p>
					<p class="text-2xl font-black text-primary-700">
						{resultado.total}
					</p>
				</div>
				<div
					class="p-4 bg-success-50 border border-success-100 rounded-xl text-center"
				>
					<p class="text-xs text-success-600 font-bold uppercase">
						Exitosos
					</p>
					<p class="text-2xl font-black text-success-700">
						{resultado.exitosas}
					</p>
				</div>
				<div
					class="p-4 bg-warning-50 border border-warning-100 rounded-xl text-center"
				>
					<p class="text-xs text-warning-600 font-bold uppercase">
						Duplicados
					</p>
					<p class="text-2xl font-black text-warning-700">
						{resultado.duplicados}
					</p>
				</div>
			</div>

			{#if resultado.errores.length > 0}
				<div class="mt-4">
					<h3 class="text-sm font-bold text-danger-600 mb-2">
						Errores encontrados:
					</h3>
					<div
						class="bg-danger-50 border border-danger-100 rounded-lg p-3 max-h-40 overflow-y-auto"
					>
						<ul class="space-y-1">
							{#each resultado.errores as err}
								<li class="text-xs text-danger-700">
									<span class="font-bold"
										>Fila {err.fila}:</span
									>
									{err.mensaje}
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}

			<div class="flex justify-center pt-2">
				<Button variant="secondary" href="/admin/productos"
					>Volver al listado</Button
				>
			</div>
		</section>
	{/if}
</div>
