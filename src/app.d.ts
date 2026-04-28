import type { InfoSuscripcion, RolUsuario } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			usuario: {
				id: string;
				nombre: string;
				email: string;
				rol: RolUsuario;
			} | null;
			accessToken: string | null;
			suscripcion: InfoSuscripcion | null;
		}

		interface PageData {
			usuario?: Locals['usuario'];
		}

		interface Error {
			message: string;
			code?: string;
		}
	}
}

export { };