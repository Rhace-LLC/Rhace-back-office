import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path";

import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  server: {
    port: 3500,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
