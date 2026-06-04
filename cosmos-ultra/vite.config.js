import { defineConfig } from "vite";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    compression({
      algorithm: "gzip",
      ext: ".gz"
    })
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
    open: true
  },
  preview: {
    host: "127.0.0.1",
    port: 4173
  },
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    minify: "esbuild"
  }
});
