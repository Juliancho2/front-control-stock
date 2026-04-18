// ══════════════════════════════════════════════════════════════
// Interfaces TypeScript que espejean los DTOs del backend.
// Se actualizan cuando el backend cambia un DTO.
// ══════════════════════════════════════════════════════════════

// ─── Enums ────────────────────────────────────────────────────

export type RolUsuario = 'admin' | 'cajero' | 'bodeguero';
export type TipoCliente = 'consumidor_final' | 'empresa' | 'mayorista';
export type EstadoVenta = 'pendiente' | 'pagada' | 'credito' | 'anulada';
export type TipoComprobante = 'boleta' | 'factura' | 'nota_credito' | 'proforma';
export type FormaPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'credito' | 'mixto';
export type MetodoPago = 'efectivo' | 'tarjeta_debito' | 'tarjeta_credito' | 'transferencia' | 'qr' | 'credito_cuenta';
export type EstadoTurno = 'abierto' | 'cerrado';
export type EstadoOrdenCompra = 'borrador' | 'enviada' | 'parcial' | 'recibida' | 'anulada';
export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste_positivo' | 'ajuste_negativo' | 'traslado_entrada' | 'traslado_salida' | 'devolucion_compra' | 'devolucion_venta';
// ─── Planes ───────────────────────────────────────────────────

export interface Plan {
	id: string;
	nombre: string;
	codigo: string;
	precioMensual: number;
	moneda: string;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
}

// ─── Respuesta base de la API ─────────────────────────────────

export interface ApiResponse<T> {
	success: boolean;
	data: T;
	timestamp: string;
}

export interface ApiError {
	statusCode: number;
	message: string | string[];
	error: string;
	path: string;
	timestamp: string;
}

export interface Paginado<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

// ─── Auth ─────────────────────────────────────────────────────

