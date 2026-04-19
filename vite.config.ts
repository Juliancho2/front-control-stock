import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 5173
    }
  },
  plugins: [
    sveltekit()

    // SvelteKitPWA({
    //   registerType: 'autoUpdate',
    //   workbox: {
    //     // Cachea todos los assets del build
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    //     // Estrategia: network first para la API, cache first para assets
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https?:\/\/.*\/api\/.*/,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 5 * 60, // 5 minutos
    //           },
    //         },
    //       },
    //     ],
    //   },
    //   manifest: {
    //     name: 'FerreControl',
    //     short_name: 'Ferretería',
    //     description: 'Sistema de gestión para ferretería',
    //     theme_color: '#1D9E75',
    //     background_color: '#ffffff',
    //     display: 'standalone',
    //     start_url: '/',
    //     icons: [
    //       { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    //       { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    //     ],
    //   },
    // }),
  ],
});