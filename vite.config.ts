import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import Sitemap from 'vite-plugin-sitemap';
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: {
        // rollup-plugin-visualizer (--mode analyze) writes a large report; never precache it
        globIgnores: ['**/stats.html'],
      },
      manifest: {
        name: 'Master-Hub',
        short_name: 'Master-Hub',
        description: 'Master-Hub — piața specialiștilor verificați din Moldova. Găsiți meșteri pentru manichiură, reparații, curățenie și multe altele.',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/brand/pwa-64x64.png', sizes: '64x64', type: 'image/png', purpose: 'any' },
          { src: '/brand/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/brand/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/brand/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
    mode === 'analyze' &&
      visualizer({
        filename: 'dist/stats.html',
        projectRoot: path.resolve(__dirname),
        template: 'treemap',
        gzipSize: true,
        brotliSize: true,
        open: process.env.CI !== 'true',
        title: 'Master-Hub — bundle',
      }),
    viteCompression({
      algorithm: 'gzip',
      threshold: 256,
      // Plugin logger uses naive `dist/` replace — breaks on Windows absolute paths (dist/A:/...)
      verbose: false,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 256,
      verbose: false,
    }),
    Sitemap({
      hostname: 'https://master-hub.md',
      dynamicRoutes: [
        '/masters',
        '/plans',
        '/faq',
        '/how-it-works',
        '/contact',
        '/privacy',
        '/terms',
      ],
      robots: [{
        userAgent: '*',
        allow: '/'
      }]
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
  },
  build: {
    // Оптимизация для production build
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    // Strip console/debugger in production
    ...(mode !== 'development' && {
      esbuild: { drop: ['console', 'debugger'] },
    }),
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'form-vendor': ['formik', 'yup'],
          'chart-vendor': ['recharts'],
          'motion-vendor': ['framer-motion'],
          'icons': ['lucide-react'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'ui-primitives': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-tooltip',
          ],
        },
      },
    },
    // Main app chunk ~875 kB minified; size-limit still enforces gzip/brotli budget
    chunkSizeWarningLimit: 950,
  },
}));
