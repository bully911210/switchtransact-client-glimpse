import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/", // Base path for local development
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the SwitchTransact API
      '/api': {
        target: 'https://app.switchtransact.com/api/1.0',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Log the full request details
            console.log('Sending Request to the Target:', req.method, req.url);
            console.log('Request headers:', JSON.stringify(proxyReq.getHeaders(), null, 2));

            // Make sure the Authorization header is properly set
            if (!proxyReq.getHeader('Authorization')) {
              proxyReq.setHeader('Authorization', 'e68066d75428a2a405798eef139cc89749c75cda5445d7ac92dbb9e9383bd76b');
              console.log('Added missing Authorization header');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            // Log response headers for debugging
            console.log('Response headers:', JSON.stringify(proxyRes.headers, null, 2));
          });
        },
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
