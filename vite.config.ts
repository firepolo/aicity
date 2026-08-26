import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	root: "game",
	assetsInclude: ["**/*.vs", "**/*.fs", "**/*.obj"],
	build: {
		outDir: "./build/game"
	},
	resolve: {
		alias: {
			"@": path.resolve("game/src"),
			"@shared": path.resolve("shared"),
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