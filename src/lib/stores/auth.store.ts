import { writable, derived, get } from 'svelte/store';
import type { SesionActiva, RolUsuario, InfoSuscripcion } from '$types/index';
import { carritoStore } from './carrito.store';

interface AuthState {
	usuario: SesionActiva['usuario'] | null;
	accessToken: string | null;
	suscripcion: InfoSuscripcion | null;
	tenantNombre: string | null;
	cargando: boolean;
}

const inicial: AuthState = {
	usuario: null,
	accessToken: null,
	suscripcion: null,
	tenantNombre: null,
	cargando: true,
};

function crearAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(inicial);

	return {
		subscribe,

		inicializar: (sesion: SesionActiva | null) => {
			if (!sesion) {
				carritoStore.limpiar();
			}
			set({
				usuario: sesion?.usuario ?? null,
				accessToken: sesion?.accessToken ?? null,
				suscripcion: sesion?.suscripcion ?? null,
				tenantNombre: sesion?.tenantNombre ?? null,
				cargando: false,
			});
		},

		login: (sesion: SesionActiva) => {
			set({
				usuario: sesion.usuario,
				accessToken: sesion.accessToken,
				suscripcion: sesion.suscripcion ?? null,
				tenantNombre: sesion.tenantNombre ?? null,
				cargando: false,
			});
		},

		logout: () => {
			carritoStore.limpiar();
			set({ usuario: null, accessToken: null, suscripcion: null, tenantNombre: null, cargando: false });
		},

		get token(): string | null {
			return get({ subscribe }).accessToken;
		},
	};
}

export const authStore = crearAuthStore();

// Derivados útiles en templates
export const usuarioActual = derived(authStore, $s => $s.usuario);
export const rolActual = derived(authStore, $s => $s.usuario?.rol ?? null);
export const suscripcionActual = derived(authStore, $s => $s.suscripcion);
export const estaAutenticado = derived(authStore, $s => $s.usuario !== null);
export const nombreNegocioActual = derived(authStore, $s => $s.tenantNombre);

export const esSuperAdmin = derived(authStore, $s => $s.usuario?.rol === 'superadmin');
export const esAdmin = derived(authStore, $s => $s.usuario?.rol === 'admin' || $s.usuario?.rol === 'superadmin');
export const esCajero = derived(authStore, $s => ['cajero', 'admin'].includes($s.usuario?.rol ?? ''));
export const esBodeguero = derived(authStore, $s => ['bodeguero', 'admin'].includes($s.usuario?.rol ?? ''));

export function tieneRol(...roles: RolUsuario[]): boolean {
	const rol = get(rolActual);
	return rol !== null && (rol === 'superadmin' || rol === 'admin' || roles.includes(rol));
}

export const suscripcionVigente = derived(authStore, $s => {
	if (!$s.suscripcion) return false;
	return $s.suscripcion.estaVigente;
});

export const puedeCrearContenido = derived(authStore, $s => {
	const rol = $s.usuario?.rol;
	if (rol === 'superadmin') return true;
	if ($s.usuario?.rol === 'admin' && $s.suscripcion?.estaVigente) return true;
	return false;
});

export const puedeRegistrarVentas = derived(authStore, $s => {
	const rol = $s.usuario?.rol;
	if (rol === 'superadmin') return true;
	if (!$s.suscripcion?.estaVigente) return false;
	if (rol === 'cajero' || rol === 'admin') return true;
	return false;
});

export function tieneAcceso(modulo: string): boolean {
	const state = get(authStore);
	if (state.usuario?.rol === 'superadmin') return true;
	if (!state.suscripcion) return false;
	if (!state.suscripcion.estaVigente) return false;
	return !state.suscripcion.modulosBloqueados?.includes(modulo);
}

export const permiteExcel = derived(authStore, $s => {
	if ($s.usuario?.rol === 'superadmin') return true;
	return $s.suscripcion?.permiteExcel ?? true;
});

export const permiteAlertas = derived(authStore, $s => {
	if ($s.usuario?.rol === 'superadmin') return true;
	return $s.suscripcion?.permiteAlertas ?? true;
});