import type { InfoSuscripcion, RolUsuario } from '$types/index';
import { redirect, type Handle } from '@sveltejs/kit';

// Rutas que no necesitan autenticación
const RUTAS_PUBLICAS = ['/login', '/registro', '/health', '/api/refresh', '/reset-password'];

// Mapa de rol → ruta de inicio
const INICIO_POR_ROL: Record<RolUsuario, string> = {
    superadmin: '/superadmin/dashboard',
    cajero: '/pos',
    admin: '/admin/dashboard',
    bodeguero: '/bodega/inventario'
};

const MODULO_POR_RUTA: Record<string, string> = {
    '/admin/dashboard': 'dashboard',
    '/admin/productos': 'productos',
    '/admin/categorias': 'categorias',
    '/admin/clientes': 'clientes',
    '/admin/ventas': 'ventas',
    '/admin/usuarios': 'usuarios',
    '/admin/suscripcion': 'suscripcion',
    '/admin/reportes': 'reportes',
    '/admin/notificaciones': 'notificaciones',
    '/bodega/inventario': 'inventario',
    '/bodega/compras': 'compras',
    '/bodega/proveedores': 'proveedores',
    '/bodega/traslados': 'traslados',
    '/bodega/recepciones': 'recepciones',
    '/bodega/notificaciones': 'notificaciones',
    '/pos/notificaciones': 'notificaciones'
};

function obtenerModulo(pathname: string): string | null {
    const match = Object.keys(MODULO_POR_RUTA).find((ruta) =>
        pathname.startsWith(ruta)
    );
    return match ? MODULO_POR_RUTA[match] : null;
}

export const handle: Handle = async ({ event, resolve }) => {
    const { pathname } = event.url;


    // ─── Rutas públicas — sin validación ──────────────────────────
    if (RUTAS_PUBLICAS.some(r => pathname.startsWith(r))) {
        return resolve(event);
    }

    // ─── Leer sesión desde cookie ─────────────────────────────────
    const sesionCookie = event.cookies.get('sesion');

    if (!sesionCookie) {
        throw redirect(303, `/login?redirectTo=${encodeURIComponent(pathname)}`);
    }

    let sesion: {
        usuario: { id: string; nombre: string; email: string; rol: RolUsuario };
        accessToken: string;
        tenantNombre?: string;
        suscripcion?: InfoSuscripcion;
    } | null = null;

    try {
        sesion = JSON.parse(sesionCookie);
    } catch {
        event.cookies.delete('sesion', { path: '/' });
        throw redirect(303, '/login');
    }

    if (!sesion?.usuario || !sesion?.accessToken) {
        event.cookies.delete('sesion', { path: '/' });
        throw redirect(303, '/login');
    }

    // ─── Exponer datos del usuario en locals ──────────────────────
    event.locals.usuario = sesion.usuario;
    event.locals.accessToken = sesion.accessToken;
    event.locals.suscripcion = sesion.suscripcion ?? null;
    event.locals.tenantNombre = sesion.tenantNombre ?? null;


    // ─── Redirigir la raíz al panel correcto según rol ────────────
    if (pathname === '/') {
        throw redirect(303, INICIO_POR_ROL[sesion.usuario.rol] ?? '/login');
    }

    // ─── Protección por grupo de rutas ────────────────────────────
    const rol = sesion.usuario.rol;

    if (pathname.startsWith('/superadmin') && rol !== 'superadmin') {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    if (pathname.startsWith('/admin') && rol !== 'admin' && rol !== 'superadmin') {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    if (pathname.startsWith('/bodega') && !['admin', 'superadmin', 'bodeguero'].includes(rol)) {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    // Solo aplica a rutas admin (puedes expandirlo luego)
    if (pathname.startsWith('/admin')) {
        const modulo = obtenerModulo(pathname);

        if (modulo) {
            // superadmin siempre pasa
            if (rol !== 'superadmin') {
                // sin suscripción o vencida → bloquear
                if (!sesion.suscripcion || ['cancelada', 'suspendida'].includes(sesion.suscripcion.estado)) {
                    throw redirect(303, '/admin/suscripcion');
                }

                // módulo bloqueado → bloquear
                if (sesion.suscripcion.modulosBloqueados?.includes(modulo)) {
                    throw redirect(303, '/admin/suscripcion');
                }
            }
        }
    }

    if (pathname.startsWith('/bodega')) {
        const modulo = obtenerModulo(pathname);

        if (modulo) {
            // superadmin siempre pasa
            if (rol !== 'superadmin') {
                // sin suscripción o vencida → bloquear
                if (!sesion.suscripcion || ['cancelada', 'suspendida'].includes(sesion.suscripcion.estado)) {
                    throw redirect(303, '/bodega/inventario');
                }

                // módulo bloqueado → bloquear
                if (sesion.suscripcion.modulosBloqueados?.includes(modulo)) {
                    throw redirect(303, '/bodega/inventario');
                }
            }
        }
    }

    if (pathname.startsWith('/pos')) {
        const modulo = obtenerModulo(pathname);
        if (modulo) {
            // superadmin siempre pasa
            if (rol !== 'superadmin') {
                // sin suscripción o vencida → bloquear
                if (!sesion.suscripcion || ['cancelada', 'suspendida'].includes(sesion.suscripcion.estado)) {
                    throw redirect(303, '/pos');
                }

                // módulo bloqueado → bloquear
                if (sesion.suscripcion.modulosBloqueados?.includes(modulo)) {
                    throw redirect(303, '/pos');
                }
            }
        }
    }
    // Rutas del cajero (grupo POS): /pos, /turno, /ventas
    const esPOS = ['/pos', '/turno', '/ventas'].some(r => pathname.startsWith(r));
    if (esPOS && rol !== 'cajero') {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    return resolve(event);
};