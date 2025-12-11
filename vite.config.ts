import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  base: "/schedule-1/",
  plugins: [react()],
  server: {
    port: 5173,
  },
});
