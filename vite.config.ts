import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Toskana 2026 Tatil Planı',
        short_name: 'Toskana 2026',
        description: 'Toskana 2026 aile gezisi rehberi ve çevrimdışı bütçe planlayıcı',
        theme_color: '#FFE1D0',
        background_color: '#F5EAD8',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // `woff2` matters: the app is meant to cold-start in airplane mode, and
        // without the fonts in the precache it would come up in a system
        // fallback face on exactly the trip it was built for. Only `woff2` is
        // listed — every browser that can run this app supports it, and
        // precaching the `woff` twins as well would double the font payload
        // for a fallback nothing will ever request.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webmanifest,woff2}']
      }
    })
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
