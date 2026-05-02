// ─── Moneda ───────────────────────────────────────────────────

export function formatMiles(valor: number): string {
	return new Intl.NumberFormat("es-CO").format(valor);
}

export function formatCurrency(
	valor: number,
	moneda = 'COP',
	locale = 'es-CO',
): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: moneda,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(valor);
}

export function formatNumero(valor: number, decimales = 2): string {
	return new Intl.NumberFormat('es-CO', {
		minimumFractionDigits: decimales,
		maximumFractionDigits: decimales,
	}).format(valor);
}

// ─── Fechas ───────────────────────────────────────────────────

export function formatFecha(
	fecha: string | Date,
	opciones?: Intl.DateTimeFormatOptions,
): string {
	const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
	return new Intl.DateTimeFormat('es-CO', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		...opciones,
	}).format(d);
}

export function formatFechaHora(fecha: string | Date): string {
	const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
	// Ajustar timezone Colombia (UTC-5) ya que el backend guarda en hora local Colombia
	return new Intl.DateTimeFormat('es-CO', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(d);
}

export function formatHora(fecha: string | Date): string {
	const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
	return new Intl.DateTimeFormat('es-CO', {
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(d);
}

export function fechaISO(fecha: Date = new Date()): string {
	return fecha.toISOString().slice(0, 10);
}

export function inicioMes(): string {
	const hoy = new Date();
	return new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
}

// ─── Texto ────────────────────────────────────────────────────

export function truncar(texto: string, max = 40): string {
	return texto.length > max ? `${texto.slice(0, max)}…` : texto;
}

export function capitalizar(texto: string): string {
	return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

export function slugify(texto: string): string {
	return texto
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

// ─── Cálculos POS ─────────────────────────────────────────────

const IVA = 0.12;

export function calcularSubtotal(cantidad: number, precio: number, descuento = 0): number {
	return Math.round((cantidad * precio - descuento) * 100) / 100;
}

export function calcularImpuesto(subtotal: number): number {
	return Math.round(subtotal * IVA * 100) / 100;
}

// ─── Validación ───────────────────────────────────────────────

export type Errores = Record<string, string>;

/**
 * Ejecuta un mapa de reglas y devuelve los errores encontrados.
 * Cada regla es [condición_de_error, nombre_campo, mensaje].
 */
export function validar(reglas: [boolean, string, string][]): Errores {
	const errores: Errores = {};
	for (const [falla, campo, msg] of reglas) {
		if (falla && !errores[campo]) errores[campo] = msg;
	}
	return errores;
}

export function sinErrores(e: Errores): boolean {
	return Object.keys(e).length === 0;
}

export function calcularTotal(subtotal: number, descuentoGlobal = 0): number {
	const base = subtotal - descuentoGlobal;
	return Math.round((base + calcularImpuesto(base)) * 100) / 100;
}

export function calcularVuelto(totalPagado: number, totalVenta: number): number {
	return Math.max(0, Math.round((totalPagado - totalVenta) * 100) / 100);
}

// ─── Validaciones ─────────────────────────────────────────────

export function esRucValido(ruc: string): boolean {
	return /^[0-9]{10,13}$/.test(ruc);
}

export function esEmailValido(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Misc ─────────────────────────────────────────────────────

export function debounce<T extends (...args: any[]) => any>(fn: T, ms = 300): T {
	let timer: ReturnType<typeof setTimeout>;
	return ((...args: any[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), ms);
	}) as T;
}

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}