import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png', 'icons/*.svg'],
        manifest: {
          name: 'Notary - Note Taking App',
          short_name: 'Notary',
          description: 'Secure, fast note-taking. Create, organize, and manage your notes from anywhere.',
          theme_color: '#09090b',
          background_color: '#09090b',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            { src: 'icons/favicon-16.png',       sizes: '16x16',   type: 'image/png' },
            { src: 'icons/favicon-32.png',       sizes: '32x32',   type: 'image/png' },
            { src: 'icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
            { src: 'icons/icon-192.png',         sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
            { src: 'icons/icon-512.png',         sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /^https:\/\/.*\.onrender\.com\/api\/.*/i,
              handler: 'NetworkOnly',
            },
            {
              urlPattern: /\/uploads\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'uploads-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      }),
    ],
    // Dev proxy — only used when running `npm run dev`
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:5001',
          changeOrigin: true,
        },
      },
    },
  }
})
