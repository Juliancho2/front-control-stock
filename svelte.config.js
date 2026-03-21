import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: 'build',
		}),

		// Alias de paths para imports limpios
		alias: {
			$api: 'src/lib/api',
			$stores: 'src/lib/stores',
			$components: 'src/lib/components',
			$types: 'src/lib/types',
			$utils: 'src/lib/utils',
			$offline: 'src/lib/offline',
		},
	},
};

export default config;