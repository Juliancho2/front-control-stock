import { writable, derived, get } from 'svelte/store';
import type { SesionActiva, RolUsuario } from '$types/index';

interface AuthState {
	usuario: SesionActiva['usuario'] | null;
	accessToken: string | null;
	suscripcion: SesionActiva['suscripcion'] | null;
	cargando: boolean;
}

const inicial: AuthState = {
	usuario: null,
	accessToken: null,
	suscripcion: null,
	cargando: true,
};

function crearAuthStore() {
	const { subscribe, set, update } = writable<AuthState>(inicial);

	return {
		subscribe,

		inicializar: (sesion: SesionActiva | null) => {
			set({
				usuario: sesion?.usuario ?? null,
				accessToken: sesion?.accessToken ?? null,
				suscripcion: sesion?.suscripcion ?? null,
				cargando: false,
			});
		},

		login: (sesion: SesionActiva) => {
			set({
				usuario: sesion.usuario,
				accessToken: sesion.accessToken,
				suscripcion: sesion.suscripcion ?? null,
				cargando: false,
			});
		},

		logout: () => {
			set({ usuario: null, accessToken: null, suscripcion: null, cargando: false });
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

export const esSuperAdmin = derived(authStore, $s => $s.usuario?.rol === 'superadmin');
export const esAdmin = derived(authStore, $s => $s.usuario?.rol === 'admin' || $s.usuario?.rol === 'superadmin');
export const esCajero = derived(authStore, $s => ['cajero', 'admin'].includes($s.usuario?.rol ?? ''));
export const esBodeguero = derived(authStore, $s => ['bodeguero', 'admin'].includes($s.usuario?.rol ?? ''));

export function tieneRol(...roles: RolUsuario[]): boolean {
	const rol = get(rolActual);
	return rol !== null && (rol === 'superadmin' || rol === 'admin' || roles.includes(rol));
}