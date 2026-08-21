import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	root: "game",
	resolve: {
		alias: {
			"@": path.resolve("game/src")
		}
	},
	server: {
		port: 5173,
		proxy: {
			"/api": {
				target: "http://localhost:4000",
				changeOrigin: false,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
});