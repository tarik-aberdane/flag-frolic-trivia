import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // HEMOS ELIMINADO componentTagger() AQUÍ
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Esto es importante para que las rutas funcionen en Electron
  base: mode === 'production' ? './' : '/',
}));
