import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    base: "/investment-watchlist/",
    build: { sourcemap: false },
    plugins: [react()],
});