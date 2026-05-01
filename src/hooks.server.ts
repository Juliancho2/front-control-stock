import type { InfoSuscripcion, RolUsuario } from '$types/index';
import { redirect, type Handle } from '@sveltejs/kit';

// Rutas que no necesitan autenticación
const RUTAS_PUBLICAS = ['/login', '/registro', '/health', '/api/refresh', '/reset-password'];

// Mapa de rol → ruta de inicio
const INICIO_POR_ROL: Record<RolUsuario, string> = {
    superadmin: '/superadmin/dashboard',
    cajero: '/pos',
    admin: '/seleccionar-panel',
    bodeguero: '/bodega/inventario'
};

export const handle: Handle = async ({ event, resolve }) => {
    const { pathname } = event.url;


    // ─── Rutas públicas — sin validación ──────────────────────────
    if (pathname === '/' || RUTAS_PUBLICAS.some(r => pathname !== '/' && pathname.startsWith(r))) {
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

    // ─── Protección por grupo de rutas ────────────────────────────
    const rol = sesion.usuario.rol;

    if (pathname.startsWith('/superadmin') && rol !== 'superadmin') {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    if (pathname.startsWith('/seleccionar-panel') && rol !== 'admin' && rol !== 'superadmin') {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    if (pathname.startsWith('/admin') && rol !== 'admin' && rol !== 'superadmin') {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    if (pathname.startsWith('/bodega') && !['admin', 'superadmin', 'bodeguero'].includes(rol)) {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    // Rutas del cajero (grupo POS): /pos, /turno, /ventas
    const esPOS = ['/pos', '/turno', '/ventas'].some(r => pathname.startsWith(r));
    if (esPOS && rol !== 'cajero') {
        throw redirect(303, INICIO_POR_ROL[rol]);
    }

    return resolve(event);
};