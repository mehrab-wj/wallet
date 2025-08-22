import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'apple-touch-icon.png',
                'icon.svg',
                'icon.png',
            ],
            manifest: {
                name: 'Wallet',
                short_name: 'Wallet',
                start_url: '/dashboard',
                scope: '/',
                display: 'standalone',
                background_color: '#2d5cf2',
                theme_color: '#2d5cf2',
                icons: [
                    { src: '/icon.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon.png', sizes: '512x512', type: 'image/png' },
                    { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
                    { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
                navigateFallback: '/offline.html',
                runtimeCaching: [
                    {
                        urlPattern: /^https?:\/\/fonts\.bunny\.net\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'fonts',
                            expiration: {
                                maxEntries: 30,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
});