export interface Usuario {
	id: string;
	nombre: string;
	email: string;
	rol: RolUsuario;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface SesionActiva {
	accessToken: string;
	refreshToken: string;
	expiresIn: number;
	usuario: Pick<Usuario, 'id' | 'nombre' | 'email' | 'rol'>;
}

// ─── Categorías ───────────────────────────────────────────────

export interface Categoria {
	id: string;
	nombre: string;
	slug: string;
	descripcion: string | null;
	imagenUrl: string | null;
	parentId: string | null;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
	subcategorias?: Categoria[];
}

// ─── Productos ────────────────────────────────────────────────

export interface Producto {
	id: string;
	sku: string;
	nombre: string;
	descripcion: string | null;
	unidadMedida: string;
	precioCompra: number;
	precioVenta: number;
	precioMayorista: number | null;
	stockMinimo: number;
	imagenUrl: string | null;
	activo: boolean;
	categoriaId: string | null;
	proveedorPrincipalId: string | null;
	categoria?: Pick<Categoria, 'id' | 'nombre' | 'slug'>;
	proveedorPrincipal?: Pick<Proveedor, 'id' | 'nombre'>;
	stock?: StockBodega[];
	createdAt: string;
	updatedAt: string;
}

export interface StockBodega {
	bodegaId: string;
	bodegaNombre: string;
	cantidad: number;
	cantidadReservada: number;
	cantidadDisponible: number;
}

// ─── Proveedores ──────────────────────────────────────────────

export interface Proveedor {
	id: string;
	nombre: string;
	ruc: string | null;
	telefono: string | null;
	email: string | null;
	direccion: string | null;
	contactoNombre: string | null;
	diasCredito: number;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
}

// ─── Bodegas ──────────────────────────────────────────────────

export interface Bodega {
	id: string;
	nombre: string;
	ubicacion: string | null;
	principal: boolean;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
}

// ─── Tenants ──────────────────────────────────────────────────

export interface Tenant {
	id: string;
	nombre: string;
	slug: string;
	plan: Plan | null;
	planId: string | null;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
}

// ─── Inventario ───────────────────────────────────────────────

export interface StockItem {
	productoId: string;
	productoNombre: string;
	productoSku: string;
	bodegaId: string;
	bodegaNombre: string;
	cantidad: number;
	cantidadReservada: number;
	cantidadDisponible: number;
	stockMinimo: number;
	enStockBajo: boolean;
}

export interface MovimientoInventario {
	id: string;
	tipo: TipoMovimiento;
	cantidad: number;
	stockResultante: number;
	motivo: string | null;
	productoId: string;
	productoNombre: string;
	bodegaId: string;
	bodegaNombre: string;
	usuarioNombre: string;
	createdAt: string;
}

export interface ResumenStock {
	totalProductos: number;
	productosConStockBajo: number;
	productosSinStock: number;
	valorTotalInventario: number;
}

// ─── Clientes ─────────────────────────────────────────────────

export interface Cliente {
	id: string;
	tipo: TipoCliente;
	nombre: string;
	rucCedula: string | null;
	telefono: string | null;
	email: string | null;
	direccion: string | null;
	limiteCredito: number;
	saldoCredito: number;
	creditoDisponible: number;
	activo: boolean;
	createdAt: string;
	updatedAt: string;
}

// ─── Turnos de caja ───────────────────────────────────────────

export interface TurnoCaja {
	id: string;
	usuarioId: string;
	usuarioNombre: string;
	montoApertura: number;
	montoCierre: number | null;
	totalVentas: number;
	estado: EstadoTurno;
	abiertoEn: string;
	cerradoEn: string | null;
	observaciones: string | null;
	diferencia?: number;
}

// ─── Ventas ───────────────────────────────────────────────────

export interface VentaItem {
	id: string;
	productoId: string;
	productoNombre: string;
	productoSku: string;
	cantidad: number;
	precioUnitario: number;
	descuento: number;
	subtotal: number;
}

export interface Pago {
	id: string;
	metodo: MetodoPago;
	monto: number;
	referencia: string | null;
	createdAt: string;
}

export interface Venta {
	id: string;
	numeroFactura: string;
	tipoComprobante: TipoComprobante;
	estado: EstadoVenta;
	formaPago: FormaPago;
	subtotal: number;
	descuento: number;
	impuesto: number;
	total: number;
	clienteId: string | null;
	clienteNombre: string | null;
	usuarioId: string;
	usuarioNombre: string;
	turnoId: string;
	items: VentaItem[];
	pagos: Pago[];
	observaciones: string | null;
	createdAt: string;
}

// ─── Órdenes de compra ────────────────────────────────────────

export interface OrdenCompraItem {
	id: string;
	productoId: string;
	productoNombre: string;
	productoSku: string;
	cantidad: number;
	cantidadRecibida: number;
	cantidadPendiente: number;
	precioUnitario: number;
	subtotal: number;
}

export interface OrdenCompra {
	id: string;
	numero: string;
	proveedorId: string;
	proveedorNombre: string;
	usuarioId: string;
	usuarioNombre: string;
	total: number;
	estado: EstadoOrdenCompra;
	fechaEntrega: string | null;
	observaciones: string | null;
	items: OrdenCompraItem[];
	createdAt: string;
	updatedAt: string;
}

// ─── Reportes / Dashboard ─────────────────────────────────────

export interface Dashboard {
	ventasHoy: { cantidad: number; monto: number };
	ventasMes: { cantidad: number; monto: number };
	variacionMes: number;
	productosConStockBajo: number;
	productosSinStock: number;
	valorTotalInventario: number;
	clientesConDeuda: number;
	deudaTotalPendiente: number;
	ordenesCompraActivas: number;
}

// ─── Carrito (local, no del backend) ─────────────────────────

export interface ItemCarrito {
	productoId: string;
	sku: string;
	nombre: string;
	cantidad: number;
	precioUnitario: number;
	descuento: number;
	subtotal: number;
}