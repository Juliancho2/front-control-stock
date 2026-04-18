import { env } from '$env/dynamic/public';
import { goto } from '$app/navigation';
import type { ApiError, ApiResponse } from '$types/index';

// ─── Configuración ────────────────────────────────────────────
const API_BASE = env.PUBLIC_API_URL ?? 'http://localhost:3000'

// ─── Error tipado ─────────────────────────────────────────────

export class ApiException extends Error {
	constructor(
		public readonly statusCode: number,
		public readonly errores: string | string[],
		public readonly error: string,
	) {
		super(Array.isArray(errores) ? errores[0] : errores);
		this.name = 'ApiException';
	}

	get mensajes(): string[] {
		return Array.isArray(this.errores) ? this.errores : [this.errores];
	}

	get esSinAutorizacion(): boolean { return this.statusCode === 401; }
	get esProhibido(): boolean { return this.statusCode === 403; }
	get esNoEncontrado(): boolean { return this.statusCode === 404; }
	get esConflicto(): boolean { return this.statusCode === 409; }
	get esValidacion(): boolean { return this.statusCode === 400; }
}

// ─── Token en memoria (NO en localStorage) ───────────────────

let _accessToken: string | null = null;

/** Llamado desde el layout al inicializar con datos del servidor */
export function setAccessToken(token: string | null): void {
	_accessToken = token;
}

export function getToken(): string | null {
	return _accessToken;
}

export function limpiarTokens(): void {
	_accessToken = null;
}

// ─── Refresh automático (via endpoint server-side) ────────────

let refreshPromise: Promise<string> | null = null;

async function refrescarToken(): Promise<string> {
	if (refreshPromise) return refreshPromise;

	refreshPromise = (async () => {
		// Llama al endpoint SvelteKit que usa las cookies httpOnly
		const res = await fetch('/api/refresh', { method: 'POST' });

		if (!res.ok) {
			limpiarTokens();
			goto('/login');
			throw new Error('Sesión expirada');
		}

		const { accessToken } = await res.json();
		_accessToken = accessToken;
		return accessToken;
	})().finally(() => {
		refreshPromise = null;
	});

	return refreshPromise;
}

// ─── Función base ─────────────────────────────────────────────

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface FetchOptions {
	token?: string;      // para SSR donde no hay localStorage
	signal?: AbortSignal;
}

async function apiFetch<T>(
	path: string,
	method: HttpMethod = 'GET',
	body?: unknown,
	opts: FetchOptions = {},
): Promise<T> {
	const token = opts.token ?? getToken();

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
	};

	if (token) headers['Authorization'] = `Bearer ${token}`;

	const res = await fetch(`${API_BASE}/api/v1${path}`, {
		method,
		headers,
		body: body !== undefined ? JSON.stringify(body) : undefined,
		signal: opts.signal,
	});
	// Token expirado — intentar refresh y reintentar una vez
	if (res.status === 401 && browser) {
		try {
			const nuevoToken = await refrescarToken();
			headers['Authorization'] = `Bearer ${nuevoToken}`;

			const retry = await fetch(`${API_BASE}/api/v1${path}`, {
				method,
				headers,
				body: body !== undefined ? JSON.stringify(body) : undefined,
				signal: opts.signal,
			});

			return procesarRespuesta<T>(retry);
		} catch {
			limpiarTokens();
			goto('/login');
			throw new ApiException(401, 'Sesión expirada', 'Unauthorized');
		}
	}

	return procesarRespuesta<T>(res);
}

async function procesarRespuesta<T>(res: Response): Promise<T> {
	// 204 No Content — sin body
	if (res.status === 204) return undefined as T;

	const json = await res.json().catch(() => ({}));

	if (!res.ok) {
		const err = json as ApiError;
		throw new ApiException(
			res.status,
			err.message ?? 'Error desconocido',
			err.error ?? 'Error',
		);
	}

	// La API envuelve todo en { success, data, timestamp }
	const wrapped = json as ApiResponse<T>;
	return wrapped.data ?? (json as T);
}

// ─── Exports convenientes ─────────────────────────────────────

export const api = {
	get: <T>(path: string, opts?: FetchOptions) =>
		apiFetch<T>(path, 'GET', undefined, opts),

	post: <T>(path: string, body: unknown, opts?: FetchOptions) =>
		apiFetch<T>(path, 'POST', body, opts),

	patch: <T>(path: string, body: unknown, opts?: FetchOptions) =>
		apiFetch<T>(path, 'PATCH', body, opts),

	delete: <T>(path: string, opts?: FetchOptions) =>
		apiFetch<T>(path, 'DELETE', undefined, opts),
};