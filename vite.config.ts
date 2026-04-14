import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig(() => {
  const plugins = [react()];
  if (process.env.NODE_ENV !== 'development') {
    plugins.push(
      sentryVitePlugin({
        org: 'space-dashboard',
        project: 'weather-curve'
      })
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        src: '/src',
      },
    },
    build: {
      sourcemap: true,
      cssTarget: ['edge112', 'firefox117', 'chrome112', 'safari17'],
      cssMinify: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          minifyInternalExports: true,
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              switch (true) {
                case id.includes('@tanstack'):
                  return 'vendor_tanstack';
                case id.includes('axios'):
                  return 'vendor_axios';
                case id.includes('recharts') || id.includes('d3'):
                  return 'vendor_charts';
                default:
                  return 'vendor';
              }
            }
          },
        },
      },
    },
    css: {
      devSourcemap: true,
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'https://api.weathercurve.com',
          rewrite: (path) => path.replace(/^\/api/, ''),
          changeOrigin: true,
          secure: false
        },
      },
      cors: false
    }
    };
});
