import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  // base: './' asegura que los archivos JS y CSS se busquen dentro de la carpeta del juego
  // y no en la raíz del disco duro (arregla la pantalla en blanco).
  base: './',
  
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Definimos dónde se guardará la compilación
    outDir: 'dist',
    // Limpia la carpeta antes de construir una nueva
    emptyOutDir: true,
    // Organiza los assets en una subcarpeta
    assetsDir: 'assets',
    // Esto ayuda a que el build sea más compatible con entornos antiguos
    target: 'esnext',
    // Evita problemas de carga de archivos grandes
    chunkSizeWarningLimit: 1000,
  },
});
