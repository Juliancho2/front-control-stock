/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const CACHE = `cache-${version}`;
const API_CACHE = `api-cache-${version}`;

const ASSETS = [
	...build,
	...files
];

// API paths that should be cached for offline use
const CACHEABLE_API = ['/api/v1/productos', '/api/v1/categorias'];

self.addEventListener('install', (event: any) => {
	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event: any) => {
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE && key !== API_CACHE) {
				await caches.delete(key);
			}
		}
	}
	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event: any) => {
	const url = new URL(event.request.url);

	// Skip non-GET requests
	if (event.request.method !== 'GET') return;

	// Handle API requests with network-first, cache-fallback
	if (CACHEABLE_API.some(path => url.pathname.startsWith(path))) {
		event.respondWith(networkFirstAPI(event.request));
		return;
	}

	// Handle app assets with cache-first
	event.respondWith(cacheFirst(event.request, url));
});

async function cacheFirst(request: Request, url: URL): Promise<Response> {
	const cache = await caches.open(CACHE);

	if (ASSETS.includes(url.pathname)) {
		const cached = await cache.match(url.pathname);
		if (cached) return cached;
	}

	try {
		const response = await fetch(request);
		if (response.status === 200) {
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await cache.match(request);
		if (cached) return cached;

		// Return offline fallback for navigation requests
		if (request.mode === 'navigate') {
			const fallback = await cache.match('/');
			if (fallback) return fallback;
		}

		return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
	}
}

async function networkFirstAPI(request: Request): Promise<Response> {
	const cache = await caches.open(API_CACHE);

	try {
		const response = await fetch(request);
		if (response.status === 200) {
			cache.put(request, response.clone());
		}
		return response;
	} catch {
		const cached = await cache.match(request);
		if (cached) return cached;
		return new Response(JSON.stringify({ success: false, data: [], message: 'Offline' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}

// Listen for sync events to process queued sales
self.addEventListener('message', (event: any) => {
	if (event.data?.type === 'SKIP_WAITING') {
		(self as any).skipWaiting();
	}
});
