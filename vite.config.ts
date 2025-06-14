
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { getDefaultProduct, API_CONFIG } from "./src/config/api-config";

export default defineConfig(({ mode }) => ({
  base: "/", // Base path for local development
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to the SwitchTransact API
      '/api': {
        target: API_CONFIG.BASE_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Authorization': getDefaultProduct().apiKey,
        }
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
